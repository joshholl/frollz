import { test as base } from 'playwright-bdd';
import { createBdd } from 'playwright-bdd';

export const API_URL = process.env['PLAYWRIGHT_API_URL'] ?? 'http://127.0.0.1:3001';

export interface ReferenceData {
  filmFormats: { id: number; code: string; label: string }[];
  emulsions: { id: number; brand: string; manufacturer: string; isoSpeed: number; filmFormats: { id: number; code: string; label: string }[] }[];
  filmStates: { id: number; code: string; label: string }[];
  storageLocations: { id: number; code: string; label: string }[];
  packageTypes: { id: number; code: string; label: string; filmFormatId: number }[];
  deviceTypes: { id: number; code: string; label: string }[];
}

// Shared test state — cleared automatically before each BDD scenario
export const testState = {
  accessToken: null as string | null,
  referenceData: null as ReferenceData | null,
  deviceIdMap: new Map<number, number>(),  // feature-file id → actual API id
  filmIdMap: new Map<number, number>(),    // feature-file id → actual API id
};

export async function apiCall<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
  const resp = await fetch(`${API_URL}/api/v1/${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(testState.accessToken ? { Authorization: `Bearer ${testState.accessToken}` } : {}),
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const json = await resp.json() as { data: T; error?: unknown };
  if (!resp.ok) throw new Error(`API ${method} /api/v1/${path} → ${resp.status}: ${JSON.stringify(json)}`);
  return json.data;
}

export const test = base.extend<{ _reset: void }>({
  _reset: [async ({}, use) => {
    testState.accessToken = null;
    testState.referenceData = null;
    testState.deviceIdMap.clear();
    testState.filmIdMap.clear();
    const resp = await fetch(`${API_URL}/api/v1/test/reset`, { method: 'DELETE' });
    if (!resp.ok) throw new Error(`DB reset failed: ${resp.status}`);
    await use();
  }, { auto: true, scope: 'test' }],
});

export const { Given, When, Then } = createBdd(test);
