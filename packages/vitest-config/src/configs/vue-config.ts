import vue from '@vitejs/plugin-vue';
import { defineProject, mergeConfig } from 'vitest/config';
import { baseConfig } from './base-config.js'

export const vueConfig = mergeConfig(
    baseConfig,
    defineProject({
        test: {
            environment: 'jsdom'
        },
        plugins: [vue()]
    })
);