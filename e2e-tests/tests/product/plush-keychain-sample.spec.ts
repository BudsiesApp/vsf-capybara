import { expect, test } from '../../fixtures/plush-keychain-sample-page';

const DESCRIPTION_TEXT = 'Test description';
const UPDATED_DESCRIPTION_TEXT = 'Updated description';

test('form layout is correct', async ({ customizableProductPage, page, verticalStepsProductPage, plushKeychainSamplePage }) => {
  await expect(verticalStepsProductPage.headingTitle).not.toBeEmpty();
  await expect(customizableProductPage.addToCartButton).toBeVisible();

  const uploadPhotoWidget = customizableProductPage.getCustomizationWidgetByLabel(plushKeychainSamplePage.UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL);
  const descriptionWidget = customizableProductPage.getCustomizationWidgetByLabel(plushKeychainSamplePage.descriptionCustomizationOptionValue);
  const nameWidget = customizableProductPage.getCustomizationWidgetByLabel(plushKeychainSamplePage.NAME_CUSTOMIZATION_OPTION_LABEL);
  const colorPaletteWidget = customizableProductPage.getCustomizationWidgetByLabel(plushKeychainSamplePage.COLOR_PALETTE_CUSTOMIZATION_OPTION_LABEL);
  const customerTypeWidget = customizableProductPage.getCustomizationWidgetByLabel(plushKeychainSamplePage.CUSTOMER_TYPE_CUSTOMIZATION_OPTION_LABEL);

  const emailWidget = customizableProductPage.getCustomizationWidgetByLabel(plushKeychainSamplePage.EMAIL_CUSTOMIZATION_OPTION_LABEL);
  const agreementCheckbox = page.locator(plushKeychainSamplePage.AGREEMENT_CHECKBOX_SELECTOR);

  await expect(uploadPhotoWidget).toBeVisible();
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

test('product can be edited', async ({ cartPage, customizableProductPage, plushKeychainSamplePage }) => {
  await plushKeychainSamplePage.fillRequiredFields(undefined, undefined, DESCRIPTION_TEXT);
  await customizableProductPage.addToCartAndVerifyResponse();

  await cartPage.waitPageToBeVisible();

  const cartItem = cartPage.getCartItemByProductName(plushKeychainSamplePage.productName);

  await expect(cartItem).toBeVisible();

  await cartPage.editCartItemByProductName(plushKeychainSamplePage.productName);

  await customizableProductPage.waitPageToBeVisible();

  const filledDescription = await customizableProductPage.getCustomizationTextValueByLabel(plushKeychainSamplePage.descriptionCustomizationOptionValue);

  expect(DESCRIPTION_TEXT).toEqual(filledDescription);
  await customizableProductPage.fillCustomizationTextValue(plushKeychainSamplePage.descriptionCustomizationOptionValue, UPDATED_DESCRIPTION_TEXT);

  await customizableProductPage.page.locator(plushKeychainSamplePage.AGREEMENT_CHECKBOX_SELECTOR).click();

  await customizableProductPage.addToCartAndVerifyResponse();
  await cartPage.waitPageToBeVisible();
});
