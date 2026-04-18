import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';
import vueA11y from 'eslint-plugin-vuejs-accessibility';
import tselint from 'typescript-eslint';
import { config as baseConfig } from './base.js';

/** @type {import("eslint").Linter.Config[]} */
export const config = [
    ...baseConfig,
    ...pluginVue.configs['flat/recommended'],
    ...vueA11y.configs['flat/recommended'],
    {
        files: ['**/*.vue'],
        languageOptions: {
            parserOptions: {
                parser: tselint.parser
            },
            globals: {
                ...globals.browser
            }
        },
        rules: {
            'vue/multi-word-component-names': 'off',
            'vue/component-api-style': ['error', ['script-setup']],
            'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
            'vue/define-macro-order': ['error', { order: ['defineProps', 'defineEmits'] }],
            'vuejs-accessibility/label-has-for': ['error', {
                components: ['Label'],
                controlComponents: ['Input', 'Textarea', 'Select'],
                required: { some: ['nesting', 'id'] }
            }]
        }
    }, {
        files: ['**/*.ts'],
        languageOptions: {
            globals: {
                ...globals.browser
            }
        },
        rules: {
            '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }],
            '@typescript-eslint/await-thenable': 'error',
            '@typescript-eslint/require-await': 'error',
            '@typescript-eslint/no-unnecessary-type-assertion': 'error',
        }
    }
]
