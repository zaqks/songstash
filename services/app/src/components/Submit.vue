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
import { neon } from '@neondatabase/serverless'; // Standard static import

const creatorName = import.meta.env.VITE_CREATOR_NAME || '';
const songTitle = ref('');
const artist = ref('');

async function handleSubmit() {
    try {
        const connectionString = import.meta.env.VITE_NEON_API_URL;
        
        if (!connectionString) {
            throw new Error("VITE_NEON_API_URL is missing from environment variables.");
        }

        const sql = neon(connectionString);

        // Uses corrected column name: song_title
        await sql`
            INSERT INTO song_requests (song_title, artist)
            VALUES (${songTitle.value}, ${artist.value})
        `;

        alert('Song request submitted successfully.');
        songTitle.value = '';
        artist.value = '';
    } catch (error) {
        alert(`Submission failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}
</script>