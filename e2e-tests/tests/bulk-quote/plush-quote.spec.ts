import { test, expect } from '../../fixtures/bulk-quote/plush-quote-order-page';

const PRODUCT_NAME = 'Bulk Plush Sample';
const PROJECT_NAME = 'Test Project';
const PROJECT_DESCRIPTION = 'Test Description';
const SIZE = '16';

test('form errors displayed correctly', async ({ plushQuoteOrderPage, quoteOrderPage }) => {
  await quoteOrderPage.submitForm();

  await plushQuoteOrderPage.sizeInputField.expectToHaveErrorMessage('The \'\'Size\'\' field is required');
  await plushQuoteOrderPage.sizeInputField.fill('5')
  await plushQuoteOrderPage.sizeInputField.expectToHaveErrorMessage("The 'Size' field must be between 6 and 16");
  await expect(plushQuoteOrderPage.colorSelectorError).toBeVisible();

  await quoteOrderPage.expectCorrectValidation();
});

test('sample product is added to cart successfully', async ({ cartPage, plushQuoteOrderPage, quoteOrderPage, bulkQuotationPage }) => {
  await quoteOrderPage.fillRequiredData();

  await plushQuoteOrderPage.sizeInputField.fill(SIZE);
  await plushQuoteOrderPage.selectColorByIndex(0);

  await quoteOrderPage.submitFormAndVerifyResponse();

  await bulkQuotationPage.waitPageToBeVisible();
  await bulkQuotationPage.submitQuoteAndVerifyResponse();

  await cartPage.waitPageToBeVisible();
  const cartItem = cartPage.getCartItemByProductName(PRODUCT_NAME);
  await expect(cartItem).toBeVisible();
  await cartPage.expectCartItemToHaveProperties(cartItem, [PROJECT_NAME, PROJECT_DESCRIPTION, SIZE]);
});
