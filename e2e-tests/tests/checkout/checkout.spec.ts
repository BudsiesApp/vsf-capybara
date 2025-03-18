import { test, expect } from '../../fixtures/checkout-page';
import { getRandomEmail } from '../../helpers/get-random-email';

const simpleProductUrl = '/p/voice-recorder/';

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
  await checkoutPage.personalDetailsStep.fillPersonalDetails('test first name', 'test last name', 'test@test.test');

  const shippingStepAddressForm = checkoutPage.shippingStep.addressForm;
  await expect(shippingStepAddressForm.firstNameInput).toHaveValue('test first name');
  await expect(shippingStepAddressForm.lastNameInput).toHaveValue('test last name');
  await expect(shippingStepAddressForm.selectedCountry).toContainText('United States');
  await expect(shippingStepAddressForm.stateSelector).toBeVisible();
  await expect(shippingStepAddressForm.stateInput).toBeHidden();

  await shippingStepAddressForm.expectCorrectValidation();
});

test('billing address form has correct validation', async ({ cartPage, checkoutPage, simpleProductPage, page }) => {
  await page.goto(simpleProductUrl);
  await simpleProductPage.waitPageToBeVisible();
  await simpleProductPage.addToCartAndVerifyResponse();

  await cartPage.goto();
  await checkoutPage.goto();

  await checkoutPage.personalDetailsStep.fillPersonalDetails('test first name', 'test last name', 'test@test.test');
  await checkoutPage.fillShippingAddress('test address', 'United States', 'California', 'City', '12345', '1234567890');

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
  await checkoutPage.personalDetailsStep.fillPersonalDetails('test first name', 'test last name', 'test@test.test');
  await checkoutPage.fillShippingAddress('test address', 'United States', 'California', 'City', '12345', '1234567890');
  await checkoutPage.fillBillingAddress();
  await checkoutPage.selectPaymentMethodAndPlaceOrder();
});

test('order can be placed and user account created', async ({ page, simpleProductPage, cartPage, checkoutPage }) => {
  await page.goto(simpleProductUrl);
  await simpleProductPage.waitPageToBeVisible();
  await simpleProductPage.addToCartAndVerifyResponse();

  await cartPage.goto();
  await checkoutPage.goto();

  const email = getRandomEmail();
  await checkoutPage.personalDetailsStep.fillPersonalDetails('test first name', 'test last name', email, true);

  await checkoutPage.fillShippingAddress('test address', 'United States', 'California', 'City', '12345', '1234567890');
  await checkoutPage.fillBillingAddress();
  await checkoutPage.selectPaymentMethodAndPlaceOrder(true);
  await expect(page.locator('._header .a-account-icon .sf-header__icon--is-active')).toBeVisible();
});
