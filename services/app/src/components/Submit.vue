<template>
    <div id="app">
        <h1>Submit a song to {{ creatorName }}</h1>

        <form @submit.prevent="handleSubmit">
            <div>
                <label for="song-title">Song Title</label>
                <input id="song-title" v-model="songTitle" type="text" required />
            </div>

            <div>
                <label for="artist">Artist</label>
                <input id="artist" v-model="artist" type="text" required />
            </div>

            <button type="submit">Submit</button>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { appConfig } from '../services/config';
import { createSongRequest } from '../services/songRequestService';

const creatorName = appConfig.creatorName;
const songTitle = ref('');
const artist = ref('');

async function handleSubmit() {
    try {
        await createSongRequest({
            song_title: songTitle.value,
            artist: artist.value,
        });

        alert('Song request submitted successfully.');
        songTitle.value = '';
        artist.value = '';
    } catch (error) {
        alert(`Submission failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}
</script>