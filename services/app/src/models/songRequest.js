export const SongRequestStatus = {
  Pending: 'pending',
  Queued: 'queued',
  Completed: 'completed',
};

export function normalizeSongRequest(row) {
  return {
    id: row.id,
    song_title: row.song_title ?? '',
    artist: row.artist ?? '',
    status: row.status ?? SongRequestStatus.Pending,
    queue_order: Number(row.queue_order) || 0,
    created_at: row.created_at ?? null,
  };
}

export function normalizeSongRequests(rows) {
  return Array.isArray(rows) ? rows.map(normalizeSongRequest) : [];
}
