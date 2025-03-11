import { testFactory as baseTestFactory } from './customizable-product-page';

import { VerticalStepsProductPage } from '../page-model/product/vertical-steps-form';

interface VerticalStepsProductPageFixture {
  verticalStepsProductPage: VerticalStepsProductPage
}

export function testFactory (productPageUrl: string) {
  const baseTest = baseTestFactory(productPageUrl);

  return baseTest.extend<VerticalStepsProductPageFixture>({
    verticalStepsProductPage: async ({ page, customizableProductPage }, use) => {
      const imagesGalleryProductPage = new VerticalStepsProductPage(page, customizableProductPage);
      await use(imagesGalleryProductPage);
    }
  });
}

export { expect } from '@playwright/test';
