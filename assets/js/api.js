export async function apiCall(url, method = 'GET', data = {}) {
  console.log(`[stub] ${method} ${url}`, data);
  return Promise.resolve({ ok: true });
}
