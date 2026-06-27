export const appConfig = {
    creatorName: import.meta.env.VITE_CREATOR_NAME || '',
    neonConnectionString: import.meta.env.VITE_NEON_DB_URL,
    authBaseUrl: import.meta.env.VITE_NEON_AUTH_URL,
};

export function assertNeonConnectionString() {
    if (!appConfig.neonConnectionString) {
        throw new Error('VITE_NEON_API_URL is missing from environment variables.');
    }

    return appConfig.neonConnectionString;
}
