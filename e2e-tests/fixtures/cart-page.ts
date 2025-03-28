import { test as baseTest } from '@playwright/test';

import { CartPage } from '../page-model/cart/cart';

interface CartPageFixture {
  cartPage: CartPage
}

export const test = baseTest.extend<CartPageFixture>({
  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await use(cartPage);
  }
});

export { expect } from '@playwright/test';
