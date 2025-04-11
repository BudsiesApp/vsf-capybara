import { test } from '@playwright/test';

import { CartPage } from '../page-model/cart/cart';
import { CrossSellsPage } from '../page-model/cross-sells';
import { CustomizableProductPage } from '../page-model/product/customizable-product';

interface CustomizableProductPageFixture {
  cartPage: CartPage,
  customizableProductPage: CustomizableProductPage,
  crossSellsPage: CrossSellsPage
}

export function testFactory (productPageUrl: string) {
  return test.extend<CustomizableProductPageFixture>({
    customizableProductPage: async ({ page }, use) => {
      const customizableProductPage = new CustomizableProductPage(page, productPageUrl);
      await customizableProductPage.goto();
      await use(customizableProductPage);
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
