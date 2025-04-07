import { test as baseTest } from '@playwright/test';

import { CartPage } from '../page-model/cart/cart';
import { PrintedSocksPage } from '../page-model/product/printed-socks';
import { CrossSellsPage } from '../page-model/cross-sells';
import { CustomizableProductPage } from '../page-model/product/customizable-product';
import { SimpleProductPage } from '../page-model/product/simple-product';
import { GiftCardProductPage } from '../page-model/product/gift-card-product';

interface CartPageFixture {
  cartPage: CartPage,
  printedSocksPage: PrintedSocksPage,
  crossSellsPage: CrossSellsPage,
  customizableProductPage: CustomizableProductPage,
  simpleProductPage: SimpleProductPage,
  giftCardProductPage: GiftCardProductPage
}

export const test = baseTest.extend<CartPageFixture>({
  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await use(cartPage);
  },
  customizableProductPage: async ({ page }, use) => {
    const customizableProductPage = new CustomizableProductPage(page, '/');
    await use(customizableProductPage);
  },
  printedSocksPage: async ({ crossSellsPage, customizableProductPage, page }, use) => {
    const printedSocksPage = new PrintedSocksPage(page, customizableProductPage, crossSellsPage);
    await use(printedSocksPage);
  },
  crossSellsPage: async ({ page }, use) => {
    const crossSellsPage = new CrossSellsPage(page);
    await use(crossSellsPage);
  },
  simpleProductPage: async ({ page }, use) => {
    const simpleProductPage = new SimpleProductPage(page);
    await use(simpleProductPage);
  },
  giftCardProductPage: async ({ page }, use) => {
    const giftCardProductPage = new GiftCardProductPage(page);
    await use(giftCardProductPage);
  }
});

export { expect } from '@playwright/test';
