import { testFactory as baseTestFactory } from './customizable-product-page';

import { ImagesGalleryProductPage } from '../page-model/product/images-gallery-form';

interface ImagesGalleryProductPageFixture {
  imagesGalleryProductPage: ImagesGalleryProductPage
}

export function testFactory (productPageUrl: string) {
  const baseTest = baseTestFactory(productPageUrl);

  return baseTest.extend<ImagesGalleryProductPageFixture>({
    imagesGalleryProductPage: async ({ page, customizableProductPage }, use) => {
      const imagesGalleryProductPage = new ImagesGalleryProductPage(page, customizableProductPage);
      await use(imagesGalleryProductPage);
    }
  });
}

export { expect } from '@playwright/test';
