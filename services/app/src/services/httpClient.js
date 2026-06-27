import axios from 'axios';
import { useLoadingStore } from '../stores/loadingStore';

export const httpClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
httpClient.interceptors.request.use(
  (config) => {
    const loadingStore = useLoadingStore();
    const message = config.loadingMessage || 'Loading...';
    loadingStore.startLoading(message);
    return config;
  },
  (error) => {
    const loadingStore = useLoadingStore();
    loadingStore.stopLoading();
    return Promise.reject(error);
  }
);

// Response interceptor
httpClient.interceptors.response.use(
  (response) => {
    const loadingStore = useLoadingStore();
    loadingStore.stopLoading();
    return response;
  },
  (error) => {
    const loadingStore = useLoadingStore();
    loadingStore.stopLoading();
    return Promise.reject(error);
  }
);
