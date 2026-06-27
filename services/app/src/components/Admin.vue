<template>
  <div id="app">
    <div class="q-shell" :class="{ 'q-shell--wide': adminToken, 'q-shell--centered': !adminToken }">
      <!-- ============ LOGIN ============ -->
      <div v-if="!adminToken" class="login-screen">
        <header class="q-header">
          <div class="q-header__mark">
            <span class="q-mark-dot" aria-hidden="true"></span>
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
            <span class="q-mark-dot" aria-hidden="true"></span>
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
          <span class="q-search-icon" aria-hidden="true">Search</span>
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
            <label class="q-label">Status</label>
            <div class="status-chips" role="group" aria-label="Filter by status">
              <button
                v-for="status in statusOptions"
                :key="status"
                type="button"
                class="status-chip"
                :class="{ 'status-chip--active': selectedStatuses.includes(status) }"
                @click="toggleStatus(status)"
              >
                {{ status }}
              </button>
            </div>
          </div>
        </div>

        <hr class="q-divider" />

        <!-- Empty state -->
        <div v-if="filteredSongs.length === 0" class="q-empty">
          <span class="q-empty__mark" aria-hidden="true">Q</span>
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
const selectedStatuses = ref([SongRequestStatus.Pending, SongRequestStatus.Practicing]);
const statusOptions = [
  SongRequestStatus.Pending,
  SongRequestStatus.Practicing,
  SongRequestStatus.Released,
];

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

function toggleStatus(status) {
  if (selectedStatuses.value.includes(status)) {
    const remaining = selectedStatuses.value.filter((item) => item !== status);
    selectedStatuses.value = remaining.length > 0 ? remaining : [...statusOptions];
    return;
  }

  selectedStatuses.value = [...selectedStatuses.value, status];
}

// Computed properties

const filteredSongs = computed(() => {
  const activeStatuses = selectedStatuses.value.length > 0
    ? selectedStatuses.value
    : statusOptions;

  return backlog.value.filter((song) => {
    if (!activeStatuses.includes(song.status)) {
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
.q-shell--centered {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-screen__intro {
  margin-bottom: var(--sp-6);
}
.login-screen__intro .q-eyebrow {
  margin-bottom: var(--sp-3);
}

.q-mark-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--red);
  box-shadow: 0 0 0 4px var(--red-wash);
  flex-shrink: 0;
}

.q-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-faint);
  font-family: var(--font-display);
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  pointer-events: none;
}

.q-input-icon-wrap .q-input {
  padding-left: 68px;
}

.q-empty__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin: 0 auto var(--sp-4);
  border: 1px solid var(--hairline-strong);
  border-radius: 50%;
  color: var(--text-muted);
  font-family: var(--font-display);
  font-size: var(--fs-lg);
  letter-spacing: var(--tracking-caps);
}

.login-form {
  padding: var(--sp-6) var(--sp-5);
}

.result-count {
  font-size: var(--fs-sm);
  white-space: nowrap;
}

.filters {
  display: block;
  margin-bottom: var(--sp-2);
}

.filters__item { margin-bottom: var(--sp-4); }

.status-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
}

.status-chip {
  appearance: none;
  border: 1px solid var(--hairline-strong);
  background: transparent;
  color: var(--text-muted);
  border-radius: 999px;
  padding: 8px 12px;
  font-family: var(--font-sans);
  font-size: var(--fs-sm);
  line-height: 1;
  cursor: pointer;
  transition: background-color 140ms ease, border-color 140ms ease, color 140ms ease;
}

.status-chip:hover {
  border-color: var(--text-muted);
  color: var(--text);
}

.status-chip--active {
  background: var(--red-wash);
  border-color: var(--red);
  color: var(--red);
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
