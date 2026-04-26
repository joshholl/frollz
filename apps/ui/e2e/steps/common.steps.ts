import type { Page } from '@playwright/test';
import { Given } from './fixtures.js';

// ─── Mock data ────────────────────────────────────────────────────────────────

export const MOCK_REFERENCE = {
  filmFormats: [
    { id: 1, code: '35mm', label: '35mm' },
    { id: 2, code: '120', label: '120' },
    { id: 3, code: '4x5', label: '4x5' },
    { id: 4, code: '2x3', label: '2x3' },
    { id: 5, code: '8x10', label: '8x10' },
    { id: 6, code: 'InstaxMini', label: 'Instax Mini' },
    { id: 7, code: 'InstaxWide', label: 'Instax Wide' },
    { id: 8, code: 'InstaxSquare', label: 'Instax Square' },
  ],
  developmentProcesses: [
    { id: 1, code: 'C41', label: 'C-41 (Colour Negative)' },
    { id: 2, code: 'E6', label: 'E-6 (Slide/Reversal)' },
    { id: 3, code: 'ECN2', label: 'ECN-2 (Motion Picture)' },
    { id: 4, code: 'BW', label: 'Black & White' },
  ],
  packageTypes: [
    { id: 1, code: '36exp', label: '36-exposure', filmFormatId: 1, filmFormat: { id: 1, code: '35mm', label: '35mm' } },
    { id: 2, code: '24exp', label: '24-exposure', filmFormatId: 1, filmFormat: { id: 1, code: '35mm', label: '35mm' } },
    { id: 3, code: '100ft_bulk', label: '100ft Bulk Roll', filmFormatId: 1, filmFormat: { id: 1, code: '35mm', label: '35mm' } },
    { id: 4, code: 'roll', label: 'Roll', filmFormatId: 2, filmFormat: { id: 2, code: '120', label: '120' } },
    { id: 5, code: '10sheets', label: '10 Sheets', filmFormatId: 3, filmFormat: { id: 3, code: '4x5', label: '4x5' } },
    { id: 6, code: '25sheets', label: '25 Sheets', filmFormatId: 3, filmFormat: { id: 3, code: '4x5', label: '4x5' } },
    { id: 7, code: '50sheets', label: '50 Sheets', filmFormatId: 3, filmFormat: { id: 3, code: '4x5', label: '4x5' } },
  ],
  filmStates: [
    { id: 1, code: 'purchased', label: 'Purchased' },
    { id: 2, code: 'stored', label: 'Stored' },
    { id: 3, code: 'loaded', label: 'Loaded' },
    { id: 4, code: 'exposed', label: 'Exposed' },
    { id: 5, code: 'removed', label: 'Removed' },
    { id: 6, code: 'sent_for_dev', label: 'Sent for Development' },
    { id: 7, code: 'developed', label: 'Developed' },
    { id: 8, code: 'scanned', label: 'Scanned' },
    { id: 9, code: 'archived', label: 'Archived' },
  ],
  storageLocations: [
    { id: 1, code: 'freezer', label: 'Freezer' },
    { id: 2, code: 'refrigerator', label: 'Refrigerator' },
    { id: 3, code: 'shelf', label: 'Shelf' },
    { id: 4, code: 'other', label: 'Other' },
  ],
  slotStates: [
    { id: 1, code: 'empty', label: 'Empty' },
    { id: 2, code: 'loaded', label: 'Loaded' },
    { id: 3, code: 'exposed', label: 'Exposed' },
    { id: 4, code: 'removed', label: 'Removed' },
  ],
  deviceTypes: [
    { id: 1, code: 'camera', label: 'Camera' },
    { id: 2, code: 'interchangeable_back', label: 'Interchangeable Back' },
    { id: 3, code: 'film_holder', label: 'Film Holder' },
  ],
  holderTypes: [
    { id: 1, code: 'standard', label: 'Standard' },
    { id: 2, code: 'grafmatic', label: 'Grafmatic' },
    { id: 3, code: 'readyload', label: 'Readyload' },
    { id: 4, code: 'quickload', label: 'Quickload' },
  ],
  emulsions: [
    {
      id: 1, brand: 'Portra', manufacturer: 'Kodak', isoSpeed: 400, balance: 'daylight',
      developmentProcessId: 1, developmentProcess: { id: 1, code: 'C41', label: 'C-41 (Colour Negative)' },
      filmFormats: [{ id: 1, code: '35mm', label: '35mm' }, { id: 2, code: '120', label: '120' }],
    },
    {
      id: 2, brand: 'HP5 Plus', manufacturer: 'Ilford', isoSpeed: 400, balance: 'daylight',
      developmentProcessId: 4, developmentProcess: { id: 4, code: 'BW', label: 'Black & White' },
      filmFormats: [{ id: 1, code: '35mm', label: '35mm' }, { id: 2, code: '120', label: '120' }],
    },
    {
      id: 3, brand: 'Velvia', manufacturer: 'Fujifilm', isoSpeed: 50, balance: 'daylight',
      developmentProcessId: 2, developmentProcess: { id: 2, code: 'E6', label: 'E-6 (Slide/Reversal)' },
      filmFormats: [{ id: 1, code: '35mm', label: '35mm' }, { id: 2, code: '120', label: '120' }, { id: 3, code: '4x5', label: '4x5' }],
    },
    {
      id: 4, brand: '800T', manufacturer: 'CineStill', isoSpeed: 800, balance: 'tungsten',
      developmentProcessId: 3, developmentProcess: { id: 3, code: 'ECN2', label: 'ECN-2 (Motion Picture)' },
      filmFormats: [{ id: 1, code: '35mm', label: '35mm' }, { id: 2, code: '120', label: '120' }],
    },
    {
      id: 5, brand: 'Gold', manufacturer: 'Kodak', isoSpeed: 200, balance: 'daylight',
      developmentProcessId: 1, developmentProcess: { id: 1, code: 'C41', label: 'C-41 (Colour Negative)' },
      filmFormats: [{ id: 1, code: '35mm', label: '35mm' }, { id: 2, code: '120', label: '120' }],
    },
    {
      id: 6, brand: 'Ektar', manufacturer: 'Kodak', isoSpeed: 100, balance: 'daylight',
      developmentProcessId: 1, developmentProcess: { id: 1, code: 'C41', label: 'C-41 (Colour Negative)' },
      filmFormats: [{ id: 1, code: '35mm', label: '35mm' }, { id: 2, code: '120', label: '120' }],
    },
    {
      id: 7, brand: 'Tri-X', manufacturer: 'Kodak', isoSpeed: 400, balance: 'daylight',
      developmentProcessId: 4, developmentProcess: { id: 4, code: 'BW', label: 'Black & White' },
      filmFormats: [{ id: 1, code: '35mm', label: '35mm' }, { id: 2, code: '120', label: '120' }],
    },
    {
      id: 8, brand: 'Delta', manufacturer: 'Ilford', isoSpeed: 100, balance: 'daylight',
      developmentProcessId: 4, developmentProcess: { id: 4, code: 'BW', label: 'Black & White' },
      filmFormats: [{ id: 1, code: '35mm', label: '35mm' }, { id: 2, code: '120', label: '120' }],
    },
    {
      id: 9, brand: 'Provia', manufacturer: 'Fujifilm', isoSpeed: 100, balance: 'daylight',
      developmentProcessId: 2, developmentProcess: { id: 2, code: 'E6', label: 'E-6 (Slide/Reversal)' },
      filmFormats: [{ id: 1, code: '35mm', label: '35mm' }, { id: 2, code: '120', label: '120' }],
    },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export async function mockReferenceData(page: Page): Promise<void> {
  await page.route('**/api/v1/reference', (route) =>
    route.fulfill({ json: { data: MOCK_REFERENCE } })
  );
  await page.route('**/api/v1/reference/emulsions/*', (route) => {
    const id = Number(new URL(route.request().url()).pathname.split('/').pop());
    const emulsion = MOCK_REFERENCE.emulsions.find((e) => e.id === id);
    return emulsion
      ? route.fulfill({ json: { data: emulsion } })
      : route.fulfill({ status: 404, json: { error: { code: 'NOT_FOUND', message: 'Emulsion not found' } } });
  });
}

export function emulsionByName(name: string) {
  return MOCK_REFERENCE.emulsions.find(
    (e) => `${e.manufacturer} ${e.brand} ${e.isoSpeed}` === name ||
           `${e.manufacturer} ${e.brand}` === name
  );
}

export function filmStateByCode(code: string) {
  return MOCK_REFERENCE.filmStates.find((s) => s.code === code);
}

// ─── Steps ────────────────────────────────────────────────────────────────────

Given('I am authenticated as {string}', async ({ page }, email: string) => {
  await page.route('**/api/v1/auth/login', (route) =>
    route.fulfill({ json: { data: { accessToken: 'test-token', refreshToken: 'test-refresh' } } })
  );
  await page.route('**/api/v1/auth/refresh', (route) =>
    route.fulfill({ json: { data: { accessToken: 'test-token', refreshToken: 'test-refresh' } } })
  );
  await page.route('**/api/v1/auth/me', (route) =>
    route.fulfill({ json: { data: { id: 1, email, name: 'Demo User' } } })
  );
  await mockReferenceData(page);

  await page.goto('/login');
  await page.getByTestId('login-email').locator('input').fill(email);
  await page.getByTestId('login-password').locator('input').fill('password123');
  await page.getByTestId('login-submit').click();
  await page.waitForURL(/\/dashboard/);
});

Given('I am not authenticated', async ({ page }) => {
  await page.evaluate(() => localStorage.clear());
});
