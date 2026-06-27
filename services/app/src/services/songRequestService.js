import { neon } from '@neondatabase/serverless';
import { SongRequestStatus, normalizeSongRequests } from '../models/songRequest';
import { appConfig } from './config';

function createSqlClient() {
    const connectionString = appConfig.neonConnectionString;
    return neon(connectionString);
}

export async function createSongRequest(payload) {
    const sql = createSqlClient();

    await sql`
    INSERT INTO song_requests (song_title, artist)
    VALUES (${payload.song_title}, ${payload.artist})
  `;
}

export async function getAdminSongRequests(adminToken) {
    if (!adminToken) {
        throw new Error('Admin token is missing. Please log in again.');
    }

    const sql = createSqlClient(adminToken);

    const rows = await sql`
    SELECT *
    FROM song_requests
    ORDER BY
      queue_order DESC,
      CASE WHEN status = 'released' THEN 1 
           WHEN status = 'practicing' THEN 2
           WHEN status = 'pending' THEN 3
           ELSE 4 END,
      last_modified_at DESC
  `;

    return normalizeSongRequests(rows);
}

export async function approveSongRequestToQueue(adminToken, id) {
    if (!adminToken) {
        throw new Error('Admin token is missing. Please log in again.');
    }

    const sql = createSqlClient(adminToken);

    const result = await sql`
    SELECT MAX(queue_order) as max_order
    FROM song_requests
    WHERE status = 'practicing'
  `;

    const maxOrder = Number(result?.[0]?.max_order) || 0;
    const nextOrder = maxOrder + 1;

    await sql`
    UPDATE song_requests
    SET status = ${SongRequestStatus.Practicing},
        queue_order = ${nextOrder}
    WHERE id = ${id}
  `;
}

export async function completeSongRequest(adminToken, id) {
    if (!adminToken) {
        throw new Error('Admin token is missing. Please log in again.');
    }

    const sql = createSqlClient(adminToken);

    await sql`
    UPDATE song_requests
    SET status = ${SongRequestStatus.Released}
    WHERE id = ${id}
  `;
}