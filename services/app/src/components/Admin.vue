<template>
  <div>
    <h1>Admin Dashboard</h1>

    <div v-if="!adminToken">
      <h2>Admin Login</h2>
      <form @submit.prevent="loginAdmin">
        <div>
          <label for="admin-email">Email</label>
          <input id="admin-email" v-model="email" type="email" required />
        </div>

        <div>
          <label for="admin-password">Password</label>
          <input id="admin-password" v-model="password" type="password" required />
        </div>

        <button type="submit">Login</button>
      </form>
    </div>

    <div v-else>
      <button type="button" @click="logoutAdmin">Logout</button>

      <h2>Song Request Queue</h2>

      <div v-if="backlog.length === 0">No requests found.</div>

      <ul v-else>
        <li v-for="song in backlog" :key="song.id">
          <div>Title: {{ song.song_title }}</div>
          <div>Artist: {{ song.artist }}</div>
          <div>Status: {{ song.status }}</div>
          <div v-if="song.status === 'queued'">Queue Position: {{ song.queue_order }}</div>

          <button
            v-if="song.status === 'pending'"
            type="button"
            @click="approveToQueue(song.id)"
          >
            Approve into Queue
          </button>

          <button
            v-else-if="song.status === 'queued'"
            type="button"
            @click="completeSong(song.id)"
          >
            Mark Completed
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { neon } from '@neondatabase/serverless';

const AUTH_BASE_URL =
  'https://ep-restless-poetry-atqgt9xo.neonauth.c-9.us-east-1.aws.neon.tech/neondb/auth';

const connectionString = import.meta.env.VITE_NEON_API_URL;

const adminToken = ref('');
const email = ref('');
const password = ref('');
const backlog = ref([]);

function getSqlClient() {
  if (!connectionString) {
    throw new Error('VITE_NEON_API_URL is missing from environment variables.');
  }

  if (!adminToken.value) {
    throw new Error('Admin token is missing. Please log in again.');
  }

  return neon(connectionString, { authToken: adminToken.value });
}

function extractAuthToken(payload) {
  const candidates = [
    payload?.token,
    payload?.session,
    payload?.sessionToken,
    payload?.data?.token,
    payload?.data?.session,
    payload?.data?.sessionToken,
    payload?.session?.token,
    payload?.session?.id,
  ];

  return candidates.find((value) => typeof value === 'string' && value.length > 0) || '';
}

async function loginAdmin() {
  try {
    const origin = window?.location?.origin || 'http://localhost:3000';

    const response = await fetch(`${AUTH_BASE_URL}/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: origin,
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      const message = payload?.message || payload?.error || `Login failed with status ${response.status}.`;
      throw new Error(message);
    }

    const token = extractAuthToken(payload);
    if (!token) {
      throw new Error('Login succeeded but no token/session identifier was returned.');
    }

    adminToken.value = token;
    await loadRequests();
  } catch (error) {
    alert(`Admin login failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function loadRequests() {
  try {
    const sql = getSqlClient();
    const rows = await sql`
      SELECT *
      FROM song_requests
      ORDER BY
        CASE WHEN status = 'queued' THEN 1 ELSE 2 END,
        queue_order ASC,
        created_at DESC
    `;

    backlog.value = rows;
  } catch (error) {
    alert(`Failed to load queue requests: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function approveToQueue(id) {
  try {
    const sql = getSqlClient();
    const result = await sql`
      SELECT MAX(queue_order) as max_order
      FROM song_requests
      WHERE status = 'queued'
    `;

    const maxOrder = Number(result?.[0]?.max_order) || 0;
    const nextOrder = maxOrder + 1;

    await sql`
      UPDATE song_requests
      SET status = 'queued', queue_order = ${nextOrder}
      WHERE id = ${id}
    `;

    await loadRequests();
  } catch (error) {
    alert(`Failed to approve song into queue: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function completeSong(id) {
  try {
    const sql = getSqlClient();
    await sql`
      UPDATE song_requests
      SET status = 'completed', queue_order = 0
      WHERE id = ${id}
    `;

    await loadRequests();
  } catch (error) {
    alert(`Failed to mark song completed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function logoutAdmin() {
  adminToken.value = '';
  email.value = '';
  password.value = '';
  backlog.value = [];
}

onMounted(async () => {
  if (adminToken.value) {
    await loadRequests();
  }
});
</script>
