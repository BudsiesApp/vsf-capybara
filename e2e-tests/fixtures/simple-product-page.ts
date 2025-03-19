import { test as baseTest } from '@playwright/test';

import { SimpleProductPage } from '../page-model/product/simple-product';

interface SimpleProductPageFixture {
  simpleProductPage: SimpleProductPage
}

export const test = baseTest.extend<SimpleProductPageFixture>({
  simpleProductPage: async ({ page }, use) => {
    const simpleProductPage = new SimpleProductPage(page);
    await use(simpleProductPage);
  }
});

export { expect } from '@playwright/test';
