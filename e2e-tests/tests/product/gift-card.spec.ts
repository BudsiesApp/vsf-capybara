import { expect, test } from '../../fixtures/gift-card-product-page';

test('form has correct validation', async ({ giftCardProductPage }) => {
  await giftCardProductPage.expectCorrectValidation();
});

test('product added to cart successfully with pre-defined amount', async ({ cartPage, giftCardProductPage }) => {
  await giftCardProductPage.fillFormData();
  await giftCardProductPage.addToCartButton.click();

  await cartPage.waitPageToBeVisible();
  const giftCardProduct = cartPage.getCartItemByProductName(giftCardProductPage.PRODUCT_NAME);

  await expect(giftCardProduct).toBeVisible();
  await cartPage.expectCartItemRegularPriceToBe(giftCardProduct, '$200');
});

test('product added to cart successfully with custom amount', async ({ cartPage, giftCardProductPage }) => {
  await giftCardProductPage.fillFormData();

  await giftCardProductPage.selectCustomAmountOption();
  await giftCardProductPage.customValueInputFormField.fill('400');

  await giftCardProductPage.addToCartButton.click();
  await cartPage.waitPageToBeVisible();
  const giftCardProduct = cartPage.getCartItemByProductName(giftCardProductPage.PRODUCT_NAME);

  await expect(giftCardProduct).toBeVisible();
  await cartPage.expectCartItemRegularPriceToBe(giftCardProduct, '$400');
});

test('product preview has correct data', async ({ giftCardProductPage }) => {
  await giftCardProductPage.fillFormData();

  await giftCardProductPage.expectPreviewToHaveCorrectData(200);

  await giftCardProductPage.selectCustomAmountOption();
  await giftCardProductPage.customValueInputFormField.fill('400');
  await giftCardProductPage.expectPreviewToHaveCorrectData(400);
});
