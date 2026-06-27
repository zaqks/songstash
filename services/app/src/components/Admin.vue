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
          <div v-if="song.status === QUEUED_STATUS">Queue Position: {{ song.queue_order }}</div>

          <button
            v-if="song.status === PENDING_STATUS"
            type="button"
            @click="approveToQueue(song.id)"
          >
            Approve into Queue
          </button>

          <button
            v-else-if="song.status === QUEUED_STATUS"
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
import { SongRequestStatus } from '../models/songRequest';
import { signInAdmin } from '../services/adminAuthService';
import {
  approveSongRequestToQueue,
  completeSongRequest,
  getAdminSongRequests,
} from '../services/songRequestService';

const adminToken = ref('');
const email = ref('');
const password = ref('');
const backlog = ref([]);

async function loginAdmin() {
  try {
    adminToken.value = await signInAdmin({
      email: email.value,
      password: password.value,
    });
    await loadRequests();
  } catch (error) {
    alert(`Admin login failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function loadRequests() {
  try {
    backlog.value = await getAdminSongRequests(adminToken.value);
  } catch (error) {
    alert(`Failed to load queue requests: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function approveToQueue(id) {
  try {
    await approveSongRequestToQueue(adminToken.value, id);
    await loadRequests();
  } catch (error) {
    alert(`Failed to approve song into queue: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function completeSong(id) {
  try {
    await completeSongRequest(adminToken.value, id);
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

const PENDING_STATUS = SongRequestStatus.Pending;
const QUEUED_STATUS = SongRequestStatus.Queued;
</script>
