import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const configDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(configDir, '../..');

const bddOutputDir = defineBddConfig({
  features: 'e2e/features/**/*.feature',
  steps: 'e2e/steps/**/*.ts',
});

const API_URL = 'http://127.0.0.1:3001';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry'
  },
  webServer: [
    {
      // Test API — in-memory SQLite, auto-migrated and seeded on startup
      command: 'pnpm --filter @frollz2/api start:test',
      cwd: repoRoot,
      url: `${API_URL}/api/v1/auth/me`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      // UI dev server proxied to the test API on port 3001
      command: `cross-env API_TARGET=${API_URL} pnpm dev --host 127.0.0.1 --port 4173`,
      cwd: configDir,
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: 'e2e',
      testMatch: '**/*.e2e.ts',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'bdd',
      testDir: bddOutputDir,
      workers: 1,
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
