import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { currentUserSchema, loginRequestSchema, registerRequestSchema, tokenPairSchema, type CurrentUser, type LoginRequest, type RegisterRequest, type TokenPair } from '@frollz2/schema';

const REFRESH_TOKEN_STORAGE_KEY = 'frollz2.refreshToken';

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null);
  // Refresh tokens are persisted in localStorage per the product requirement so sessions survive reloads.
  // That is a deliberate tradeoff: it improves UX, but it also means the token must be protected against XSS.
  const refreshToken = ref<string | null>(localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY));
  const user = ref<CurrentUser | null>(null);
  const isSessionInitialized = ref(false);

  const isAuthenticated = computed(() => accessToken.value !== null);

  async function restoreSession(): Promise<void> {
    if (!refreshToken.value) {
      isSessionInitialized.value = true;
      return;
    }

    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken: refreshToken.value })
    });

    if (!response.ok) {
      clearTokens();
      isSessionInitialized.value = true;
      return;
    }

    const tokenPair = tokenPairSchema.parse(await response.json());
    setTokens(tokenPair);
    const userResponse = await fetch('/api/v1/auth/me', {
      headers: { authorization: `Bearer ${tokenPair.accessToken}` }
    });

    if (userResponse.ok) {
      user.value = currentUserSchema.parse(await userResponse.json());
    }

    isSessionInitialized.value = true;
  }

  function setTokens(tokenPair: TokenPair): void {
    accessToken.value = tokenPair.accessToken;
    refreshToken.value = tokenPair.refreshToken;
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokenPair.refreshToken);
  }

  function clearTokens(): void {
    accessToken.value = null;
    refreshToken.value = null;
    user.value = null;
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }

  async function login(input: LoginRequest): Promise<void> {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input)
    });

    const tokenPair = tokenPairSchema.parse(await response.json());
    setTokens(tokenPair);
    const meResponse = await fetch('/api/v1/auth/me', {
      headers: { authorization: `Bearer ${tokenPair.accessToken}` }
    });
    user.value = currentUserSchema.parse(await meResponse.json());
  }

  async function register(input: RegisterRequest): Promise<void> {
    const response = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input)
    });

    const tokenPair = tokenPairSchema.parse(await response.json());
    setTokens(tokenPair);
    const meResponse = await fetch('/api/v1/auth/me', {
      headers: { authorization: `Bearer ${tokenPair.accessToken}` }
    });
    user.value = currentUserSchema.parse(await meResponse.json());
  }

  async function logout(): Promise<void> {
    if (refreshToken.value) {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshToken.value })
      });
    }

    clearTokens();
  }

  return {
    accessToken,
    refreshToken,
    user,
    isSessionInitialized,
    isAuthenticated,
    restoreSession,
    setTokens,
    clearTokens,
    login,
    register,
    logout
  };
});
