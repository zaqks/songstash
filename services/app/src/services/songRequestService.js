import { neon } from '@neondatabase/serverless';
import { SongRequestStatus, normalizeSongRequests } from '../models/songRequest';
import { assertNeonConnectionString } from './config';

const ORDERED_REQUESTS_QUERY = `
  SELECT *
  FROM song_requests
  ORDER BY
    CASE WHEN status = 'queued' THEN 1 ELSE 2 END,
    queue_order ASC,
    created_at DESC
`;

const MAX_QUEUE_ORDER_QUERY = `
  SELECT MAX(queue_order) as max_order
  FROM song_requests
  WHERE status = 'queued'
`;

function createSqlClient(adminToken) {
  const connectionString = assertNeonConnectionString();

  if (adminToken) {
    return neon(connectionString, { authToken: adminToken });
  }

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
  const rows = await sql([ORDERED_REQUESTS_QUERY]);

  return normalizeSongRequests(rows);
}

export async function approveSongRequestToQueue(adminToken, id) {
  if (!adminToken) {
    throw new Error('Admin token is missing. Please log in again.');
  }

  const sql = createSqlClient(adminToken);
  const result = await sql([MAX_QUEUE_ORDER_QUERY]);
  const maxOrder = Number(result?.[0]?.max_order) || 0;
  const nextOrder = maxOrder + 1;

  await sql`
    UPDATE song_requests
    SET status = ${SongRequestStatus.Queued}, queue_order = ${nextOrder}
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
    SET status = ${SongRequestStatus.Completed}, queue_order = 0
    WHERE id = ${id}
  `;
}
