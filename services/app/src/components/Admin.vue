<template>
  <div id="app">
    <div class="q-shell" :class="{ 'q-shell--wide': adminToken }">
      <!-- ============ LOGIN ============ -->
      <div v-if="!adminToken" class="login-screen">
        <header class="q-header">
          <div class="q-header__mark">
            <svg class="q-logo-hex" viewBox="0 0 100 100" fill="none" aria-hidden="true">
              <path d="M50 4 92 27.5v45L50 96 8 72.5v-45z" stroke="currentColor" stroke-width="6" />
              <circle cx="50" cy="50" r="8" fill="currentColor" />
            </svg>
            <p class="q-eyebrow q-eyebrow--red">Queue</p>
          </div>
        </header>

        <div class="login-screen__intro">
          <p class="q-eyebrow">Creator access</p>
          <h1 class="q-title q-title--2xl">Admin login</h1>
        </div>

        <form class="q-card login-form" @submit.prevent="loginAdmin">
          <div class="q-field">
            <label class="q-label" for="admin-email">Email</label>
            <input id="admin-email" v-model="email" class="q-input" type="email" required />
          </div>

          <div class="q-field">
            <label class="q-label" for="admin-password">Password</label>
            <input id="admin-password" v-model="password" class="q-input" type="password" required />
          </div>

          <button type="submit" class="q-btn q-btn--primary q-btn--block">Log in</button>
        </form>
      </div>

      <!-- ============ DASHBOARD ============ -->
      <div v-else>
        <header class="q-header">
          <div class="q-header__mark">
            <svg class="q-logo-hex" viewBox="0 0 100 100" fill="none" aria-hidden="true">
              <path d="M50 4 92 27.5v45L50 96 8 72.5v-45z" stroke="currentColor" stroke-width="6" />
              <circle cx="50" cy="50" r="8" fill="currentColor" />
            </svg>
            <p class="q-eyebrow q-eyebrow--red">Queue / Dashboard</p>
          </div>
          <button type="button" class="q-btn q-btn--ghost q-btn--sm" @click="logoutAdmin">
            Log out
          </button>
        </header>

        <div class="q-section__head">
          <h1 class="q-title q-title--xl">Song request queue</h1>
          <span class="q-text-muted result-count">{{ filteredSongs.length }} result{{ filteredSongs.length === 1 ? '' : 's' }}</span>
        </div>

        <!-- Search -->
        <div class="q-field q-input-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            v-model="searchQuery"
            class="q-input"
            type="text"
            placeholder="Search by song title or artist..."
          />
        </div>

        <!-- Filters -->
        <div class="filters">
          <div class="q-field filters__item">
            <label class="q-label" for="status-filter">Status</label>
            <select id="status-filter" v-model="selectedStatuses" class="q-select" multiple>
              <option :value="SongRequestStatus.Pending">Pending</option>
              <option :value="SongRequestStatus.Practicing">Practicing</option>
              <option :value="SongRequestStatus.Released">Released</option>
            </select>
          </div>

          <div class="q-field filters__item">
            <label class="q-label" for="artist-filter">Artist</label>
            <div class="q-select-wrap">
              <select id="artist-filter" v-model="selectedArtist" class="q-select">
                <option value="">All artists</option>
                <option v-for="artist in uniqueArtists" :key="artist" :value="artist">
                  {{ artist }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <hr class="q-divider" />

        <!-- Empty state -->
        <div v-if="filteredSongs.length === 0" class="q-empty">
          <svg class="q-empty__hex" viewBox="0 0 100 100" fill="none" aria-hidden="true">
            <path d="M50 4 92 27.5v45L50 96 8 72.5v-45z" stroke="currentColor" stroke-width="6" />
          </svg>
          <p class="q-empty__title">No requests found</p>
          <p class="q-text-muted">Try a different search term or filter.</p>
        </div>

        <!-- Table (desktop) -->
        <table v-else class="queue-table">
          <thead>
            <tr>
              <th>Song title</th>
              <th>Artist</th>
              <th>Status</th>
              <th>Queue order</th>
              <th>Last modified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="song in filteredSongs" :key="song.id">
              <td class="cell-title">{{ song.song_title }}</td>
              <td class="q-text-muted">{{ song.artist }}</td>
              <td>
                <span class="q-badge" :class="badgeClass(song.status)">{{ song.status }}</span>
              </td>
              <td class="q-text-muted">{{ song.queue_order ?? '—' }}</td>
              <td class="q-text-muted cell-date">{{ formatDate(song.last_modified_at) }}</td>
              <td>
                <button
                  v-if="song.status === SongRequestStatus.Pending"
                  type="button"
                  class="q-btn q-btn--primary q-btn--sm"
                  @click="approveToQueue(song.id)"
                >
                  Approve
                </button>
                <button
                  v-else-if="song.status === SongRequestStatus.Practicing"
                  type="button"
                  class="q-btn q-btn--ghost q-btn--sm"
                  @click="completeSong(song.id)"
                >
                  Mark released
                </button>
                <span v-else class="q-text-faint">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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
import { useNotificationStore } from '../stores/notificationStore';

const notificationStore = useNotificationStore();

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
    notificationStore.showError(`Admin login failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function loadRequests() {
  try {
    backlog.value = await withLoading(
      () => getAdminSongRequests(adminToken.value),
      'Loading song requests...'
    );
  } catch (error) {
    notificationStore.showError(`Failed to load queue requests: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function approveToQueue(id) {
  try {
    await withLoading(
      () => approveSongRequestToQueue(adminToken.value, id),
      'Approving song to practicing...'
    );
    await loadRequests();
    notificationStore.showSuccess('Song approved to practicing!');
  } catch (error) {
    notificationStore.showError(`Failed to approve song into queue: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function completeSong(id) {
  try {
    await withLoading(
      () => completeSongRequest(adminToken.value, id),
      'Marking song as released...'
    );
    await loadRequests();
    notificationStore.showSuccess('Song marked as released!');
  } catch (error) {
    notificationStore.showError(`Failed to mark song completed: ${error instanceof Error ? error.message : String(error)}`);
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

function badgeClass(status) {
  if (status === SongRequestStatus.Pending) return 'q-badge--pending';
  if (status === SongRequestStatus.Practicing) return 'q-badge--practicing';
  if (status === SongRequestStatus.Released) return 'q-badge--released';
  return '';
}

// Computed properties
const uniqueArtists = computed(() => {
  return [...new Set(backlog.value.map((song) => song.artist))].sort();
});

const filteredSongs = computed(() => {
  return backlog.value.filter((song) => {
    if (!selectedStatuses.value.includes(song.status)) {
      return false;
    }

    if (selectedArtist.value && song.artist !== selectedArtist.value) {
      return false;
    }

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
  const persisted = loadAdminToken();
  if (persisted) {
    adminToken.value = persisted;
    await loadRequests();
  }
});
</script>

<style scoped>
.login-screen__intro {
  margin-bottom: var(--sp-6);
}
.login-screen__intro .q-eyebrow {
  margin-bottom: var(--sp-3);
}

.login-form {
  padding: var(--sp-6) var(--sp-5);
}

.result-count {
  font-size: var(--fs-sm);
  white-space: nowrap;
}

.filters {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0 var(--sp-4);
  margin-bottom: var(--sp-2);
}

.filters__item { margin-bottom: var(--sp-4); }

@media (min-width: 560px) {
  .filters {
    grid-template-columns: 1fr 1fr;
  }
}

/* ---- Table: full grid on desktop, stacked cards on mobile ---- */
.queue-table {
  width: 100%;
  border-collapse: collapse;
}

.queue-table thead {
  display: none;
}

.queue-table tbody tr {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-2) var(--sp-4);
  background: var(--surface);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-md);
  padding: var(--sp-4);
  margin-bottom: var(--sp-3);
}

.queue-table tbody td {
  border: none;
  padding: 0;
  font-size: var(--fs-sm);
}

.cell-title {
  grid-column: 1 / -1;
  font-family: var(--font-display);
  font-size: var(--fs-lg);
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--text);
}

.queue-table tbody td:last-child {
  grid-column: 1 / -1;
  margin-top: var(--sp-2);
  padding-top: var(--sp-3);
  border-top: 1px solid var(--hairline);
}

@media (min-width: 760px) {
  .queue-table thead { display: table-header-group; }

  .queue-table thead th {
    text-align: left;
    font-family: var(--font-display);
    font-size: var(--fs-xs);
    font-weight: 600;
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--text-muted);
    padding: var(--sp-3) var(--sp-4);
    border-bottom: 1px solid var(--hairline-strong);
  }

  .queue-table tbody tr {
    display: table-row;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--hairline);
    border-radius: 0;
    padding: 0;
    margin-bottom: 0;
  }

  .queue-table tbody tr:hover {
    background: var(--surface);
  }

  .queue-table tbody td {
    display: table-cell;
    padding: var(--sp-4);
    vertical-align: middle;
  }

  .cell-title {
    grid-column: auto;
    font-size: var(--fs-md);
  }

  .queue-table tbody td:last-child {
    grid-column: auto;
    margin-top: 0;
    padding-top: var(--sp-4);
    border-top: none;
    text-align: right;
  }

  .cell-date { white-space: nowrap; }
}
</style>
