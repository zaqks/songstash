<template>
  <transition name="popup-fade">
    <div
      v-if="notificationStore.notification"
      class="notification-overlay"
      :class="`notification-${notificationStore.notification.type}`"
    >
      <div class="notification-container">
        <span class="notification-icon" aria-hidden="true">
          {{ notificationStore.notification.type === 'success' ? 'OK' : '!' }}
        </span>
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
  left: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  justify-content: center;
}

@media (min-width: 480px) {
  .notification-overlay {
    left: auto;
    right: 20px;
  }
}

.notification-container {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 400px;
  padding: 14px 16px;
  background: var(--surface-raised);
  border: 1px solid var(--hairline-strong);
  border-top: 2px solid currentColor;
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.notification-success .notification-container {
  color: var(--success);
}

.notification-error .notification-container {
  color: var(--error);
}

.notification-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: 1px solid currentColor;
  border-radius: 50%;
  color: inherit;
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: 0.08em;
  line-height: 1;
  text-transform: uppercase;
}

.notification-message {
  flex: 1;
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--fs-sm);
  font-weight: 500;
  line-height: 1.4;
  color: var(--text);
}

.notification-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--text-faint);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--dur-fast) var(--ease);
}

.notification-close:hover {
  color: var(--text);
}

.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: all var(--dur-base) var(--ease);
}

.popup-fade-enter-from,
.popup-fade-leave-to {
  transform: translateY(-12px);
  opacity: 0;
}
</style>
