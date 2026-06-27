export const appConfig = {
    creatorName: import.meta.env.VITE_CREATOR_NAME || '',
    neonConnectionString: import.meta.env.VITE_NEON_DB_URL,
    authBaseUrl: import.meta.env.VITE_NEON_AUTH_URL,
};