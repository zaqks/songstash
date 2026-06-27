import { httpClient } from './httpClient';
import { appConfig } from './config';
import { extractAdminToken, extractApiErrorMessage } from '../models/auth';

const SIGN_IN_PATH = '/sign-in/email';

function buildSignInUrl() {
  return `${appConfig.authBaseUrl}${SIGN_IN_PATH}`;
}

async function sendSignInRequest(payload, originHeader) {
  const response = await httpClient.post(buildSignInUrl(), payload, {
    headers: {
      Origin: originHeader,
    },
  });

  return response.data;
}

export async function signInAdmin(credentials) {
  const loginPayload = {
    email: credentials.email,
    password: credentials.password,
    callbackURL: `${window.location.origin}/admin`,
  };

  try {
    const data = await sendSignInRequest(loginPayload, window.location.origin);
    const token = extractAdminToken(data);

    if (!token) {
      throw new Error('Login succeeded but no token/session identifier was returned.');
    }

    return token;
  } catch (error) {
    const firstMessage =
      error?.response?.data?.message || error?.message || 'Admin login failed.';

    const shouldRetryWithLocalhost =
      typeof firstMessage === 'string' &&
      firstMessage.includes('Symbol(pino.msgPrefix)') &&
      window.location.origin !== 'http://localhost:3000';

    if (shouldRetryWithLocalhost) {
      try {
        const data = await sendSignInRequest(loginPayload, 'http://localhost:3000');
        const token = extractAdminToken(data);

        if (!token) {
          throw new Error('Login succeeded but no token/session identifier was returned.');
        }

        return token;
      } catch (retryError) {
        const fallbackMessage = 'Admin login failed on retry.';
        throw new Error(
          extractApiErrorMessage(retryError?.response?.data, fallbackMessage),
        );
      }
    }

    const fallbackMessage = 'Admin login failed.';
    throw new Error(extractApiErrorMessage(error?.response?.data, fallbackMessage));
  }
}
