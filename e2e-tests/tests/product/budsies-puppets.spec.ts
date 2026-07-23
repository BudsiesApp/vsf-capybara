import { expect, testFactory } from '../../fixtures/vertical-steps-product-page';
import { CustomizableProductPage } from '../../page-model/product/customizable-product';

const DESCRIPTION_CUSTOMIZATION_OPTION_VALUE = 'Describe Your Budsies Puppets';
const UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL = 'Upload Your Artwork';
const UPGRADES_CUSTOMIZATION_OPTION_LABEL = 'Upgrade Your Plush (optional)';
const EMAIL_CUSTOMIZATION_OPTION_LABEL = 'Enter your email address';

const PRODUCT_NAME = 'Budsies Puppets';
const DESCRIPTION_TEXT = 'Test description';
const UPDATED_DESCRIPTION_TEXT = 'Updated description';
const TEST_EMAIL = 'test@test.test';

const test = testFactory('/budsies-puppets/create/');

async function fillRequiredFields (customizableProductPage: CustomizableProductPage) {
  await customizableProductPage.fillCustomizationImageValue(UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL);
  await customizableProductPage.fillCustomizationTextValue(DESCRIPTION_CUSTOMIZATION_OPTION_VALUE, DESCRIPTION_TEXT);
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
  const upgradesWidget = customizableProductPage.getCustomizationWidgetByLabel(UPGRADES_CUSTOMIZATION_OPTION_LABEL);
  const emailWidget = customizableProductPage.getCustomizationWidgetByLabel(EMAIL_CUSTOMIZATION_OPTION_LABEL);

  await expect(uploadPhotoWidget).toBeVisible();
  await expect(descriptionWidget).toBeVisible();
  await expect(upgradesWidget).toBeVisible();
  await expect(emailWidget).toBeVisible();

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
  await page.waitForFunction(() => window.scrollY <= 200);

  const imageWidget = customizableProductPage.getCustomizationWidgetByLabel(UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL);

  await expect(imageWidget).toBeVisible();

  const filledDescription = await customizableProductPage.getCustomizationTextValueByLabel(DESCRIPTION_CUSTOMIZATION_OPTION_VALUE);
  expect(filledDescription).toBeNull();

  const emailWidget = customizableProductPage.getCustomizationWidgetByLabel(EMAIL_CUSTOMIZATION_OPTION_LABEL);
  await expect(emailWidget).toBeHidden();
});
