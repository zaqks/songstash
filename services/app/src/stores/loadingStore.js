import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLoadingStore = defineStore('loading', () => {
  const isLoading = ref(false);
  const message = ref('');
  const requestCount = ref(0);

  const startLoading = (msg = 'Loading...') => {
    requestCount.value++;
    message.value = msg;
    isLoading.value = true;
  };

  const stopLoading = () => {
    requestCount.value--;
    if (requestCount.value <= 0) {
      requestCount.value = 0;
      isLoading.value = false;
      message.value = '';
    }
  };

  const setMessage = (msg) => {
    message.value = msg;
  };

  return {
    isLoading,
    message,
    requestCount,
    startLoading,
    stopLoading,
    setMessage,
  };
});
