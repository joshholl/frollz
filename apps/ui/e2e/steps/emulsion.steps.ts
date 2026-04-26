import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures.js';
import { emulsionByName, MOCK_REFERENCE } from './common.steps.js';

// Maps feature-file section names to the Vue Router paths that have
// developmentProcessFilter meta set for that process.
const SECTION_PATHS: Record<string, string> = {
  'colour negative': '/emulsions/color-negative-c41',
  'black-and-white': '/emulsions/black-and-white',
  'colour positive': '/emulsions/color-positive-e6',
  'cine': '/emulsions/cine-ecn2',
};

// ─── Given ────────────────────────────────────────────────────────────────────

// "Given I am authenticated as" is defined in common.steps.ts
// "Given I am not authenticated" is defined in common.steps.ts

// ─── When ─────────────────────────────────────────────────────────────────────

When('I open the emulsion catalog', async ({ page }) => {
  await page.goto('/emulsions');
});

When('I view the emulsion catalog', async ({ page }) => {
  await page.goto('/emulsions');
});

When(/^I view the (.+) section$/, async ({ page }, section: string) => {
  const path = SECTION_PATHS[section];
  if (!path) throw new Error(`Unknown emulsion section: "${section}"`);
  await page.goto(path);
});

When(/^I view the detail for (.+)$/, async ({ page }, emulsionName: string) => {
  const emulsion = emulsionByName(emulsionName);
  if (!emulsion) throw new Error(`Unknown emulsion: "${emulsionName}"`);
  await page.goto(`/emulsions/${emulsion.id}`);
});

When('I attempt to view the emulsion catalog', async ({ page }) => {
  await page.goto('/emulsions');
});

// ─── Then ─────────────────────────────────────────────────────────────────────

Then('I see the following emulsions listed:', async ({ page }, table) => {
  const expectedNames: string[] = table.raw().map((row: string[]) => row[0]);
  for (const name of expectedNames) {
    await expect(page.getByRole('cell', { name, exact: false })).toBeVisible();
  }
});

Then(/^I see (.+) listed$/, async ({ page }, emulsionList: string) => {
  // Comma-and-"and" separated list: "Kodak Gold 200, Kodak Portra 400, and Kodak Ektar 100"
  const names = emulsionList
    .split(/,\s*(?:and\s+)?|\s+and\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const name of names) {
    await expect(page.getByRole('cell', { name, exact: false })).toBeVisible();
  }
});

Then(/^I see it is a ([\w-]+) ([\w-]+) film with ISO (\d+)$/, async ({ page }, balance: string, process: string, iso: string) => {
  await expect(page.getByText(new RegExp(`ISO\\s*${iso}`, 'i'))).toBeVisible();
  await expect(page.getByText(process, { exact: false })).toBeVisible();
  await expect(page.getByText(balance, { exact: false })).toBeVisible();
});

Then(/^it is available in (.+)$/, async ({ page }, formatsText: string) => {
  const formats = formatsText
    .split(/,\s*(?:and\s+)?|\s+and\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const format of formats) {
    await expect(page.getByText(format, { exact: false })).toBeVisible();
  }
});

Then('there are no options to add, edit, or remove emulsions', async ({ page }) => {
  await expect(page.getByRole('button', { name: /add|edit|delete|remove/i })).not.toBeVisible();
});

Then('I am redirected to the login page', async ({ page }) => {
  await expect(page).toHaveURL(/\/login/);
});
