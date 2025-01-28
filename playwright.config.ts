import {defineConfig} from '@playwright/test';

export default defineConfig({
    testMatch: '*spec.ts',
    testDir: 'tests',
    timeout: 60000,
    globalTimeout: 600000,
    reporter: [['html'], ["allure-playwright",
        {
            resultsDir: "allure-results",
        },]],
    tsconfig: './tsconfig.test.json',
    use: {
        headless: false
    }
});