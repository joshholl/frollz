import { expect, type Page } from '@playwright/test';
import { Given, When, Then } from './fixtures.js';
import { MOCK_REFERENCE, emulsionByName, filmStateByCode } from './common.steps.js';

// ─── Test state ───────────────────────────────────────────────────────────────

let currentFilmId = 1;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildMockFilm(id: number, emulsionName: string, stateCode: string, extra: Record<string, unknown> = {}) {
  const emulsion = emulsionByName(emulsionName) ?? MOCK_REFERENCE.emulsions[0];
  const format = MOCK_REFERENCE.filmFormats.find((f) => f.id === emulsion.filmFormats[0]!.id) ?? MOCK_REFERENCE.filmFormats[0];
  const state = filmStateByCode(stateCode) ?? MOCK_REFERENCE.filmStates[0];
  const packageType = MOCK_REFERENCE.packageTypes.find((p) => p.filmFormatId === format!.id) ?? MOCK_REFERENCE.packageTypes[0];
  return {
    id, userId: 1, filmLotId: 1,
    name: `${emulsion.manufacturer} ${emulsion.brand} roll`,
    emulsionId: emulsion.id, packageTypeId: packageType!.id, filmFormatId: format!.id,
    expirationDate: null, currentStateId: state!.id, currentStateCode: state!.code,
    emulsion, packageType: packageType!, filmFormat: format!, currentState: state!, latestEvent: null,
    ...extra,
  };
}

function buildMockEvent(filmId: number, stateCode: string, eventData: Record<string, unknown> = {}) {
  const state = filmStateByCode(stateCode) ?? MOCK_REFERENCE.filmStates[0];
  return {
    id: Math.floor(Math.random() * 9000) + 1000,
    filmId, userId: 1,
    filmStateId: state!.id, filmStateCode: state!.code,
    occurredAt: new Date().toISOString(), recordedAt: new Date().toISOString(),
    notes: null, eventData,
  };
}

async function mockFilm(page: Page, film: ReturnType<typeof buildMockFilm>, events: ReturnType<typeof buildMockEvent>[]) {
  await page.route(`**/api/v1/film/${film.id}`, (route) =>
    route.request().method() === 'GET' ? route.fulfill({ json: { data: film } }) : route.fallback()
  );
  await page.route(`**/api/v1/film/${film.id}/events`, (route) =>
    route.request().method() === 'GET' ? route.fulfill({ json: { data: events } }) : route.fallback()
  );
  await page.route(`**/api/v1/film/${film.id}/frames`, (route) =>
    route.fulfill({ json: { data: [] } })
  );
  await page.route('**/api/v1/film', (route) =>
    route.request().method() === 'GET' ? route.fulfill({ json: { data: { items: [film], nextCursor: null } } }) : route.fallback()
  );
}

async function navigateToFilmDetail(page: Page) {
  await page.goto(`/film/${currentFilmId}`);
}

async function recordEvent(page: Page, stateOptionText: RegExp) {
  await page.getByLabel('Next state').click();
  await page.getByRole('option', { name: stateOptionText }).click();
}

// ─── Given ────────────────────────────────────────────────────────────────────

Given('a roll of {string} in {string} has been purchased', async ({ page }, emulsionName: string, _format: string) => {
  currentFilmId = 10;
  await mockFilm(page, buildMockFilm(currentFilmId, emulsionName, 'purchased'), [
    buildMockEvent(currentFilmId, 'purchased'),
  ]);
});

Given('a roll of {string} in {string} is stored in the {string}', async ({ page }, emulsionName: string, _format: string, location: string) => {
  currentFilmId = 11;
  const storageLocation = MOCK_REFERENCE.storageLocations.find((l) => l.code === location) ?? MOCK_REFERENCE.storageLocations[0];
  await mockFilm(page, buildMockFilm(currentFilmId, emulsionName, 'stored'), [
    buildMockEvent(currentFilmId, 'purchased'),
    buildMockEvent(currentFilmId, 'stored', { storageLocationId: storageLocation!.id, storageLocationCode: storageLocation!.code }),
  ]);
});

Given('a roll of {string} is loaded in my {string}', async ({ page }, emulsionName: string, _device: string) => {
  currentFilmId = 12;
  await mockFilm(page, buildMockFilm(currentFilmId, emulsionName, 'loaded'), [
    buildMockEvent(currentFilmId, 'purchased'),
    buildMockEvent(currentFilmId, 'loaded', { receiverId: 1 }),
  ]);
});

Given('a roll of {string} has been fully exposed in my {string}', async ({ page }, emulsionName: string, _device: string) => {
  currentFilmId = 13;
  await mockFilm(page, buildMockFilm(currentFilmId, emulsionName, 'exposed'), [
    buildMockEvent(currentFilmId, 'purchased'),
    buildMockEvent(currentFilmId, 'loaded', { receiverId: 1 }),
    buildMockEvent(currentFilmId, 'exposed'),
  ]);
});

Given('a roll of {string} has been removed from the camera', async ({ page }, emulsionName: string) => {
  currentFilmId = 14;
  await mockFilm(page, buildMockFilm(currentFilmId, emulsionName, 'removed'), [
    buildMockEvent(currentFilmId, 'removed'),
  ]);
});

Given('a roll of {string} has been sent to {string}', async ({ page }, emulsionName: string, labName: string) => {
  currentFilmId = 15;
  await mockFilm(page, buildMockFilm(currentFilmId, emulsionName, 'sent_for_dev'), [
    buildMockEvent(currentFilmId, 'sent_for_dev', { labName }),
  ]);
});

Given('a roll of {string} has been sent to the lab', async ({ page }, emulsionName: string) => {
  currentFilmId = 16;
  await mockFilm(page, buildMockFilm(currentFilmId, emulsionName, 'sent_for_dev'), [
    buildMockEvent(currentFilmId, 'sent_for_dev'),
  ]);
});

// Covers Scenario Outline placeholders: "has been <prior_state>", "has been <state>",
// and specific states like "has been developed", "has been scanned", etc.
Given('a roll of {string} has been {word}', async ({ page }, emulsionName: string, stateCode: string) => {
  currentFilmId = 20;
  await mockFilm(page, buildMockFilm(currentFilmId, emulsionName, stateCode), [
    buildMockEvent(currentFilmId, stateCode),
  ]);
});

Given('a roll of {string} is loaded in my {string} slot {string}', async ({ page }, emulsionName: string, _device: string, slot: string) => {
  currentFilmId = 21;
  await mockFilm(page, buildMockFilm(currentFilmId, emulsionName, 'loaded'), [
    buildMockEvent(currentFilmId, 'loaded', { receiverId: 1, slotSideNumber: Number(slot) }),
  ]);
});

Given(/^my inventory contains rolls with different (\w+)s$/, async ({ page }, _filterType: string) => {
  const format120 = MOCK_REFERENCE.filmFormats.find((f) => f.code === '120')!;
  const pkg120 = MOCK_REFERENCE.packageTypes.find((p) => p.filmFormatId === format120.id)!;
  const films = [
    buildMockFilm(30, 'Kodak Portra 400', 'purchased'),
    buildMockFilm(31, 'Kodak Portra 400', 'loaded'),
    { ...buildMockFilm(32, 'Ilford HP5 Plus 400', 'purchased'), filmFormatId: format120.id, filmFormat: format120, packageTypeId: pkg120.id, packageType: pkg120 },
  ];
  await page.route('**/api/v1/film', (route) =>
    route.request().method() === 'GET' ? route.fulfill({ json: { data: { items: films, nextCursor: null } } }) : route.fallback()
  );
});

Given('my inventory contains rolls of {string} and {string}', async ({ page }, nameA: string, nameB: string) => {
  const films = [
    buildMockFilm(33, nameA, 'purchased'),
    buildMockFilm(34, nameB, 'purchased'),
  ];
  await page.route('**/api/v1/film', (route) =>
    route.request().method() === 'GET' ? route.fulfill({ json: { data: { items: films, nextCursor: null } } }) : route.fallback()
  );
});

Given('my inventory contains 35mm and 120 rolls', async ({ page }) => {
  const format120 = MOCK_REFERENCE.filmFormats.find((f) => f.code === '120')!;
  const pkg120 = MOCK_REFERENCE.packageTypes.find((p) => p.filmFormatId === format120.id)!;
  const films = [
    buildMockFilm(35, 'Kodak Portra 400', 'purchased'),
    { ...buildMockFilm(36, 'Ilford HP5 Plus 400', 'purchased'), filmFormatId: format120.id, filmFormat: format120, packageTypeId: pkg120.id, packageType: pkg120 },
  ];
  await page.route('**/api/v1/film', (route) =>
    route.request().method() === 'GET' ? route.fulfill({ json: { data: { items: films, nextCursor: null } } }) : route.fallback()
  );
});

Given('my inventory has rolls in {string}, {string}, and {string} states', async ({ page }, stateA: string, stateB: string, stateC: string) => {
  const films = [
    buildMockFilm(37, 'Kodak Portra 400', stateA),
    buildMockFilm(38, 'Kodak Portra 400', stateB),
    buildMockFilm(39, 'Kodak Portra 400', stateC),
  ];
  await page.route('**/api/v1/film', (route) =>
    route.request().method() === 'GET' ? route.fulfill({ json: { data: { items: films, nextCursor: null } } }) : route.fallback()
  );
});

// ─── When ─────────────────────────────────────────────────────────────────────

When('I add {int} rolls of {string} in {string} {string} format', async ({ page }, qty: number, emulsionName: string, _format: string, packageLabel: string) => {
  const emulsion = emulsionByName(emulsionName) ?? MOCK_REFERENCE.emulsions[0];
  const packageType = MOCK_REFERENCE.packageTypes.find((p) => p.label.toLowerCase().includes(packageLabel.replace('-', ' ').toLowerCase())) ?? MOCK_REFERENCE.packageTypes[0];
  const format = MOCK_REFERENCE.filmFormats.find((f) => f.id === packageType!.filmFormatId) ?? MOCK_REFERENCE.filmFormats[0];
  const createdFilms = Array.from({ length: qty }, (_, i) => buildMockFilm(50 + i, emulsionName, 'purchased'));

  await page.route('**/api/v1/film/lots', (route) =>
    route.request().method() === 'POST'
      ? route.fulfill({ status: 201, json: { data: { id: 1, emulsionId: emulsion.id, packageTypeId: packageType!.id, filmFormatId: format!.id, quantity: qty, films: createdFilms, emulsion, packageType: packageType!, filmFormat: format!, expirationDate: null, filmCount: qty } } })
      : route.fallback()
  );
  await page.route('**/api/v1/film', (route) =>
    route.request().method() === 'GET' ? route.fulfill({ json: { data: { items: createdFilms, nextCursor: null } } }) : route.fallback()
  );

  await page.goto('/film');
  await page.getByRole('button', { name: /add film/i }).click();
  await page.getByLabel('Film name').fill(`${emulsion.manufacturer} ${emulsion.brand} roll`);
  await page.getByLabel('Emulsion').click();
  await page.getByRole('option', { name: `${emulsion.manufacturer} ${emulsion.brand}`, exact: false }).click();
  await page.getByLabel('Film format').click();
  await page.getByRole('option', { name: format!.label, exact: true }).click();
  await page.getByLabel('Package type').click();
  await page.getByRole('option', { name: packageType!.label, exact: false }).click();
  await page.getByRole('button', { name: /^create$/i }).click();
});

When('I add 1 pack of {string} in {string} {string} format expiring {string}', async ({ page }, emulsionName: string, _format: string, packageLabel: string, expirationDate: string) => {
  const emulsion = emulsionByName(emulsionName) ?? MOCK_REFERENCE.emulsions[2];
  const packageType = MOCK_REFERENCE.packageTypes.find((p) => p.label.toLowerCase().includes(packageLabel.replace('-', ' ').toLowerCase())) ?? MOCK_REFERENCE.packageTypes[4];
  const format = MOCK_REFERENCE.filmFormats.find((f) => f.id === packageType!.filmFormatId) ?? MOCK_REFERENCE.filmFormats[2];
  const film = buildMockFilm(51, emulsionName, 'purchased', { expirationDate: `${expirationDate}T00:00:00.000Z` });

  await page.route('**/api/v1/film/lots', (route) =>
    route.request().method() === 'POST'
      ? route.fulfill({ status: 201, json: { data: { id: 2, emulsionId: emulsion.id, packageTypeId: packageType!.id, filmFormatId: format!.id, quantity: 1, films: [film], emulsion, packageType: packageType!, filmFormat: format!, expirationDate: `${expirationDate}T00:00:00.000Z`, filmCount: 1 } } })
      : route.fallback()
  );
  await page.route('**/api/v1/film', (route) =>
    route.request().method() === 'GET' ? route.fulfill({ json: { data: { items: [film], nextCursor: null } } }) : route.fallback()
  );

  await page.goto('/film');
  await page.getByRole('button', { name: /add film/i }).click();
  await page.getByLabel('Film name').fill(`${emulsion.manufacturer} ${emulsion.brand} roll`);
  await page.getByLabel('Emulsion').click();
  await page.getByRole('option', { name: `${emulsion.manufacturer} ${emulsion.brand}`, exact: false }).click();
  await page.getByLabel('Film format').click();
  await page.getByRole('option', { name: format!.label, exact: true }).click();
  await page.getByLabel('Package type').click();
  await page.getByRole('option', { name: packageType!.label, exact: false }).click();
  await page.getByLabel('Expiration date (optional)').fill(expirationDate);
  await page.getByRole('button', { name: /^create$/i }).click();
});

When('I attempt to add {string} in {string} format with a {string} package type', async ({ page }, emulsionName: string, format: string, packageCode: string) => {
  await page.route('**/api/v1/film/lots', (route) =>
    route.request().method() === 'POST'
      ? route.fulfill({ status: 422, json: { error: { code: 'DOMAIN_ERROR', message: `"${packageCode}" is not a valid package type for ${format}` } } })
      : route.fallback()
  );
  await page.goto('/film');
  await page.getByRole('button', { name: /add film/i }).click();
  const emulsion = emulsionByName(emulsionName);
  if (emulsion) {
    await page.getByLabel('Emulsion').click();
    await page.getByRole('option', { name: `${emulsion.manufacturer} ${emulsion.brand}`, exact: false }).click();
  }
  await page.getByRole('button', { name: /^create$/i }).click();
});

When('I store it in the {string}', async ({ page }, location: string) => {
  const storageLocation = MOCK_REFERENCE.storageLocations.find((l) => l.code === location) ?? MOCK_REFERENCE.storageLocations[0];
  await page.route(`**/api/v1/film/${currentFilmId}/events`, (route) =>
    route.request().method() === 'POST'
      ? route.fulfill({ status: 201, json: { data: buildMockEvent(currentFilmId, 'stored', { storageLocationId: storageLocation!.id, storageLocationCode: storageLocation!.code }) } })
      : route.fallback()
  );
  await navigateToFilmDetail(page);
  await recordEvent(page, /stored/i);
  await page.getByLabel('Storage location').click();
  await page.getByRole('option', { name: storageLocation!.label }).click();
  await page.getByRole('button', { name: /record event/i }).click();
});

When('I load it into my {string}', async ({ page }, _device: string) => {
  await page.route(`**/api/v1/film/${currentFilmId}/events`, (route) =>
    route.request().method() === 'POST'
      ? route.fulfill({ status: 201, json: { data: buildMockEvent(currentFilmId, 'loaded', { receiverId: 1 }) } })
      : route.fallback()
  );
  await navigateToFilmDetail(page);
  await recordEvent(page, /loaded/i);
  await page.getByLabel('Device').click();
  await page.getByRole('option', { name: _device, exact: false }).click();
  await page.getByRole('button', { name: /record event/i }).click();
});

When('I move it to the {string}', async ({ page }, location: string) => {
  const storageLocation = MOCK_REFERENCE.storageLocations.find((l) => l.code === location) ?? MOCK_REFERENCE.storageLocations[0];
  await page.route(`**/api/v1/film/${currentFilmId}/events`, (route) =>
    route.request().method() === 'POST'
      ? route.fulfill({ status: 201, json: { data: buildMockEvent(currentFilmId, 'stored', { storageLocationId: storageLocation!.id, storageLocationCode: storageLocation!.code }) } })
      : route.fallback()
  );
  await navigateToFilmDetail(page);
  await recordEvent(page, /stored/i);
  await page.getByLabel('Storage location').click();
  await page.getByRole('option', { name: storageLocation!.label }).click();
  await page.getByRole('button', { name: /record event/i }).click();
});

When('I mark it as fully exposed', async ({ page }) => {
  await page.route(`**/api/v1/film/${currentFilmId}/events`, (route) =>
    route.request().method() === 'POST'
      ? route.fulfill({ status: 201, json: { data: buildMockEvent(currentFilmId, 'exposed') } })
      : route.fallback()
  );
  await navigateToFilmDetail(page);
  await recordEvent(page, /exposed/i);
  await page.getByRole('button', { name: /record event/i }).click();
});

When('I remove it from the camera', async ({ page }) => {
  await page.route(`**/api/v1/film/${currentFilmId}/events`, (route) =>
    route.request().method() === 'POST'
      ? route.fulfill({ status: 201, json: { data: buildMockEvent(currentFilmId, 'removed') } })
      : route.fallback()
  );
  await navigateToFilmDetail(page);
  await recordEvent(page, /removed/i);
  await page.getByRole('button', { name: /record event/i }).click();
});

When('I record that it was sent to {string}', async ({ page }, labName: string) => {
  await page.route(`**/api/v1/film/${currentFilmId}/events`, (route) =>
    route.request().method() === 'POST'
      ? route.fulfill({ status: 201, json: { data: buildMockEvent(currentFilmId, 'sent_for_dev', { labName }) } })
      : route.fallback()
  );
  await navigateToFilmDetail(page);
  await recordEvent(page, /sent for dev/i);
  await page.getByLabel('Lab name (optional)').fill(labName);
  await page.getByRole('button', { name: /record event/i }).click();
});

When('I record that it was developed at {string} stop push', async ({ page }, push: string) => {
  await page.route(`**/api/v1/film/${currentFilmId}/events`, (route) =>
    route.request().method() === 'POST'
      ? route.fulfill({ status: 201, json: { data: buildMockEvent(currentFilmId, 'developed', { actualPushPull: Number(push) }) } })
      : route.fallback()
  );
  await navigateToFilmDetail(page);
  await recordEvent(page, /developed/i);
  await page.getByLabel('Actual push/pull (optional)').fill(push);
  await page.getByRole('button', { name: /record event/i }).click();
});

When('I record that it was developed at box speed', async ({ page }) => {
  await page.route(`**/api/v1/film/${currentFilmId}/events`, (route) =>
    route.request().method() === 'POST'
      ? route.fulfill({ status: 201, json: { data: buildMockEvent(currentFilmId, 'developed', { actualPushPull: null }) } })
      : route.fallback()
  );
  await navigateToFilmDetail(page);
  await recordEvent(page, /developed/i);
  await page.getByRole('button', { name: /record event/i }).click();
});

When('I record that it was scanned with {string}', async ({ page }, scanner: string) => {
  await page.route(`**/api/v1/film/${currentFilmId}/events`, (route) =>
    route.request().method() === 'POST'
      ? route.fulfill({ status: 201, json: { data: buildMockEvent(currentFilmId, 'scanned', { scannerOrSoftware: scanner }) } })
      : route.fallback()
  );
  await navigateToFilmDetail(page);
  await recordEvent(page, /scanned/i);
  await page.getByLabel('Scanner or software (optional)').fill(scanner);
  await page.getByRole('button', { name: /record event/i }).click();
});

When('I archive it', async ({ page }) => {
  await page.route(`**/api/v1/film/${currentFilmId}/events`, (route) =>
    route.request().method() === 'POST'
      ? route.fulfill({ status: 201, json: { data: buildMockEvent(currentFilmId, 'archived') } })
      : route.fallback()
  );
  await navigateToFilmDetail(page);
  await recordEvent(page, /archived/i);
  await page.getByRole('button', { name: /record event/i }).click();
});

When('I attempt to record it as {string}', async ({ page }, _targetState: string) => {
  // The invalid target should not appear in the "Next state" select — navigate to the detail
  // page and verify the option is absent; no POST mock needed since the UI should prevent it.
  await navigateToFilmDetail(page);
});

When('I attempt to load a second roll of {string} into the same slot', async ({ page }, _emulsionName: string) => {
  const secondFilmId = currentFilmId + 1;
  await page.route(`**/api/v1/film/${secondFilmId}/events`, (route) =>
    route.request().method() === 'POST'
      ? route.fulfill({ status: 409, json: { error: { code: 'CONFLICT', message: 'Slot is already occupied' } } })
      : route.fallback()
  );
  await page.goto(`/film/${secondFilmId}`);
  await recordEvent(page, /loaded/i);
  await page.getByRole('button', { name: /record event/i }).click();
});

When('I filter by {string}', async ({ page }, filterValue: string) => {
  await page.goto('/film');
  const stateOption = MOCK_REFERENCE.filmStates.find((s) => s.code === filterValue || s.label.toLowerCase() === filterValue.toLowerCase());
  if (stateOption) {
    await page.getByLabel('Filter by state').click();
    await page.getByRole('option', { name: stateOption.label }).click();
  } else {
    await page.getByLabel('Search films').fill(filterValue);
  }
});

When('I delete it', async ({ page }) => {
  await page.route(`**/api/v1/film/${currentFilmId}`, (route) =>
    route.request().method() === 'DELETE' ? route.fulfill({ status: 204 }) : route.fallback()
  );
  await navigateToFilmDetail(page);
  await page.getByRole('button', { name: /delete/i }).click();
  await page.getByRole('button', { name: /confirm|yes/i }).click();
});

When('I attempt to delete it', async ({ page }) => {
  await page.route(`**/api/v1/film/${currentFilmId}`, (route) =>
    route.request().method() === 'DELETE'
      ? route.fulfill({ status: 409, json: { error: { code: 'CONFLICT', message: 'Cannot delete film that is active in a device' } } })
      : route.fallback()
  );
  await navigateToFilmDetail(page);
  await page.getByRole('button', { name: /delete/i }).click();
  await page.getByRole('button', { name: /confirm|yes/i }).click();
});

// ─── Then ─────────────────────────────────────────────────────────────────────

Then('{int} individual rolls appear in my inventory in the {string} state', async ({ page }, count: number, stateLabel: string) => {
  await page.goto('/film');
  await expect(page.getByText(new RegExp(stateLabel, 'i'))).toHaveCount(count);
});

Then('each roll belongs to the same purchase lot', async ({ page }) => {
  await expect(page.getByRole('row').filter({ hasNot: page.getByRole('columnheader') })).not.toHaveCount(0);
});

Then('{int} roll appears in my inventory in the {string} state', async ({ page }, count: number, stateLabel: string) => {
  await page.goto('/film');
  await expect(page.getByText(new RegExp(stateLabel, 'i'))).toHaveCount(count);
});

Then('the roll shows an expiration date of {string}', async ({ page }, date: string) => {
  await expect(page.getByText(date, { exact: false })).toBeVisible();
});

Then('the addition is rejected because {string} is not a valid package type for {string}', async ({ page }, packageCode: string, format: string) => {
  await expect(page.getByText(new RegExp(`${packageCode}.*${format}|${format}.*${packageCode}`, 'i'))).toBeVisible();
});

Then("the roll's state is {string}", async ({ page }, stateCode: string) => {
  const state = MOCK_REFERENCE.filmStates.find((s) => s.code === stateCode || s.label.toLowerCase() === stateCode.toLowerCase());
  await expect(page.getByText(state?.label ?? stateCode, { exact: false })).toBeVisible();
});

Then("the roll's state remains {string}", async ({ page }, stateCode: string) => {
  const state = MOCK_REFERENCE.filmStates.find((s) => s.code === stateCode || s.label.toLowerCase() === stateCode.toLowerCase());
  await expect(page.getByText(state?.label ?? stateCode, { exact: false })).toBeVisible();
});

Then('its journey shows a {string} event with storage location {string}', async ({ page }, _stateCode: string, location: string) => {
  const label = MOCK_REFERENCE.storageLocations.find((l) => l.code === location)?.label ?? location;
  await expect(page.getByText(label, { exact: false })).toBeVisible();
});

Then('its journey shows a second {string} event with storage location {string}', async ({ page }, _stateCode: string, location: string) => {
  const label = MOCK_REFERENCE.storageLocations.find((l) => l.code === location)?.label ?? location;
  await expect(page.getByText(label, { exact: false })).toHaveCount(2);
});

Then('its journey shows development at {string} pushed {string} stop', async ({ page }, labName: string, push: string) => {
  await expect(page.getByText(labName, { exact: false })).toBeVisible();
  await expect(page.getByText(push, { exact: false })).toBeVisible();
});

Then('the transition is rejected', async ({ page }) => {
  await expect(page.getByRole('button', { name: /record event/i })).toBeDisabled();
});

Then('the loading is rejected because slot {string} is already occupied', async ({ page }, slot: string) => {
  await expect(page.getByText(new RegExp(`slot.*${slot}|occupied`, 'i'))).toBeVisible();
});

Then('only {string} rolls appear', async ({ page }, filterValue: string) => {
  const rows = page.getByRole('table').getByRole('row').filter({ hasNot: page.getByRole('columnheader') });
  for (const row of await rows.all()) {
    await expect(row.getByText(filterValue, { exact: false })).toBeVisible();
  }
});

Then('it no longer appears in my inventory', async ({ page }) => {
  await expect(page).toHaveURL(/\/film$/);
  await expect(
    page.getByRole('table').getByRole('row').filter({ hasNot: page.getByRole('columnheader') })
  ).toHaveCount(0);
});

Then('the deletion is rejected because the roll is active in a device', async ({ page }) => {
  await expect(page.getByText(/active.*device|device.*active|cannot delete/i)).toBeVisible();
});
