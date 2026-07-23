import { expect, testFactory } from '../../fixtures/vertical-steps-product-page';
import { CustomizableProductPage } from '../../page-model/product/customizable-product';

const DESCRIPTION_CUSTOMIZATION_OPTION_VALUE = 'Customize Your Selfies Puppets';
const UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL = 'Upload Your Artwork';
const EYE_COLOR_CUSTOMIZATION_OPTION_LABEL = 'Eye Color';
const SKIN_TONE_CUSTOMIZATION_OPTION_LABEL = 'Skin Tone';
const HAIR_COLOR_CUSTOMIZATION_OPTION_LABEL = 'Hair Color';
const HEAD_CUSTOMIZATION_OPTION_LABEL = 'Head';
const EYES_CUSTOMIZATION_OPTION_LABEL = 'Eyes';
const EYEBROWS_CUSTOMIZATION_OPTION_LABEL = 'Eyebrows';
const NOSE_CUSTOMIZATION_OPTION_LABEL = 'Nose';
const UPGRADES_CUSTOMIZATION_OPTION_LABEL = 'Upgrade Your Plush (optional)';
const EMAIL_CUSTOMIZATION_OPTION_LABEL = 'Enter your email address';

const PRODUCT_NAME = 'Selfies Puppets';
const DESCRIPTION_TEXT = 'Test description';
const UPDATED_DESCRIPTION_TEXT = 'Updated description';
const TEST_EMAIL = 'test@test.test';

const test = testFactory('/selfies-puppets/create/');

async function fillRequiredFields (customizableProductPage: CustomizableProductPage) {
  await customizableProductPage.fillCustomizationImageValue(UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL);
  await customizableProductPage.fillCustomizationTextValue(DESCRIPTION_CUSTOMIZATION_OPTION_VALUE, DESCRIPTION_TEXT);
  await customizableProductPage.fillCustomizationThumbnailValueByIndex(EYE_COLOR_CUSTOMIZATION_OPTION_LABEL, 1);
  await customizableProductPage.fillCustomizationThumbnailValueByIndex(SKIN_TONE_CUSTOMIZATION_OPTION_LABEL, 1);
  await customizableProductPage.fillCustomizationThumbnailValueByIndex(HAIR_COLOR_CUSTOMIZATION_OPTION_LABEL, 1);
  await customizableProductPage.fillCustomizationThumbnailValueByIndex(HEAD_CUSTOMIZATION_OPTION_LABEL, 1);
  await customizableProductPage.fillCustomizationThumbnailValueByIndex(EYES_CUSTOMIZATION_OPTION_LABEL, 1);
  await customizableProductPage.fillCustomizationThumbnailValueByIndex(EYEBROWS_CUSTOMIZATION_OPTION_LABEL, 1);
  await customizableProductPage.fillCustomizationThumbnailValueByIndex(NOSE_CUSTOMIZATION_OPTION_LABEL, 1);
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
  const eyeColorWidget = customizableProductPage.getCustomizationWidgetByLabel(EYE_COLOR_CUSTOMIZATION_OPTION_LABEL);
  const skinToneWidget = customizableProductPage.getCustomizationWidgetByLabel(SKIN_TONE_CUSTOMIZATION_OPTION_LABEL);
  const hairColorWidget = customizableProductPage.getCustomizationWidgetByLabel(HAIR_COLOR_CUSTOMIZATION_OPTION_LABEL);
  const headWidget = customizableProductPage.getCustomizationWidgetByLabel(HEAD_CUSTOMIZATION_OPTION_LABEL);
  const eyesWidget = customizableProductPage.getCustomizationWidgetByLabel(EYES_CUSTOMIZATION_OPTION_LABEL);
  const eyebrowsWidget = customizableProductPage.getCustomizationWidgetByLabel(EYEBROWS_CUSTOMIZATION_OPTION_LABEL);
  const noseWidget = customizableProductPage.getCustomizationWidgetByLabel(NOSE_CUSTOMIZATION_OPTION_LABEL);

  const upgradesWidget = customizableProductPage.getCustomizationWidgetByLabel(UPGRADES_CUSTOMIZATION_OPTION_LABEL);
  const emailWidget = customizableProductPage.getCustomizationWidgetByLabel(EMAIL_CUSTOMIZATION_OPTION_LABEL);

  await expect(uploadPhotoWidget).toBeVisible();
  await expect(descriptionWidget).toBeVisible();
  await expect(eyeColorWidget).toBeVisible();
  await expect(skinToneWidget).toBeVisible();
  await expect(hairColorWidget).toBeVisible();
  await expect(headWidget).toBeVisible();
  await expect(eyesWidget).toBeVisible();
  await expect(eyebrowsWidget).toBeVisible();
  await expect(noseWidget).toBeVisible();
  await expect(upgradesWidget).toBeVisible();
  await expect(emailWidget).toBeVisible();

  await verticalStepsProductPage.quantityPopupButton.click();
  await expect(verticalStepsProductPage.quantityDiscountPopup).toBeVisible();
});

test('form errors displayed correctly', async ({ verticalStepsProductPage, customizableProductPage }) => {
  await customizableProductPage.addToCart();
  await expect(verticalStepsProductPage.formErrors).toBeVisible();
});

test('product added to cart successfully', async ({ crossSellsPage, customizableProductPage }) => {
  await fillRequiredFields(customizableProductPage);
  await customizableProductPage.addToCartAndVerifyResponse();
  await crossSellsPage.waitPageToBeVisible();
});

test('product display in cart correctly', async ({ cartPage, crossSellsPage, customizableProductPage }) => {
  await fillRequiredFields(customizableProductPage);
  await customizableProductPage.addToCartAndVerifyResponse();
  await crossSellsPage.waitPageToBeVisible();

  await cartPage.goto();

  const cartItem = cartPage.getCartItemByProductName(PRODUCT_NAME);

  await expect(cartItem).toBeVisible();
});

test('product can be edited', async ({ cartPage, crossSellsPage, customizableProductPage }) => {
  await fillRequiredFields(customizableProductPage);
  await customizableProductPage.addToCartAndVerifyResponse();
  await crossSellsPage.waitPageToBeVisible();
  await cartPage.goto();

  await cartPage.editCartItemByProductName(PRODUCT_NAME);

  await customizableProductPage.waitPageToBeVisible();

  const filledDescription = await customizableProductPage.getCustomizationTextValueByLabel(DESCRIPTION_CUSTOMIZATION_OPTION_VALUE);

  expect(DESCRIPTION_TEXT).toEqual(filledDescription);
  await customizableProductPage.fillCustomizationTextValue(DESCRIPTION_CUSTOMIZATION_OPTION_VALUE, UPDATED_DESCRIPTION_TEXT);

  await customizableProductPage.addToCartAndVerifyResponse();

  await crossSellsPage.waitPageToBeVisible();
  await cartPage.goto();

  const updatedCartItem = cartPage.getCartItemByProductName(PRODUCT_NAME);
  await expect(updatedCartItem).toBeVisible();
});

test('form fields are reset after save and make another', async ({ page, customizableProductPage, verticalStepsProductPage }) => {
  await fillRequiredFields(customizableProductPage);
  await verticalStepsProductPage.makeAnotherAndVerifyResponse();

  await page.waitForFunction(() => window.scrollY <= 200);

  const imageWidget = customizableProductPage.getCustomizationWidgetByLabel(UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL);

  await expect(imageWidget).toBeVisible();

  const filledDescription = await customizableProductPage.getCustomizationTextValueByLabel(DESCRIPTION_CUSTOMIZATION_OPTION_VALUE);
  expect(filledDescription).toBeNull();

  const selectedEyeColor = await customizableProductPage.getCustomizationThumbnailValueByLabel(EYE_COLOR_CUSTOMIZATION_OPTION_LABEL);
  expect(selectedEyeColor).toBeNull();

  const selectedSkinTone = await customizableProductPage.getCustomizationThumbnailValueByLabel(SKIN_TONE_CUSTOMIZATION_OPTION_LABEL);
  expect(selectedSkinTone).toBeNull();

  const selectedHairColor = await customizableProductPage.getCustomizationThumbnailValueByLabel(HAIR_COLOR_CUSTOMIZATION_OPTION_LABEL);
  expect(selectedHairColor).toBeNull();

  const emailWidget = customizableProductPage.getCustomizationWidgetByLabel(EMAIL_CUSTOMIZATION_OPTION_LABEL);
  await expect(emailWidget).toBeHidden();
});
