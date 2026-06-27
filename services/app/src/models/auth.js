export function extractAdminToken(payload) {
  const candidates = [
    payload?.token,
    payload?.session,
    payload?.sessionToken,
    payload?.data?.token,
    payload?.data?.session,
    payload?.data?.sessionToken,
    payload?.session?.token,
    payload?.session?.id,
  ];

  return candidates.find((value) => typeof value === 'string' && value.length > 0) || '';
}

export function extractApiErrorMessage(payload, fallbackMessage) {
  return (
    payload?.message ||
    payload?.error ||
    payload?.data?.message ||
    payload?.data?.error ||
    fallbackMessage
  );
}
