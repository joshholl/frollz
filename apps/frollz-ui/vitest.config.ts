import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { vueConfig } from '@frollz/vitest-config/vue';

export default mergeConfig(vueConfig, {

    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        }
    },
    test: {
        environment: 'jsdom',
        setupFiles: './src/test-setup.ts',
        globals: true,
    },
});