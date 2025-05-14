import { test as baseTest } from '@playwright/test';

import { AccountPage } from '../page-model/account/account';

interface AccountPageFixture {
  accountPage: AccountPage
}

export const test = baseTest.extend<AccountPageFixture>({
  accountPage: async ({ page }, use) => {
    const accountPage = new AccountPage(page);
    await use(accountPage);
  }
});

export { expect } from '@playwright/test';
