import { test as base } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

export const test = base.extend<{ mockAuth: void }>({
  mockAuth: async ({ page }, use) => {
    await page.route('**/api/v1/auth/login', (route) =>
      route.fulfill({ json: { data: { accessToken: 'tok', refreshToken: 'rtok' } } })
    );
    await page.route('**/api/v1/auth/refresh', (route) =>
      route.fulfill({ json: { data: { accessToken: 'tok', refreshToken: 'rtok' } } })
    );
    await page.route('**/api/v1/auth/me', (route) =>
      route.fulfill({ json: { data: { id: 1, email: 'demo@example.com', name: 'Demo User' } } })
    );
    await use();
  }
});

export const { Given, When, Then } = createBdd(test);
