const API_URL = '';

export async function apiCall(endpoint, method = 'GET', token = '', data = null) {
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (data && method !== 'GET') headers['Content-Type'] = 'application/json';

  const options = { method, headers };
  if (data && method !== 'GET') options.body = JSON.stringify(data);

  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  const res = await fetch(url, options);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ошибка ${res.status}: ${text}`);
  }

  return res.json();
}