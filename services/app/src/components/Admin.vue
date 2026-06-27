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

      <!-- Search Bar -->
      <div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by song title or artist..."
        />
      </div>

      <!-- Filters -->
      <div>
        <div>
          <label for="status-filter">Filter by Status:</label>
          <select id="status-filter" v-model="selectedStatuses" multiple>
            <option :value="SongRequestStatus.Pending">Pending</option>
            <option :value="SongRequestStatus.Practicing">Practicing</option>
            <option :value="SongRequestStatus.Released">Released</option>
          </select>
        </div>

        <div>
          <label for="artist-filter">Filter by Artist:</label>
          <select id="artist-filter" v-model="selectedArtist">
            <option value="">All Artists</option>
            <option v-for="artist in uniqueArtists" :key="artist" :value="artist">
              {{ artist }}
            </option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div v-if="filteredSongs.length === 0">No requests found.</div>

      <table v-else>
        <thead>
          <tr>
            <th>Song Title</th>
            <th>Artist</th>
            <th>Status</th>
            <th>Queue Order</th>
            <th>Last Modified</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="song in filteredSongs" :key="song.id">
            <td>{{ song.song_title }}</td>
            <td>{{ song.artist }}</td>
            <td>{{ song.status }}</td>
            <td>{{ song.queue_order }}</td>
            <td>{{ formatDate(song.last_modified_at) }}</td>
            <td>
              <button
                v-if="song.status === SongRequestStatus.Pending"
                type="button"
                @click="approveToQueue(song.id)"
              >
                Approve to Practicing
              </button>

              <button
                v-else-if="song.status === SongRequestStatus.Practicing"
                type="button"
                @click="completeSong(song.id)"
              >
                Mark Released
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { SongRequestStatus } from '../models/songRequest';
import { signInAdmin } from '../services/adminAuthService';
import { loadAdminToken, clearAdminToken } from '../services/adminSessionService';
import {
  approveSongRequestToQueue,
  completeSongRequest,
  getAdminSongRequests,
} from '../services/songRequestService';
import { withLoading } from '../services/loadingHelper';

const adminToken = ref('');
const email = ref('');
const password = ref('');
const backlog = ref([]);
const searchQuery = ref('');
const selectedArtist = ref('');
const selectedStatuses = ref([SongRequestStatus.Pending, SongRequestStatus.Practicing]);

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
    backlog.value = await withLoading(
      () => getAdminSongRequests(adminToken.value),
      'Loading song requests...'
    );
  } catch (error) {
    alert(`Failed to load queue requests: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function approveToQueue(id) {
  try {
    await withLoading(
      () => approveSongRequestToQueue(adminToken.value, id),
      'Approving song to practicing...'
    );
    await loadRequests();
  } catch (error) {
    alert(`Failed to approve song into queue: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function completeSong(id) {
  try {
    await withLoading(
      () => completeSongRequest(adminToken.value, id),
      'Marking song as released...'
    );
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
  try {
    clearAdminToken();
  } catch (e) {
    console.warn('Failed to clear persisted admin token', e);
  }
}

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString();
}

// Computed properties
const uniqueArtists = computed(() => {
  return [...new Set(backlog.value.map((song) => song.artist))].sort();
});

const filteredSongs = computed(() => {
  return backlog.value.filter((song) => {
    // Filter by status
    if (!selectedStatuses.value.includes(song.status)) {
      return false;
    }

    // Filter by artist
    if (selectedArtist.value && song.artist !== selectedArtist.value) {
      return false;
    }

    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      const matchesTitle = song.song_title.toLowerCase().includes(query);
      const matchesArtist = song.artist.toLowerCase().includes(query);
      if (!matchesTitle && !matchesArtist) {
        return false;
      }
    }

    return true;
  });
});

onMounted(async () => {
  // load persisted admin token (if still valid)
  const persisted = loadAdminToken();
  if (persisted) {
    adminToken.value = persisted;
    await loadRequests();
  }
});
</script>

<style scoped>
table {
  border-collapse: collapse;
  width: 100%;
  margin-top: 20px;
}

thead {
  background-color: #f5f5f5;
}

th,
td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

th {
  font-weight: bold;
}

tr:hover {
  background-color: #f9f9f9;
}

button {
  padding: 6px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

select,
input[type="text"] {
  padding: 8px;
  margin: 8px 8px 8px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

div > div {
  margin-bottom: 15px;
}
</style>
