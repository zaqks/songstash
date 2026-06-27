<template>
    <div id="app">
        <div class="q-shell">
            <div>
                <header class="q-header">
                    <div class="q-header__mark">

                        <div>
                            <p class="q-eyebrow q-eyebrow--red" id="username">{{ creatorName }}</p>
                        </div>
                    </div>
                </header>

                <section class="submit-hero">

                    <h1 class="q-title q-title--2xl">
                        Submit a song request<br />to {{ creatorName }}
                    </h1>

                </section>
            </div>



            <form class="q-card submit-form" @submit.prevent="handleSubmit">
                <div class="q-field">
                    <label class="q-label" for="song-title">Song title</label>
                    <input id="song-title" v-model="songTitle" class="q-input" type="text" placeholder="e.g. One Kiss"
                        required />
                </div>

                <div class="q-field">
                    <label class="q-label" for="artist">Artist</label>
                    <input id="artist" v-model="artist" class="q-input" type="text"
                        placeholder="e.g. Calvin Harris & Dua Lipa" required />
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
#app,
.q-shell {
    width: 100%;
    height: 100vh;

    display: flex;
    flex-direction: column;
    justify-content: center;

}

.q-card.submit-form {
    margin-top: calc(2.5 * var(--fs-2xl));
    /* margin: auto 0; */
}

#username {
    font-size: var(--fs-2xl);
}

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
