import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const configDir = dirname(fileURLToPath(import.meta.url));

const bddConfig = defineBddConfig({
  features: 'e2e/features/**/*.feature',
  steps: 'e2e/steps/**/*.ts',
});

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'pnpm dev --host 127.0.0.1 --port 4173',
    cwd: configDir,
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 120000
  },
  projects: [
    {
      name: 'e2e',
      testMatch: '**/*.e2e.ts',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'bdd-gen',
      ...bddConfig
    },
    {
      name: 'bdd',
      dependsOn: ['bdd-gen'],
      testDir: bddConfig.outputDir,
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
