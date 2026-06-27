import { httpClient } from './httpClient';
import { appConfig } from './config';
import { extractAdminToken, extractApiErrorMessage } from '../models/auth';
import { saveAdminToken } from './adminSessionService';



async function sendSignInRequest(payload) {
    // POST to the provider sign-in endpoint. Let the browser set Origin automatically.
    const endpoint = appConfig.authBaseUrl;
    const response = await httpClient.post(endpoint, payload);

    return response.data;
}

export async function signInAdmin(credentials) {
    // Better Auth expects a completely flat schema: only email and password.
    // Removing callbackURL prevents the 500 Internal Server error.
    const loginPayload = {
        email: credentials.email,
        password: credentials.password,
    };

    try {
        const data = await sendSignInRequest(loginPayload);
        const token = extractAdminToken(data);

        if (!token) {
            throw new Error('Login succeeded but no token/session identifier was returned.');
        }

        // Persist token for 3 months
        try {
            saveAdminToken(token);
        } catch (e) {
            // non-fatal
            console.warn('Failed to persist admin token', e);
        }

        return token;
    } catch (error) {
        const status = error?.response?.status;
        const remoteMessage = extractApiErrorMessage(error?.response?.data, null);
        const baseMessage = remoteMessage || error?.message || 'Admin login failed.';

        let fullMessage = baseMessage;
        if (status) {
            fullMessage = `(${status}) ${fullMessage}`;
        }

        throw new Error(fullMessage);
    }
}