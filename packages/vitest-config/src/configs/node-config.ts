import swc from 'unplugin-swc';
import { defineProject, mergeConfig } from 'vitest/config';
import { baseConfig } from './base-config.js'

export const nodeConfig = mergeConfig(
    baseConfig,
    defineProject({
        test: {
            environment: 'node'
        },
        plugins: [swc.vite({ module: { type: 'es6' } })]
    })
)