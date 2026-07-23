import { test, expect } from '../../fixtures/bulk-quote/pillow-quote-order-page.ts';

const PRODUCT_NAME = 'Bulk Pillow Sample';
const PROJECT_NAME = 'Test Project';
const PROJECT_DESCRIPTION = 'Test Description';
const DEFAULT_SIZE = '12" small';
const SIZE = '16" medium';

test('form errors displayed correctly', async ({ pillowQuoteOrderPage, quoteOrderPage }) => {
  await quoteOrderPage.submitForm();
  await quoteOrderPage.expectCorrectValidation();

  await pillowQuoteOrderPage.sizeSelectorField.expectOptionToBeSelected(DEFAULT_SIZE);
});

test('sample product is added to cart successfully', async ({ cartPage, pillowQuoteOrderPage, quoteOrderPage, bulkQuotationPage }) => {
  await quoteOrderPage.fillRequiredData();
  await pillowQuoteOrderPage.fillSize(SIZE);
  await quoteOrderPage.submitFormAndVerifyResponse();

  await bulkQuotationPage.waitPageToBeVisible();
  await bulkQuotationPage.submitQuoteAndVerifyResponse();

  await cartPage.waitPageToBeVisible();
  const cartItem = cartPage.getCartItemByProductName(PRODUCT_NAME);
  await expect(cartItem).toBeVisible();
  await cartPage.expectCartItemToHaveProperties(cartItem, [PROJECT_NAME, SIZE]);
});
