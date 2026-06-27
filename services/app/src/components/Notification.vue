<template>
  <transition name="popup-fade">
    <div
      v-if="notificationStore.notification"
      class="notification-overlay"
      :class="`notification-${notificationStore.notification.type}`"
    >
      <div class="notification-container">
        <div class="notification-icon">
          <svg
            v-if="notificationStore.notification.type === 'success'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <svg
            v-else-if="notificationStore.notification.type === 'error'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <p class="notification-message">{{ notificationStore.notification.message }}</p>
        <button
          type="button"
          class="notification-close"
          @click="notificationStore.dismiss"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useNotificationStore } from '../stores/notificationStore';

const notificationStore = useNotificationStore();
</script>

<style scoped>
.notification-overlay {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  animation: slideIn 0.3s ease-out;
}

.notification-container {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  max-width: 400px;
  position: relative;
}

.notification-success .notification-container {
  background-color: #10b981;
  color: white;
}

.notification-error .notification-container {
  background-color: #ef4444;
  color: white;
}

.notification-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-icon svg {
  width: 100%;
  height: 100%;
}

.notification-message {
  flex: 1;
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
}

.notification-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: inherit;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.notification-close:hover {
  opacity: 1;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: all 0.3s ease;
}

.popup-fade-enter-from {
  transform: translateX(400px);
  opacity: 0;
}

.popup-fade-leave-to {
  transform: translateX(400px);
  opacity: 0;
}
</style>
