import { defineConfig } from '@playwright/test';

export default defineConfig({
  workers: process.env.CI ? 2 : 4,
  use: {
    baseURL: `https://${process.env.DEFAULT_STORE_DOMAIN}`,
    headless: true,
    browserName: 'chromium',
    launchOptions: {
      args: ['--ignore-certificate-errors']
    }
  }
});
