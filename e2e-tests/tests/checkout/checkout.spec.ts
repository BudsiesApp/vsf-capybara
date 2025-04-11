import { test, expect } from '../../fixtures/checkout-page';
import { getRandomEmail } from '../../helpers/get-random-email';

const simpleProductUrl = '/p/voice-recorder/';

const FIRST_NAME = 'First name';
const LAST_NAME = 'Last name';

test('personal details form has correct validation', async ({ page, cartPage, checkoutPage, simpleProductPage }) => {
  await page.goto(simpleProductUrl);
  await simpleProductPage.waitPageToBeVisible();
  await simpleProductPage.addToCartAndVerifyResponse();

  await cartPage.goto();
  await checkoutPage.goto();
  await checkoutPage.personalDetailsStep.waitToBeVisible();

  await checkoutPage.personalDetailsStep.expectCorrectValidation();
});

test('shipping address form has correct validation', async ({ cartPage, checkoutPage, simpleProductPage, page }) => {
  await page.goto(simpleProductUrl);
  await simpleProductPage.waitPageToBeVisible();
  await simpleProductPage.addToCartAndVerifyResponse();

  await cartPage.goto();
  await checkoutPage.goto();
  await checkoutPage.personalDetailsStep.fillPersonalDetails(FIRST_NAME, LAST_NAME);

  const shippingStepAddressForm = checkoutPage.shippingStep.addressForm;
  await shippingStepAddressForm.firstNameFormField.expectToHaveValue(FIRST_NAME);
  await shippingStepAddressForm.lastNameFormField.expectToHaveValue(LAST_NAME);
  await shippingStepAddressForm.countrySelectorFormField.expectOptionToBeSelected('United States');

  await expect(shippingStepAddressForm.stateSelectorFormField.formField).toBeVisible();
  await expect(shippingStepAddressForm.stateInputFormField.formField).toBeHidden();

  await shippingStepAddressForm.expectCorrectValidation();
});

test('billing address form has correct validation', async ({ cartPage, checkoutPage, simpleProductPage, page }) => {
  await page.goto(simpleProductUrl);
  await simpleProductPage.waitPageToBeVisible();
  await simpleProductPage.addToCartAndVerifyResponse();

  await cartPage.goto();
  await checkoutPage.goto();

  await checkoutPage.personalDetailsStep.fillPersonalDetails();
  await checkoutPage.fillShippingAddress();

  await checkoutPage.billingStep.useShippingAddressCheckbox.click();
  await checkoutPage.billingStep.addressForm.expectCorrectValidation();
});

test('order can be placed', async ({ page, printedSocksPage, simpleProductPage, cartPage, checkoutPage }) => {
  await page.goto(simpleProductUrl);
  await simpleProductPage.waitPageToBeVisible();
  await simpleProductPage.addToCartAndVerifyResponse();

  await printedSocksPage.goto();
  await printedSocksPage.addProductToCart();
  await cartPage.goto();

  await checkoutPage.goto();
  await checkoutPage.personalDetailsStep.fillPersonalDetails();
  await checkoutPage.fillShippingAddress();
  await checkoutPage.fillBillingAddress();
  await checkoutPage.selectPaymentMethodAndPlaceOrder();
});

test('order can be placed and user account created', async ({ page, simpleProductPage, cartPage, checkoutPage }) => {
  test.setTimeout(60_000);

  await page.goto(simpleProductUrl);
  await simpleProductPage.waitPageToBeVisible();
  await simpleProductPage.addToCartAndVerifyResponse();

  await cartPage.goto();
  await checkoutPage.goto();

  const email = getRandomEmail();
  await checkoutPage.personalDetailsStep.fillPersonalDetails(undefined, undefined, email, true);

  await checkoutPage.fillShippingAddress();
  await checkoutPage.fillBillingAddress();
  await checkoutPage.selectPaymentMethodAndPlaceOrder(true);
  await expect(page.locator('._header .a-account-icon .sf-header__icon--is-active')).toBeVisible();
});

test('shipping step is hidden if cart contains only virtual gift card', async ({ giftCardProductPage, checkoutPage }) => {
  await giftCardProductPage.goto();
  await giftCardProductPage.fillFormData();
  await giftCardProductPage.addToCartButton.click();

  await checkoutPage.goto();

  await checkoutPage.personalDetailsStep.waitToBeVisible();
  await checkoutPage.expectStepToBeHidden(checkoutPage.stepsName.shipping);
});

test('shipping step is visible if cart contains virtual gift card and other product', async ({ giftCardProductPage, page, cartPage, checkoutPage, simpleProductPage }) => {
  await giftCardProductPage.goto();
  await giftCardProductPage.fillFormData();
  await giftCardProductPage.addToCartButton.click();

  await page.goto(simpleProductUrl);
  await simpleProductPage.waitPageToBeVisible();
  await simpleProductPage.addToCartAndVerifyResponse();

  await cartPage.goto();
  await checkoutPage.goto();
  await checkoutPage.expectStepToBeVisible(checkoutPage.stepsName.shipping);
});

test('shipping step is visible if cart contains only gift card with "Send physical" option enabled', async ({ giftCardProductPage, checkoutPage }) => {
  await giftCardProductPage.goto();
  await giftCardProductPage.fillFormData(undefined, undefined, undefined, true);
  await giftCardProductPage.addToCartButton.click();

  await checkoutPage.goto();
  await checkoutPage.expectStepToBeVisible(checkoutPage.stepsName.shipping);
});

test('Gift Cards payment is not available if cart contains Gift Card', async ({ giftCardProductPage, checkoutPage }) => {
  await giftCardProductPage.goto();
  await giftCardProductPage.fillFormData();
  await giftCardProductPage.addToCartButton.click();

  await checkoutPage.goto();
  await checkoutPage.personalDetailsStep.fillPersonalDetails();
  await checkoutPage.fillBillingAddress(false);

  await checkoutPage.orderReviewStep.expectGiftCardPaymentToBeNotAvailable();
});
