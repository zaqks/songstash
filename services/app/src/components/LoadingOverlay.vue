<template>
  <transition name="fade">
    <div v-if="loadingStore.isLoading" class="loading-overlay">
      <div class="loading-container">
        <div class="spinner"></div>
        <p class="loading-message">{{ loadingStore.message }}</p>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useLoadingStore } from '../stores/loadingStore';

const loadingStore = useLoadingStore();
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(5, 5, 5, 0.78);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(3px);
}

.loading-container {
  background: var(--surface-raised);
  border: 1px solid var(--hairline-strong);
  border-radius: var(--radius-md);
  padding: 36px 44px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.spinner {
  border: 3px solid var(--hairline);
  border-top: 3px solid var(--red);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 18px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-message {
  margin: 0;
  color: var(--text-muted);
  font-family: var(--font-display);
  font-size: var(--fs-xs);
  font-weight: 600;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--dur-base) var(--ease);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
