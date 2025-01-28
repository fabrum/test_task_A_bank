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
    use: {
        headless: true,
        screenshot: 'only-on-failure',
        trace: 'retain-on-first-failure',
        baseURL:"https://enotes.pointschool.ru"
        //video: 'on-first-retry',
    }
});