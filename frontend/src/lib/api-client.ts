const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const client = {
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API error: ${response.status}`);
    }

    return response.json();
  },

  get(endpoint: string) {
    return this.request(endpoint);
  },

  post(endpoint: string, data: any) {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(data) });
  },

  put(endpoint: string, data: any) {
    return this.request(endpoint, { method: 'PUT', body: JSON.stringify(data) });
  },

  delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};

export const settingsApi = {
  getProfile: () => client.get('/settings/profile'),
  updateProfile: (data: any) => client.put('/settings/profile', data),
  getPreferences: () => client.get('/settings/preferences'),
  updatePreferences: (data: any) => client.put('/settings/preferences', data),
  updatePassword: (data: any) => client.put('/settings/security/password', data),
  enableMfa: () => client.post('/settings/security/mfa/enable', {}),
  disableMfa: () => client.post('/settings/security/mfa/disable', {}),
  getApiKeys: () => client.get('/settings/api-keys'),
  generateApiKey: (name: string) => client.post('/settings/api-keys', { name }),
  revokeApiKey: (keyId: string) => client.delete(`/settings/api-keys/${keyId}`),
  listUsers: () => client.get('/settings/users'),
  createUser: (data: any) => client.post('/settings/users', data),
  deleteUser: (userId: string) => client.delete(`/settings/users/${userId}`),
};
