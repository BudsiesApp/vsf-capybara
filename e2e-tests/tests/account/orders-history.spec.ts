import { mergeTests } from '@playwright/test';

import { test as checkoutPageTest } from '../../fixtures/checkout-page';
import { test as accountPageTest, expect } from '../../fixtures/account-page';
import { getRandomEmail } from '../../helpers/get-random-email';

const test = mergeTests(checkoutPageTest, accountPageTest);

test('item can be reordered', async ({ accountPage, page, printedSocksPage, cartPage, checkoutPage }) => {
  test.slow();

  await printedSocksPage.goto();
  await printedSocksPage.addProductToCart();

  await cartPage.goto();
  const cartItem = cartPage.getCartItemByProductName(printedSocksPage.PRODUCT_NAME);
  const properties = await cartPage.getCartItemProperties(cartItem);

  await checkoutPage.goto();

  const email = getRandomEmail();
  await checkoutPage.personalDetailsStep.fillPersonalDetails(undefined, undefined, email, true);

  await checkoutPage.fillShippingAddress();
  await checkoutPage.fillBillingAddress();
  await checkoutPage.selectPaymentMethodAndPlaceOrder(true);
  await expect(page.locator('._header .a-account-icon .sf-header__icon--is-active')).toBeVisible();

  await accountPage.goto();
  await accountPage.ordersHistorySection.activateSection();

  const firstOrderView = accountPage.ordersHistorySection.getOrderViewByIndex(0);
  const firstOrderItem = firstOrderView.getOrderItemByIndex(0);

  await firstOrderItem.reorderItem();

  await cartPage.goto();
  await cartPage.expectCartItemToHaveProperties(cartItem, properties);
  await checkoutPage.goto();

  await checkoutPage.personalDetailsStep.fillPersonalDetails();
  await checkoutPage.fillShippingAddress();
  await checkoutPage.fillBillingAddress();
  await checkoutPage.selectPaymentMethodAndPlaceOrder();
});
