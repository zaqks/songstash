export const appConfig = {
  creatorName: import.meta.env.VITE_CREATOR_NAME || '',
  neonConnectionString: import.meta.env.VITE_NEON_API_URL,
  authBaseUrl:
    'https://ep-restless-poetry-atqgt9xo.neonauth.c-9.us-east-1.aws.neon.tech/neondb/auth',
};

export function assertNeonConnectionString() {
  if (!appConfig.neonConnectionString) {
    throw new Error('VITE_NEON_API_URL is missing from environment variables.');
  }

  return appConfig.neonConnectionString;
}
