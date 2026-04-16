import globals from 'globals'
import { config as baseConfig } from './base.js'

/** @type {import("eslint").Linter.Config[]} */
export const config = [
    ...baseConfig,
    {
        files: ['**/*.ts'],
        languageOptions: {
            globals: {
                ...globals.node
            }
        },
        rules: {
            '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
            '@typescript-eslint/explicit-module-boundary-types': 'error',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-misused-promises': 'error',
            '@typescript-eslint/await-thenable': 'error',
            '@typescript-eslint/require-await': 'error',
            '@typescript-eslint/no-unnecessary-type-assertion': 'error',
        }
    }
]