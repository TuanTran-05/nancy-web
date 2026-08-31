import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [['list']],
  use: {
    browserName: 'chromium',
    headless: true,
    trace: 'retain-on-failure',
    viewport: devices['Desktop Chrome'].viewport,
  },
});
