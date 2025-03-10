import { test } from '@playwright/test';

import { CartPage } from '../page-model/cart/cart';
import { CustomizableProductPage } from '../page-model/product/customizable-product';
import { VerticalStepsProductPage } from '../page-model/product/vertical-steps-form';

interface VerticalStepsProductPageFixture {
  customizableProductPage: CustomizableProductPage,
  verticalStepsProductPage: VerticalStepsProductPage,
  cartPage: CartPage
}

export function testFactory (productPageUrl: string) {
  return test.extend<VerticalStepsProductPageFixture>({
    customizableProductPage: async ({ page }, use) => {
      const customizableProductPage = new CustomizableProductPage(page, productPageUrl);
      await customizableProductPage.goto();
      await use(customizableProductPage);
    },
    verticalStepsProductPage: async ({ page, customizableProductPage }, use) => {
      const imagesGalleryProductPage = new VerticalStepsProductPage(page, customizableProductPage);
      await use(imagesGalleryProductPage);
    },
    cartPage: async ({ page }, use) => {
      const cartPage = new CartPage(page);
      await use(cartPage);
    }
  });
}

export { expect } from '@playwright/test';
