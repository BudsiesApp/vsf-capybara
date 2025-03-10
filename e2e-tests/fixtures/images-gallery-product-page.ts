import { test } from '@playwright/test';

import { CartPage } from '../page-model/cart/cart';
import { CrossSellsPage } from '../page-model/cross-sells';
import { CustomizableProductPage } from '../page-model/product/customizable-product';
import { ImagesGalleryProductPage } from '../page-model/product/images-gallery-form';

interface ImagesGalleryProductPageFixture {
  customizableProductPage: CustomizableProductPage,
  imagesGalleryProductPage: ImagesGalleryProductPage,
  cartPage: CartPage,
  crossSellsPage: CrossSellsPage
}

export function testFactory (productPageUrl: string) {
  return test.extend<ImagesGalleryProductPageFixture>({
    customizableProductPage: async ({ page }, use) => {
      const customizableProductPage = new CustomizableProductPage(page, productPageUrl);
      await customizableProductPage.goto();
      await use(customizableProductPage);
    },
    imagesGalleryProductPage: async ({ page, customizableProductPage }, use) => {
      const imagesGalleryProductPage = new ImagesGalleryProductPage(page, customizableProductPage);
      await use(imagesGalleryProductPage);
    },
    cartPage: async ({ page }, use) => {
      const cartPage = new CartPage(page);
      await use(cartPage);
    },
    crossSellsPage: async ({ page }, use) => {
      const crossSellsPage = new CrossSellsPage(page);
      await use(crossSellsPage);
    }
  });
}

export { expect } from '@playwright/test';
