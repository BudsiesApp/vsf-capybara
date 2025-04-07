import { testFactory as baseTestFactory } from './customizable-product-page';

import { PlushieProductPage } from '../page-model/product/plushie-product';

interface PlushieProductPageFixture {
  plushieProductPage: PlushieProductPage
}

export function testFactory (productPageUrl: string) {
  const baseTest = baseTestFactory(productPageUrl);

  return baseTest.extend<PlushieProductPageFixture>({
    plushieProductPage: async ({ page }, use) => {
      const plushieProductPage = new PlushieProductPage(page);
      await use(plushieProductPage);
    }
  });
}

export { expect } from '@playwright/test';
