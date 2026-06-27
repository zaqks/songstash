import { useLoadingStore } from '../stores/loadingStore';

export async function withLoading(operation, message = 'Loading...') {
  const loadingStore = useLoadingStore();
  loadingStore.startLoading(message);
  try {
    const result = await operation();
    return result;
  } finally {
    loadingStore.stopLoading();
  }
}
