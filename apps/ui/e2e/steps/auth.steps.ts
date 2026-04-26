import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures.js';

Given('I am on the login page', async ({ page }) => {
  await page.goto('/login');
});

When('I enter valid credentials', async ({ page, mockAuth }) => {
  await page.getByTestId('login-email').locator('input').fill('demo@example.com');
  await page.getByTestId('login-password').locator('input').fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();
});

Then('I should be on the dashboard', async ({ page }) => {
  await expect(page).toHaveURL(/\/dashboard/);
});
