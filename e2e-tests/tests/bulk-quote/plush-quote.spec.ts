import { test, expect } from '../../fixtures/bulk-quote/plush-quote-order-page';

const PRODUCT_NAME = 'Bulk Plush Sample';
const PROJECT_NAME = 'Test Project';
const PROJECT_DESCRIPTION = 'Test Description';

test('form errors displayed correctly', async ({ plushQuoteOrderPage, quoteOrderPage }) => {
  await quoteOrderPage.submitForm();

  await plushQuoteOrderPage.sizeInputField.expectToHaveErrorMessage('The \'Size in inches\' field is required');
  await expect(plushQuoteOrderPage.colorSelectorError).toBeVisible();

  await quoteOrderPage.expectCorrectValidation();
});

test('sample product is added to cart successfully', async ({ cartPage, plushQuoteOrderPage, quoteOrderPage, bulkQuotationPage }) => {
  await quoteOrderPage.fillRequiredData();

  await plushQuoteOrderPage.sizeInputField.selectByOptionIndex(2);
  await plushQuoteOrderPage.selectColorByIndex(0);
  const selectedSize = await plushQuoteOrderPage.sizeInputField.getSelectedOptionTitle();

  await quoteOrderPage.submitFormAndVerifyResponse();

  await bulkQuotationPage.waitPageToBeVisible();
  await bulkQuotationPage.submitQuoteAndVerifyResponse();

  await cartPage.waitPageToBeVisible();
  const cartItem = cartPage.getCartItemByProductName(PRODUCT_NAME);
  await expect(cartItem).toBeVisible();
  await cartPage.expectCartItemToHaveProperties(cartItem, [PROJECT_NAME, selectedSize]);
});
