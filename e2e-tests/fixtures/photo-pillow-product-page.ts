import { testFactory as baseTestFactory } from './customizable-product-page';

import { PhotoPillowProductPage } from '../page-model/product/photo-pillows-product';

interface PhotoPillowProductPageFixture {
  photoPillowProductPage: PhotoPillowProductPage
}

export function testFactory (productPageUrl: string) {
  const baseTest = baseTestFactory(productPageUrl);

  return baseTest.extend<PhotoPillowProductPageFixture>({
    photoPillowProductPage: async ({ page, customizableProductPage }, use) => {
      const photoPillowProductPage = new PhotoPillowProductPage(page, customizableProductPage);
      await use(photoPillowProductPage);
    }
  });
}

export { expect } from '@playwright/test';
