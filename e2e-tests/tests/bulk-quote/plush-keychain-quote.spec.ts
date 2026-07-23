import { test, expect } from '../../fixtures/bulk-quote/plush-keychain-quote-order-page';

const PRODUCT_NAME = 'Bulk Plush Keychain Sample';
const PROJECT_NAME = 'Test Project';
const PROJECT_DESCRIPTION = 'Test Description';

test('form errors displayed correctly', async ({ plushKeychainQuoteOrderPage, quoteOrderPage }) => {
  await quoteOrderPage.submitForm();

  await expect(plushKeychainQuoteOrderPage.colorSelectorError).toBeVisible();

  await quoteOrderPage.expectCorrectValidation();
});

test('sample product is added to cart successfully', async ({ cartPage, plushKeychainQuoteOrderPage, quoteOrderPage, bulkQuotationPage }) => {
  await quoteOrderPage.fillRequiredData();

  await plushKeychainQuoteOrderPage.selectColorByIndex(0);

  await quoteOrderPage.submitFormAndVerifyResponse();

  await bulkQuotationPage.waitPageToBeVisible();
  await bulkQuotationPage.submitQuoteAndVerifyResponse();

  await cartPage.waitPageToBeVisible();
  const cartItem = cartPage.getCartItemByProductName(PRODUCT_NAME);
  await expect(cartItem).toBeVisible();
  await cartPage.expectCartItemToHaveProperties(cartItem, [PROJECT_NAME]);
});
