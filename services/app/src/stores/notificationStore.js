import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
  const notification = ref(null);
  const AUTO_DISMISS_TIME = 4000; // 4 seconds

  let dismissTimer = null;

  const showNotification = (message, type = 'success') => {
    if (dismissTimer) {
      clearTimeout(dismissTimer);
    }

    notification.value = {
      message,
      type, // 'success' or 'error'
    };

    dismissTimer = setTimeout(() => {
      notification.value = null;
    }, AUTO_DISMISS_TIME);
  };

  const showSuccess = (message) => {
    showNotification(message, 'success');
  };

  const showError = (message) => {
    showNotification(message, 'error');
  };

  const dismiss = () => {
    if (dismissTimer) {
      clearTimeout(dismissTimer);
    }
    notification.value = null;
  };

  return {
    notification,
    showSuccess,
    showError,
    dismiss,
  };
});
