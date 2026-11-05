import { expect, testFactory } from '../../fixtures/vertical-steps-product-page';
import { CustomizableProductPage } from '../../page-model/product/customizable-product';

const DESCRIPTION_CUSTOMIZATION_OPTION_VALUE = 'Customize Your Petsies Figurines';
const UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL = 'Upload your photo';
const EYE_COLOR_TYPE_CUSTOMIZATION_OPTION_LABEL = 'Eye Color Type';
const EYE_COLOR_CUSTOMIZATION_OPTION_LABEL = 'Eye Color';
const FUR_COLOR_CUSTOMIZATION_OPTION_LABEL = 'Fur Color';
const UPGRADES_CUSTOMIZATION_OPTION_LABEL = 'Upgrade Your Plush (optional)';
const EMAIL_CUSTOMIZATION_OPTION_LABEL = 'Enter your email address';

const PRODUCT_NAME = 'Petsies Figurines';
const DESCRIPTION_TEXT = 'Test description';
const UPDATED_DESCRIPTION_TEXT = 'Updated description';
const TEST_EMAIL = 'test@test.test';

const test = testFactory('/petsies-figurines/create/');

async function fillRequiredFields (customizableProductPage: CustomizableProductPage) {
  await customizableProductPage.fillCustomizationImageValue(UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL);
  await customizableProductPage.fillCustomizationTextValue(DESCRIPTION_CUSTOMIZATION_OPTION_VALUE, DESCRIPTION_TEXT);
  await customizableProductPage.fillCustomizationSelectValueByIndex(EYE_COLOR_TYPE_CUSTOMIZATION_OPTION_LABEL, 1);
  await customizableProductPage.fillCustomizationThumbnailValueByIndex(EYE_COLOR_CUSTOMIZATION_OPTION_LABEL, 1);
  await customizableProductPage.fillCustomizationThumbnailValueByIndex(FUR_COLOR_CUSTOMIZATION_OPTION_LABEL, 1);
  await customizableProductPage.fillCustomizationTextValue(EMAIL_CUSTOMIZATION_OPTION_LABEL, TEST_EMAIL);
}

test('form layout is correct', async ({ customizableProductPage, verticalStepsProductPage }) => {
  await expect(verticalStepsProductPage.headingTitle).not.toBeEmpty();
  await expect(verticalStepsProductPage.saveAndMakeAnotherButton).toBeVisible();
  await expect(verticalStepsProductPage.agreement).toBeVisible();
  await expect(verticalStepsProductPage.quantityPopupButton).toBeVisible();

  await expect(customizableProductPage.addToCartButton).toBeVisible();
  await expect(customizableProductPage.quantityField).toBeVisible();

  const uploadPhotoWidget = customizableProductPage.getCustomizationWidgetByLabel(UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL);
  const descriptionWidget = customizableProductPage.getCustomizationWidgetByLabel(DESCRIPTION_CUSTOMIZATION_OPTION_VALUE);
  const eyeColorTypeWidget = customizableProductPage.getCustomizationWidgetByLabel(EYE_COLOR_TYPE_CUSTOMIZATION_OPTION_LABEL);
  const eyeColorWidget = customizableProductPage.getCustomizationWidgetByLabel(EYE_COLOR_CUSTOMIZATION_OPTION_LABEL);
  const furColorWidget = customizableProductPage.getCustomizationWidgetByLabel(FUR_COLOR_CUSTOMIZATION_OPTION_LABEL);
  const upgradesWidget = customizableProductPage.getCustomizationWidgetByLabel(UPGRADES_CUSTOMIZATION_OPTION_LABEL);
  const emailWidget = customizableProductPage.getCustomizationWidgetByLabel(EMAIL_CUSTOMIZATION_OPTION_LABEL);

  await expect(uploadPhotoWidget).toBeVisible();
  await expect(descriptionWidget).toBeVisible();
  await expect(eyeColorTypeWidget).toBeVisible();
  await expect(furColorWidget).toBeVisible();
  await expect(upgradesWidget).toBeVisible();
  await expect(emailWidget).toBeVisible();

  await expect(eyeColorWidget).toBeHidden();
  await customizableProductPage.fillCustomizationSelectValueByIndex(EYE_COLOR_TYPE_CUSTOMIZATION_OPTION_LABEL, 1);
  await expect(eyeColorWidget).toBeVisible();

  await verticalStepsProductPage.quantityPopupButton.click();
  await expect(verticalStepsProductPage.quantityDiscountPopup).toBeVisible();
});

test('form errors displayed correctly', async ({ verticalStepsProductPage, customizableProductPage }) => {
  await customizableProductPage.addToCart();
  await expect(verticalStepsProductPage.formErrors).toBeVisible();
});

test('product added to cart successfully', async ({ cartPage, customizableProductPage }) => {
  await fillRequiredFields(customizableProductPage);
  await customizableProductPage.addToCartAndVerifyResponse();
  await cartPage.waitPageToBeVisible();
});

test('product display in cart correctly', async ({ cartPage, customizableProductPage }) => {
  await fillRequiredFields(customizableProductPage);
  await customizableProductPage.addToCartAndVerifyResponse();
  await cartPage.waitPageToBeVisible();

  const cartItem = cartPage.getCartItemByProductName(PRODUCT_NAME);

  await expect(cartItem).toBeVisible();
});

test('product can be edited', async ({ cartPage, customizableProductPage }) => {
  await fillRequiredFields(customizableProductPage);
  await customizableProductPage.addToCartAndVerifyResponse();
  await cartPage.waitPageToBeVisible();

  await cartPage.editCartItemByProductName(PRODUCT_NAME);

  await customizableProductPage.waitPageToBeVisible();

  const filledDescription = await customizableProductPage.getCustomizationTextValueByLabel(DESCRIPTION_CUSTOMIZATION_OPTION_VALUE);

  expect(DESCRIPTION_TEXT).toEqual(filledDescription);
  await customizableProductPage.fillCustomizationTextValue(DESCRIPTION_CUSTOMIZATION_OPTION_VALUE, UPDATED_DESCRIPTION_TEXT);

  await customizableProductPage.addToCartAndVerifyResponse();
  await cartPage.waitPageToBeVisible();
});

test('form fields are reset after save and make another', async ({ page, customizableProductPage, verticalStepsProductPage }) => {
  await fillRequiredFields(customizableProductPage);
  await verticalStepsProductPage.makeAnotherAndVerifyResponse();
  await page.waitForFunction(() => window.scrollY <= 100);

  const imageWidget = customizableProductPage.getCustomizationWidgetByLabel(UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL);

  await expect(imageWidget).toBeVisible();

  const filledDescription = await customizableProductPage.getCustomizationTextValueByLabel(DESCRIPTION_CUSTOMIZATION_OPTION_VALUE);
  expect(filledDescription).toBeNull();

  const filledEyeColorType = await customizableProductPage.getCustomizationSelectValueByLabel(EYE_COLOR_TYPE_CUSTOMIZATION_OPTION_LABEL);
  expect(filledEyeColorType).toBe('Select Option');

  const eyeColorWidget = customizableProductPage.getCustomizationWidgetByLabel(EYE_COLOR_CUSTOMIZATION_OPTION_LABEL);
  await expect(eyeColorWidget).toBeHidden();

  const filledFurColor = await customizableProductPage.getCustomizationThumbnailValueByLabel(FUR_COLOR_CUSTOMIZATION_OPTION_LABEL);
  expect(filledFurColor).toBeNull();

  const emailWidget = customizableProductPage.getCustomizationWidgetByLabel(EMAIL_CUSTOMIZATION_OPTION_LABEL);
  await expect(emailWidget).toBeHidden();
});
