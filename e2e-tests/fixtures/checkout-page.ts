import { test as baseTest } from './cart-page';

import { CheckoutPage } from '../page-model/cart/checkout';

interface CheckoutPageFixture {
  checkoutPage: CheckoutPage
}

export const test = baseTest.extend<CheckoutPageFixture>({
  checkoutPage: async ({ cartPage, page }, use) => {
    const checkoutPage = new CheckoutPage(page, cartPage);
    await use(checkoutPage);
  }
});

export { expect } from '@playwright/test';
