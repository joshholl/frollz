import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/integration/**/*.spec.ts'],
    globals: true,
    environment: 'node',
    // Each file runs in its own process — safe for better-sqlite3 (native module)
    // and naturally isolates each file's in-memory SQLite database.
    pool: 'forks',
    testTimeout: 30000,
    sequence: { concurrent: false },
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
      jsc: {
        parser: { syntax: 'typescript', decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true },
      },
    }),
  ],
})
