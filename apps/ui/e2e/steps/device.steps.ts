import { expect } from '@playwright/test';
import type { DataTable } from 'playwright-bdd';
import { Given, When, Then } from './fixtures.js';
import { MOCK_REFERENCE } from './common.steps.js';

// Maps filmFormatId integers (as used in the feature file) to human-readable labels
// so the step can select the correct option from the Film format dropdown.
const FORMAT_LABEL: Record<string, string> = {
  '1': '35mm',
  '2': '120',
  '3': '4x5',
};

let currentDeviceId = 0;

function buildMockDevice(id: number, fields: Record<string, string>) {
  const formatId = Number(fields['filmFormatId']) || 1;
  const format = MOCK_REFERENCE.filmFormats.find((f) => f.id === formatId) ?? MOCK_REFERENCE.filmFormats[0];
  return {
    id,
    userId: 1,
    deviceTypeCode: fields['loadMode'] === 'film_holder' ? 'film_holder'
      : fields['loadMode'] === 'interchangeable_back' ? 'interchangeable_back'
        : 'camera',
    filmFormatId: formatId,
    filmFormat: format,
    frameSize: fields['frameSize'] ?? 'full_frame',
    make: fields['make'],
    model: fields['model'],
    name: fields['name'],
    brand: fields['brand'],
    system: fields['system'],
    slotCount: Number(fields['slotCount']) || undefined,
    loadMode: fields['loadMode'],
    slots: [],
  };
}

// ─── Given ────────────────────────────────────────────────────────────────────

Given('these devices exist for the current user', async ({ page }, table: DataTable) => {
  const devices = table.hashes().map((row, i) => buildMockDevice(i + 1, row));
  await page.route('**/api/v1/devices', (route) =>
    route.request().method() === 'GET'
      ? route.fulfill({ json: { data: devices } })
      : route.fallback()
  );
});

Given('a camera exists with id {int}', async ({ page }, id: number, table: DataTable) => {
  currentDeviceId = id;
  const fields = table.rowsHash();
  const device = buildMockDevice(id, { ...fields, loadMode: 'direct' });
  await page.route(`**/api/v1/devices/${id}`, (route) =>
    route.request().method() === 'GET'
      ? route.fulfill({ json: { data: device } })
      : route.fallback()
  );
  await page.route(`**/api/v1/devices/${id}/load-events`, (route) =>
    route.fulfill({ json: { data: [] } })
  );
  await page.route('**/api/v1/devices', (route) =>
    route.request().method() === 'GET'
      ? route.fulfill({ json: { data: [device] } })
      : route.fallback()
  );
});

Given('a camera exists for another user with id {int}', async ({ page }, id: number) => {
  currentDeviceId = id;
  await page.route(`**/api/v1/devices/${id}`, (route) =>
    route.fulfill({ status: 404, json: { error: { code: 'NOT_FOUND', message: 'Device not found' } } })
  );
});

Given('a film is loaded in device {int}', async ({ page }, id: number) => {
  await page.route(`**/api/v1/devices/${id}`, (route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    return route.fulfill({
      json: {
        data: buildMockDevice(id, {
          make: 'Nikon', model: 'FM2', filmFormatId: '1', frameSize: 'full_frame', loadMode: 'direct',
        }),
      },
    });
  });
  await page.route(`**/api/v1/devices/${id}/load-events`, (route) =>
    route.fulfill({
      json: { data: [{ id: 1, filmId: 10, filmName: 'Test roll', stateCode: 'loaded' }] },
    })
  );
});

Given('a film is exposed in device {int}', async ({ page }, id: number) => {
  await page.route(`**/api/v1/devices/${id}/load-events`, (route) =>
    route.fulfill({
      json: { data: [{ id: 1, filmId: 10, filmName: 'Test roll', stateCode: 'exposed' }] },
    })
  );
});

// ─── When ─────────────────────────────────────────────────────────────────────

When('I create a camera with', async ({ page }, table: DataTable) => {
  const fields = table.rowsHash();
  await page.route('**/api/v1/devices', (route) => {
    if (route.request().method() !== 'POST') return route.fallback();
    const id = 100;
    currentDeviceId = id;
    return route.fulfill({ status: 201, json: { data: buildMockDevice(id, fields) } });
  });

  await page.goto('/devices');
  await page.getByRole('button', { name: /add device/i }).click();
  await page.getByLabel('Device type').click();
  await page.getByRole('option', { name: /camera/i }).click();
  await page.getByLabel('Film format').click();
  const formatLabel = FORMAT_LABEL[fields['filmFormatId']] ?? fields['filmFormatId'];
  await page.getByRole('option', { name: formatLabel, exact: true }).click();
  if (fields['frameSize']) {
    await page.getByLabel('Frame size').click();
    await page.getByRole('option', { name: fields['frameSize'] }).click();
  }
  await page.getByLabel('Make').fill(fields['make'] ?? '');
  await page.getByLabel('Model').fill(fields['model'] ?? '');
  await page.getByRole('button', { name: /^create$/i }).click();
});

When('I create an interchangeable back with', async ({ page }, table: DataTable) => {
  const fields = table.rowsHash();
  await page.route('**/api/v1/devices', (route) => {
    if (route.request().method() !== 'POST') return route.fallback();
    const id = 101;
    currentDeviceId = id;
    return route.fulfill({ status: 201, json: { data: buildMockDevice(id, { ...fields, loadMode: 'interchangeable_back' }) } });
  });

  await page.goto('/devices');
  await page.getByRole('button', { name: /add device/i }).click();
  await page.getByLabel('Device type').click();
  await page.getByRole('option', { name: /interchangeable back/i }).click();
  await page.getByLabel('Film format').click();
  const formatLabel = FORMAT_LABEL[fields['filmFormatId']] ?? fields['filmFormatId'];
  await page.getByRole('option', { name: formatLabel, exact: true }).click();
  await page.getByLabel('Name').fill(fields['name'] ?? '');
  await page.getByLabel('System').fill(fields['system'] ?? '');
  await page.getByRole('button', { name: /^create$/i }).click();
});

When('I create a film holder with', async ({ page }, table: DataTable) => {
  const fields = table.rowsHash();
  await page.route('**/api/v1/devices', (route) => {
    if (route.request().method() !== 'POST') return route.fallback();
    const id = 102;
    currentDeviceId = id;
    return route.fulfill({ status: 201, json: { data: buildMockDevice(id, { ...fields, loadMode: 'film_holder' }) } });
  });

  await page.goto('/devices');
  await page.getByRole('button', { name: /add device/i }).click();
  await page.getByLabel('Device type').click();
  await page.getByRole('option', { name: /film holder/i }).click();
  await page.getByLabel('Film format').click();
  const formatLabel = FORMAT_LABEL[fields['filmFormatId']] ?? fields['filmFormatId'];
  await page.getByRole('option', { name: formatLabel, exact: true }).click();
  await page.getByLabel('Holder name').fill(fields['name'] ?? '');
  await page.getByLabel('Brand').fill(fields['brand'] ?? '');
  if (fields['slotCount']) {
    await page.getByLabel('Slot count').click();
    await page.getByRole('option', { name: fields['slotCount'], exact: true }).click();
  }
  await page.getByRole('button', { name: /^create$/i }).click();
});

When('I attempt to create a camera with', async ({ page }, table: DataTable) => {
  const fields = table.rowsHash();
  const formatId = fields['filmFormatId'];
  if (formatId === '999') {
    await page.route('**/api/v1/devices', (route) =>
      route.request().method() === 'POST'
        ? route.fulfill({ status: 422, json: { error: { code: 'DOMAIN_ERROR', message: 'Film format not found' } } })
        : route.fallback()
    );
  } else {
    await page.route('**/api/v1/devices', (route) =>
      route.request().method() === 'POST'
        ? route.fulfill({ status: 422, json: { error: { code: 'DOMAIN_ERROR', message: `Frame size ${fields['frameSize']} is not valid for ${FORMAT_LABEL[formatId]}` } } })
        : route.fallback()
    );
  }

  await page.goto('/devices');
  await page.getByRole('button', { name: /add device/i }).click();
  await page.getByLabel('Device type').click();
  await page.getByRole('option', { name: /camera/i }).click();
  await page.getByLabel('Film format').click();
  const formatLabel = FORMAT_LABEL[formatId] ?? `Unknown (${formatId})`;
  const option = page.getByRole('option', { name: formatLabel, exact: true });
  if (await option.isVisible()) {
    await option.click();
    await page.getByLabel('Make').fill(fields['make'] ?? '');
    await page.getByLabel('Model').fill(fields['model'] ?? '');
  }
  await page.getByRole('button', { name: /^create$/i }).click();
});

When('I list my devices', async ({ page }) => {
  await page.goto('/devices');
});

When('I attempt to list devices without authentication', async ({ page }) => {
  await page.goto('/devices');
});

When('I fetch device {int}', async ({ page }, id: number) => {
  currentDeviceId = id;
  await page.goto(`/devices/${id}`);
});

When('I attempt to fetch device {int}', async ({ page }, id: number) => {
  await page.route(`**/api/v1/devices/${id}`, (route) =>
    route.fulfill({ status: 404, json: { error: { code: 'NOT_FOUND', message: 'Device not found' } } })
  );
  await page.goto(`/devices/${id}`);
});

When('I update device {int} with', async ({ page }, id: number, table: DataTable) => {
  const fields = table.rowsHash();
  await page.route(`**/api/v1/devices/${id}`, (route) => {
    if (route.request().method() !== 'PATCH') return route.fallback();
    return route.fulfill({ json: { data: { id, ...fields } } });
  });
  await page.goto(`/devices/${id}`);
  if (fields['frameSize']) {
    await page.getByLabel('Frame size').click();
    await page.getByRole('option', { name: fields['frameSize'] }).click();
  }
  await page.getByRole('button', { name: /save|update/i }).click();
});

When('I attempt to update device {int} with', async ({ page }, id: number, table: DataTable) => {
  const fields = table.rowsHash();
  // id 999 = non-existent device; any other id = invalid field value for the current format
  const isNotFound = id === 999;
  await page.route(`**/api/v1/devices/${id}`, (route) => {
    if (route.request().method() === 'GET') {
      return isNotFound
        ? route.fulfill({ status: 404, json: { error: { code: 'NOT_FOUND', message: 'Device not found' } } })
        : route.fallback();
    }
    if (route.request().method() === 'PATCH') {
      return isNotFound
        ? route.fulfill({ status: 404, json: { error: { code: 'NOT_FOUND', message: 'Device not found' } } })
        : route.fulfill({ status: 422, json: { error: { code: 'DOMAIN_ERROR', message: `Frame size ${fields['frameSize']} is not valid for 35mm` } } });
    }
    return route.fallback();
  });
  await page.goto(`/devices/${id}`);
  if (!isNotFound && fields['frameSize']) {
    await page.getByLabel('Frame size').click();
    await page.getByRole('option', { name: fields['frameSize'] }).click();
    await page.getByRole('button', { name: /save|update/i }).click();
  }
});

When('I delete device {int}', async ({ page }, id: number) => {
  await page.route(`**/api/v1/devices/${id}`, (route) =>
    route.request().method() === 'DELETE'
      ? route.fulfill({ status: 204 })
      : route.fallback()
  );
  await page.goto(`/devices/${id}`);
  await page.getByRole('button', { name: /delete/i }).click();
  await page.getByRole('button', { name: /confirm|yes/i }).click();
});

When('I attempt to delete device {int}', async ({ page }, id: number) => {
  await page.route(`**/api/v1/devices/${id}`, (route) =>
    route.request().method() === 'DELETE'
      ? route.fulfill({ status: 409, json: { error: { code: 'CONFLICT', message: 'Device still has an active loaded film' } } })
      : route.fallback()
  );
  await page.goto(`/devices/${id}`);
  await page.getByRole('button', { name: /delete/i }).click();
  await page.getByRole('button', { name: /confirm|yes/i }).click();
});

When('the film is removed from device {int}', async ({ page }, id: number) => {
  await page.route(`**/api/v1/devices/${id}/load-events`, (route) =>
    route.fulfill({ json: { data: [] } })
  );
});

// ─── Then ─────────────────────────────────────────────────────────────────────

Then('the device is created successfully', async ({ page }) => {
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByText(/device created/i)).toBeVisible();
});

Then('the device is labeled {string}', async ({ page }, label: string) => {
  await expect(page.getByText(label, { exact: false })).toBeVisible();
});

Then('the camera supports interchangeable backs for {string}', async ({ page }, system: string) => {
  await expect(page.getByText(system, { exact: false })).toBeVisible();
});

Then('the device has {int} slots', async ({ page }, slotCount: number) => {
  const slots = page.getByRole('row').filter({ hasText: /slot/i });
  await expect(slots).toHaveCount(slotCount);
});

Then('the creation fails with error {string}', async ({ page }, message: string) => {
  await expect(page.getByText(message, { exact: false })).toBeVisible();
});

Then('I see {int} devices', async ({ page }, count: number) => {
  const rows = page.getByRole('table').getByRole('row').filter({ hasNot: page.getByRole('columnheader') });
  await expect(rows).toHaveCount(count);
});

Then('the list includes {string}', async ({ page }, labelsCsv: string) => {
  const labels = labelsCsv.split(/,\s*/).map((s) => s.trim()).filter(Boolean);
  for (const label of labels) {
    await expect(page.getByRole('cell', { name: label, exact: false })).toBeVisible();
  }
});

Then('the request fails with status {int}', async ({ page }, status: number) => {
  if (status === 401) {
    await expect(page).toHaveURL(/\/login/);
  } else {
    await expect(page.getByText(String(status), { exact: false })).toBeVisible();
  }
});

Then('I get the device {string}', async ({ page }, label: string) => {
  await expect(page.getByText(label, { exact: false })).toBeVisible();
});

Then('the request fails with error {string}', async ({ page }, message: string) => {
  await expect(page.getByText(message, { exact: false })).toBeVisible();
});

Then('the device frameSize is {string}', async ({ page }, frameSize: string) => {
  await expect(page.getByText(frameSize, { exact: false })).toBeVisible();
});

Then('the update fails with error {string}', async ({ page }, message: string) => {
  await expect(page.getByText(message, { exact: false })).toBeVisible();
});

Then('the device is removed', async ({ page }) => {
  await expect(page).toHaveURL(/\/devices$/);
});

Then('fetching device {int} fails with error {string}', async ({ page }, id: number, message: string) => {
  await page.goto(`/devices/${id}`);
  await expect(page.getByText(message, { exact: false })).toBeVisible();
});

Then('the deletion fails with error {string}', async ({ page }, message: string) => {
  await expect(page.getByText(message, { exact: false })).toBeVisible();
});
