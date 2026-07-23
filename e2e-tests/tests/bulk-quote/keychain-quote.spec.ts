import { testFactory, expect } from '../../fixtures/bulk-quote/quote-order-page';

const test = testFactory('/keychain-quote/', '#keychain-quote');

const PRODUCT_NAME = 'Bulk Pillow Keychain Sample';
const PROJECT_NAME = 'Test Project';
const PROJECT_DESCRIPTION = 'Test Description';

test('form errors displayed correctly', async ({ quoteOrderPage }) => {
  await quoteOrderPage.submitForm();
  await quoteOrderPage.expectCorrectValidation();
});

test('quote is created successfully', async ({ quoteOrderPage }) => {
  await quoteOrderPage.fillRequiredData();
  await quoteOrderPage.submitFormAndVerifyResponse();
});

test('sample product is added to cart successfully', async ({ cartPage, quoteOrderPage, bulkQuotationPage }) => {
  await quoteOrderPage.fillRequiredData();
  await quoteOrderPage.submitFormAndVerifyResponse();

  await bulkQuotationPage.waitPageToBeVisible();
  await bulkQuotationPage.submitQuoteAndVerifyResponse();

  await cartPage.waitPageToBeVisible();
  const cartItem = cartPage.getCartItemByProductName(PRODUCT_NAME);
  await expect(cartItem).toBeVisible();
  await cartPage.expectCartItemToHaveProperties(cartItem, [PROJECT_NAME]);
});
