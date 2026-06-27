<template>
  <div id="app">
    <div class="q-shell">
      <header class="q-header">
        <div class="q-header__mark">
          <svg class="q-logo-hex" viewBox="0 0 100 100" fill="none" aria-hidden="true">
            <path
              d="M50 4 92 27.5v45L50 96 8 72.5v-45z"
              stroke="currentColor"
              stroke-width="6"
            />
            <circle cx="50" cy="50" r="8" fill="currentColor" />
          </svg>
          <div>
            <p class="q-eyebrow q-eyebrow--red">Request a track</p>
          </div>
        </div>
      </header>

      <section class="submit-hero">
        <p class="q-eyebrow">Now accepting</p>
        <h1 class="q-title q-title--2xl">
          Submit a song<br />to {{ creatorName }}
        </h1>
        <p class="submit-hero__sub">
          Drop a title and artist below. Approved tracks move into the
          practice queue.
        </p>
      </section>

      <form class="q-card submit-form" @submit.prevent="handleSubmit">
        <div class="q-field">
          <label class="q-label" for="song-title">Song title</label>
          <input
            id="song-title"
            v-model="songTitle"
            class="q-input"
            type="text"
            placeholder="e.g. One Kiss"
            required
          />
        </div>

        <div class="q-field">
          <label class="q-label" for="artist">Artist</label>
          <input
            id="artist"
            v-model="artist"
            class="q-input"
            type="text"
            placeholder="e.g. Calvin Harris & Dua Lipa"
            required
          />
        </div>

        <button type="submit" class="q-btn q-btn--primary q-btn--block">
          Submit request
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { appConfig } from '../services/config';
import { createSongRequest } from '../services/songRequestService';
import { withLoading } from '../services/loadingHelper';
import { useNotificationStore } from '../stores/notificationStore';

const notificationStore = useNotificationStore();

const creatorName = appConfig.creatorName;
const songTitle = ref('');
const artist = ref('');

async function handleSubmit() {
  try {
    await withLoading(
      () => createSongRequest({
        song_title: songTitle.value,
        artist: artist.value,
      }),
      'Submitting your song request...'
    );

    notificationStore.showSuccess('Song request submitted successfully!');
    songTitle.value = '';
    artist.value = '';
  } catch (error) {
    notificationStore.showError(`Submission failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
</script>

<style scoped>
.submit-hero {
  margin-bottom: var(--sp-6);
  padding-bottom: var(--sp-6);
  border-bottom: 1px solid var(--hairline);
}

.submit-hero .q-eyebrow {
  margin-bottom: var(--sp-3);
}

.submit-hero h1 {
  margin-bottom: var(--sp-3);
}

.submit-hero__sub {
  color: var(--text-muted);
  font-size: var(--fs-md);
  max-width: 36ch;
}

.submit-form {
  padding: var(--sp-6) var(--sp-5);
}
</style>
