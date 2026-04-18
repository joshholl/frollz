import js from '@eslint/js';
import markdown from '@eslint/markdown';
import stylistic from '@stylistic/eslint-plugin';
import gitignore from 'eslint-config-flat-gitignore';
import pluginJsonc from 'eslint-plugin-jsonc';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals'
import tseslint from 'typescript-eslint'

/** @type {import("eslint").Linter.Config[]} */
export const config = [
    gitignore(),
    {
        ignores: ['dist/**', 'coverage/**', 'vite/**', '**/*.vue.d.ts', '**/*.vue.js']
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    stylistic.configs.recommended,
    ...pluginJsonc.configs['flat/prettier'],
    ...markdown.configs.recommended,
    {
        plugins: {
            'simple-import-sort': simpleImportSort
        },
        rules: {
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-unused-vars': ['error', {
                varsIgnorePattern: '^_',
                argsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_'
            }],
            '@stylistic/comma-dangle': ['error', 'always-multiline'],

            '@stylistic/max-len': [
                'warn', {
                    code: 100,
                    ignoreUrls: true,
                    ignoreStrings: true,
                    ignoreTemplateLiterals: true
                }
            ]
        },
    },
    {
        files: ['**/*.config.js', '**/*.config.mjs', '**/*.config.cjs', '**/*.config.ts', '**/*.cjs'],
        languageOptions: {
            globals: {
                ...globals.node
            }
        }
    }
]