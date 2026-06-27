import { httpClient } from './httpClient';
import { appConfig } from './config';
import { extractAdminToken, extractApiErrorMessage } from '../models/auth';



async function sendSignInRequest(payload) {
    // We use headers: { Origin: undefined } to explicitly force 
    // Axios to NOT send or mutate the forbidden header if it's set in defaults.
    const response = await httpClient.post(appConfig.authBaseUrl, payload, {
        headers: {
            'Origin': undefined
        }
    });

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