<template>
  <LoadingOverlay />
  <Notification />
  <RouterView />
</template>

<script setup>
import LoadingOverlay from './components/LoadingOverlay.vue';
import Notification from './components/Notification.vue';
</script>
