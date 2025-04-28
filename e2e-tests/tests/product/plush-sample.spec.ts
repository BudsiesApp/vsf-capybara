import { expect, test } from '../../fixtures/plush-sample-page';

const DESCRIPTION_TEXT = 'Test description';
const UPDATED_DESCRIPTION_TEXT = 'Updated description';

test('form layout is correct', async ({ customizableProductPage, page, verticalStepsProductPage, plushSamplePage }) => {
  await expect(verticalStepsProductPage.headingTitle).not.toBeEmpty();
  await expect(customizableProductPage.addToCartButton).toBeVisible();

  const uploadPhotoWidget = customizableProductPage.getCustomizationWidgetByLabel(plushSamplePage.UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL);
  const descriptionWidget = customizableProductPage.getCustomizationWidgetByLabel(plushSamplePage.DESCRIPTION_CUSTOMIZATION_OPTION_VALUE);
  const sizeWidget = customizableProductPage.getCustomizationWidgetByLabel(plushSamplePage.SIZE_CUSTOMIZATION_OPTION_LABEL);
  const nameWidget = customizableProductPage.getCustomizationWidgetByLabel(plushSamplePage.NAME_CUSTOMIZATION_OPTION_LABEL);
  const colorPaletteWidget = customizableProductPage.getCustomizationWidgetByLabel(plushSamplePage.COLOR_PALETTE_CUSTOMIZATION_OPTION_LABEL);
  const customerTypeWidget = customizableProductPage.getCustomizationWidgetByLabel(plushSamplePage.CUSTOMER_TYPE_CUSTOMIZATION_OPTION_LABEL);

  const emailWidget = customizableProductPage.getCustomizationWidgetByLabel(plushSamplePage.EMAIL_CUSTOMIZATION_OPTION_LABEL);
  const agreementCheckbox = page.locator(plushSamplePage.AGREEMENT_CHECKBOX_SELECTOR);

  await expect(uploadPhotoWidget).toBeVisible();
  await expect(sizeWidget).toBeVisible();
  await expect(nameWidget).toBeVisible();
  await expect(colorPaletteWidget).toBeVisible();
  await expect(customerTypeWidget).toBeVisible();
  await expect(descriptionWidget).toBeVisible();

  await expect(emailWidget).toBeVisible();
  await expect(agreementCheckbox).toBeVisible();
});

test('form errors displayed correctly', async ({ verticalStepsProductPage, customizableProductPage }) => {
  await customizableProductPage.addToCart();
  await expect(verticalStepsProductPage.formErrors).toBeVisible();
});

test('product added to cart successfully', async ({ cartPage, customizableProductPage, plushSamplePage }) => {
  await plushSamplePage.fillRequiredFields();
  await customizableProductPage.addToCartAndVerifyResponse();
  await cartPage.waitPageToBeVisible();
});

test('product display in cart correctly', async ({ cartPage, customizableProductPage, plushSamplePage }) => {
  await plushSamplePage.fillRequiredFields(undefined, undefined, DESCRIPTION_TEXT);
  await customizableProductPage.addToCartAndVerifyResponse();
  await cartPage.waitPageToBeVisible();

  const cartItem = cartPage.getCartItemByProductName(plushSamplePage.PRODUCT_NAME);

  await expect(cartItem).toBeVisible();
  await cartPage.expectCartItemToHaveProperties(cartItem, [DESCRIPTION_TEXT]);
});

test('product can be edited', async ({ cartPage, customizableProductPage, plushSamplePage }) => {
  await plushSamplePage.fillRequiredFields(undefined, undefined, DESCRIPTION_TEXT);
  await customizableProductPage.addToCartAndVerifyResponse();

  await cartPage.waitPageToBeVisible();
  await cartPage.editCartItemByProductName(plushSamplePage.PRODUCT_NAME);

  await customizableProductPage.waitPageToBeVisible();

  const filledDescription = await customizableProductPage.getCustomizationTextValueByLabel(plushSamplePage.DESCRIPTION_CUSTOMIZATION_OPTION_VALUE);

  expect(DESCRIPTION_TEXT).toEqual(filledDescription);
  await customizableProductPage.fillCustomizationTextValue(plushSamplePage.DESCRIPTION_CUSTOMIZATION_OPTION_VALUE, UPDATED_DESCRIPTION_TEXT);

  await customizableProductPage.page.locator(plushSamplePage.AGREEMENT_CHECKBOX_SELECTOR).click();

  await customizableProductPage.addToCartAndVerifyResponse();
  await cartPage.waitPageToBeVisible();

  const updatedCartItem = cartPage.getCartItemByProductName(plushSamplePage.PRODUCT_NAME);
  await cartPage.expectCartItemToHaveProperties(updatedCartItem, [UPDATED_DESCRIPTION_TEXT]);
});
