import { mergeTests } from '@playwright/test';

import { test as checkoutTest, expect } from '../../fixtures/checkout-page';
import { test as pillowQuoteTest } from '../../fixtures/bulk-quote/pillow-quote-order-page';
import { test as plushQuoteTest } from '../../fixtures/bulk-quote/plush-quote-order-page';
import { testFactory } from '../../fixtures/bulk-quote/quote-order-page';
import { getRandomEmail } from '../../helpers/get-random-email';

const keychainQuoteUrl = '/keychain-quote/';

const quoteTest = testFactory(keychainQuoteUrl, '#keychain-quote');
const test = mergeTests(quoteTest, checkoutTest);
const allQoutesTest = mergeTests(test, pillowQuoteTest, plushQuoteTest);

const FIRST_NAME = 'First name';
const LAST_NAME = 'Last name';

test('personal details form has correct validation', async ({ cartPage, checkoutPage, quoteOrderPage, bulkQuotationPage }) => {
  await quoteOrderPage.fillRequiredData();
  await quoteOrderPage.submitFormAndVerifyResponse();
  await bulkQuotationPage.waitPageToBeVisible();
  await bulkQuotationPage.submitQuoteAndVerifyResponse();

  await cartPage.goto();
  await checkoutPage.goto();
  await checkoutPage.personalDetailsStep.waitToBeVisible();

  await checkoutPage.personalDetailsStep.expectCorrectValidation();
});

test('shipping address form has correct validation', async ({ cartPage, checkoutPage, quoteOrderPage, bulkQuotationPage }) => {
  await quoteOrderPage.fillRequiredData();
  await quoteOrderPage.submitFormAndVerifyResponse();
  await bulkQuotationPage.waitPageToBeVisible();
  await bulkQuotationPage.submitQuoteAndVerifyResponse();

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

test('billing address form has correct validation', async ({ cartPage, checkoutPage, quoteOrderPage, bulkQuotationPage }) => {
  await quoteOrderPage.fillRequiredData();
  await quoteOrderPage.submitFormAndVerifyResponse();
  await bulkQuotationPage.waitPageToBeVisible();
  await bulkQuotationPage.submitQuoteAndVerifyResponse();

  await cartPage.goto();
  await checkoutPage.goto();

  await checkoutPage.personalDetailsStep.fillPersonalDetails();
  await checkoutPage.fillShippingAddress();

  await checkoutPage.billingStep.useShippingAddressCheckbox.click();
  await checkoutPage.billingStep.addressForm.expectCorrectValidation();
});

test('order can be placed', async ({ cartPage, checkoutPage, quoteOrderPage, bulkQuotationPage }) => {
  test.setTimeout(60_000);
  await quoteOrderPage.fillRequiredData();
  await quoteOrderPage.submitFormAndVerifyResponse();
  await bulkQuotationPage.waitPageToBeVisible();
  await bulkQuotationPage.submitQuoteAndVerifyResponse();

  await cartPage.goto();

  await checkoutPage.goto();
  await checkoutPage.personalDetailsStep.fillPersonalDetails();
  await checkoutPage.fillShippingAddress();
  await checkoutPage.fillBillingAddress();
  await checkoutPage.selectPaymentMethodAndPlaceOrder();
});

test('order can be placed and user account created', async ({ cartPage, checkoutPage, quoteOrderPage, bulkQuotationPage }) => {
  test.setTimeout(60_000);

  await quoteOrderPage.fillRequiredData();
  await quoteOrderPage.submitFormAndVerifyResponse();
  await bulkQuotationPage.waitPageToBeVisible();
  await bulkQuotationPage.submitQuoteAndVerifyResponse();

  await cartPage.goto();
  await checkoutPage.goto();

  const email = getRandomEmail();
  await checkoutPage.personalDetailsStep.fillPersonalDetails(undefined, undefined, email, true);

  await checkoutPage.fillShippingAddress();
  await checkoutPage.fillBillingAddress();
  await checkoutPage.selectPaymentMethodAndPlaceOrder(true);
  await expect(cartPage.page.locator('._header .a-account-icon .sf-header__icon--is-active')).toBeVisible();
});

allQoutesTest('order can be placed with all type of samples', async ({ cartPage, checkoutPage, quoteOrderPage, bulkQuotationPage, pillowQuoteOrderPage, plushQuoteOrderPage }) => {
  allQoutesTest.slow();

  await quoteOrderPage.page.goto(keychainQuoteUrl);
  await quoteOrderPage.fillRequiredData();
  await quoteOrderPage.submitFormAndVerifyResponse();
  await bulkQuotationPage.waitPageToBeVisible();
  await bulkQuotationPage.submitQuoteAndVerifyResponse();

  await pillowQuoteOrderPage.goto();
  await pillowQuoteOrderPage.fillRequiredData();
  await pillowQuoteOrderPage.submitFormAndVerifyResponse();
  await bulkQuotationPage.waitPageToBeVisible();
  await bulkQuotationPage.submitQuoteAndVerifyResponse();

  await plushQuoteOrderPage.goto();
  await plushQuoteOrderPage.fillRequiredData();
  await plushQuoteOrderPage.fillPlushData();
  await plushQuoteOrderPage.submitFormAndVerifyResponse();
  await bulkQuotationPage.waitPageToBeVisible();
  await bulkQuotationPage.submitQuoteAndVerifyResponse();

  await cartPage.goto();
  await cartPage.waitPageToBeVisible();

  await checkoutPage.goto();
  await checkoutPage.personalDetailsStep.fillPersonalDetails();
  await checkoutPage.fillShippingAddress();
  await checkoutPage.fillBillingAddress();
  await checkoutPage.selectPaymentMethodAndPlaceOrder();
});
