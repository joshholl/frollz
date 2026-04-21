import { useAuthStore } from '../stores/auth.js';
import { tokenPairSchema } from '@frollz2/schema';

export function useApi() {
  const authStore = useAuthStore();

  async function request(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers);

    if (authStore.accessToken) {
      headers.set('authorization', `Bearer ${authStore.accessToken}`);
    }

    if (!headers.has('content-type') && init.body !== undefined) {
      headers.set('content-type', 'application/json');
    }

    let response = await fetch(input, { ...init, headers });

    if (response.status === 401 && authStore.refreshToken) {
      const refreshResponse = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ refreshToken: authStore.refreshToken })
      });

      if (refreshResponse.ok) {
        const tokenPair = tokenPairSchema.parse(await refreshResponse.json());
        authStore.setTokens(tokenPair);

        const retryHeaders = new Headers(init.headers);
        retryHeaders.set('authorization', `Bearer ${authStore.accessToken}`);

        response = await fetch(input, { ...init, headers: retryHeaders });
      } else {
        authStore.clearTokens();
        window.location.assign('/login');
      }
    }

    return response;
  }

  return { request };
}
