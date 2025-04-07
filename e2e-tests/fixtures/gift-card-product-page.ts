import { test as baseTest } from '@playwright/test';

import { CartPage } from '../page-model/cart/cart';
import { GiftCardProductPage } from '../page-model/product/gift-card-product';

interface GiftCardProductPageFixture {
  giftCardProductPage: GiftCardProductPage,
  cartPage: CartPage
}
export const test = baseTest.extend<GiftCardProductPageFixture>({
  giftCardProductPage: async ({ page }, use) => {
    const giftCardProductPage = new GiftCardProductPage(page);
    await giftCardProductPage.goto();
    await use(giftCardProductPage);
  },
  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await use(cartPage);
  }
});

export { expect } from '@playwright/test';
