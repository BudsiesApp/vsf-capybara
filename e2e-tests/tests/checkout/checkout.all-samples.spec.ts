import { mergeTests } from '@playwright/test';

import { test as checkoutTest } from '../../fixtures/checkout-page';
import { test as pillowQuoteTest } from '../../fixtures/bulk-quote/pillow-quote-order-page';
import { test as plushQuoteTest } from '../../fixtures/bulk-quote/plush-quote-order-page';
import { test as plushKeychainQuoteTest } from '../../fixtures/bulk-quote/plush-keychain-quote-order-page';

const allQuotesTest = mergeTests(checkoutTest, pillowQuoteTest, plushQuoteTest, plushKeychainQuoteTest);

const keychainQuoteUrl = '/keychain-quote/';
const acrylicKeychainUrl = '/acrylic-keychain-quote/';

allQuotesTest('order can be placed with all type of samples', async ({ cartPage, checkoutPage, quoteOrderPage, bulkQuotationPage, pillowQuoteOrderPage, plushQuoteOrderPage, plushKeychainQuoteOrderPage }) => {
  allQuotesTest.setTimeout(180_000);

  await quoteOrderPage.page.goto(keychainQuoteUrl);
  await quoteOrderPage.fillRequiredData();
  await quoteOrderPage.submitFormAndVerifyResponse();
  await bulkQuotationPage.waitPageToBeVisible();
  await bulkQuotationPage.submitQuoteAndVerifyResponse();

  await quoteOrderPage.page.goto(acrylicKeychainUrl);
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

  await plushKeychainQuoteOrderPage.goto();
  await plushKeychainQuoteOrderPage.fillRequiredData();
  await plushKeychainQuoteOrderPage.fillPlushData();
  await plushKeychainQuoteOrderPage.submitFormAndVerifyResponse();
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
