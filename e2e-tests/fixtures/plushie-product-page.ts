import { test } from '@playwright/test';

import { CartPage } from '../page-model/cart/cart';
import { CrossSellsPage } from '../page-model/cross-sells';
import { CustomizableProductPage } from '../page-model/product/customizable-product';
import { PlushieProductPage } from '../page-model/product/plushie-product';

interface PlushieProductPageFixture {
  cartPage: CartPage,
  customizableProductPage: CustomizableProductPage,
  crossSellsPage: CrossSellsPage,
  plushieProductPage: PlushieProductPage
}

export function testFactory (productPageUrl: string) {
  return test.extend<PlushieProductPageFixture>({
    customizableProductPage: async ({ page }, use) => {
      const customizableProductPage = new CustomizableProductPage(page, productPageUrl);
      await customizableProductPage.goto();
      await use(customizableProductPage);
    },
    plushieProductPage: async ({ page }, use) => {
      const plushieProductPage = new PlushieProductPage(page);
      await use(plushieProductPage);
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
