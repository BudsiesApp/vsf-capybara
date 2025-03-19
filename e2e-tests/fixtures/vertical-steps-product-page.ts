import { testFactory as baseTestFactory } from './customizable-product-page';

import { VerticalStepsProductPage } from '../page-model/product/vertical-steps-form';

interface VerticalStepsProductPageFixture {
  verticalStepsProductPage: VerticalStepsProductPage
}

export function testFactory (productPageUrl: string) {
  const baseTest = baseTestFactory(productPageUrl);

  return baseTest.extend<VerticalStepsProductPageFixture>({
    verticalStepsProductPage: async ({ page, customizableProductPage }, use) => {
      const verticalStepsProductPage = new VerticalStepsProductPage(page, customizableProductPage);
      await use(verticalStepsProductPage);
    }
  });
}

export { expect } from '@playwright/test';
