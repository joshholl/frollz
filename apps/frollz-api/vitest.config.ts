import swc from 'unplugin-swc'
import { defineProject, mergeConfig } from 'vitest/config'
import { baseConfig } from '@frollz/vitest-config'

export default mergeConfig(baseConfig, defineProject({
  test: {
    include: ['src/**/*.spec.ts'],
    globals: true,
    environment: 'node',
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
}))
