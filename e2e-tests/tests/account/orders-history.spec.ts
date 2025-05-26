import { mergeTests } from '@playwright/test';

import { test as checkoutPageTest } from '../../fixtures/checkout-page';
import { test as accountPageTest, expect } from '../../fixtures/account-page';
import { test as plushSampleTest } from '../../fixtures/plush-sample-page';
import { getRandomEmail } from '../../helpers/get-random-email';

const test = mergeTests(checkoutPageTest, accountPageTest, plushSampleTest);

test('item can be reordered', async ({ accountPage, page, plushSamplePage, cartPage, checkoutPage }) => {
  test.slow();

  await plushSamplePage.goto();
  await plushSamplePage.fillRequiredFields();
  await plushSamplePage.customizableProductPage.addToCartAndVerifyResponse();

  await cartPage.goto();
  const cartItem = cartPage.getCartItemByProductName(plushSamplePage.productName);
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
