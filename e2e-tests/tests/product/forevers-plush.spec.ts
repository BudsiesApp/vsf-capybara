import { expect, testFactory } from '../../fixtures/plushie-product-page';
import { CustomizableProductPage } from '../../page-model/product/customizable-product';
import { PlushieProductPage } from '../../page-model/product/plushie-product';

const UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL = 'Upload Photo of Pet';
const EMAIL_CUSTOMIZATION_OPTION_LABEL = 'Enter your email address';
const PET_NAME_CUSTOMIZATION_OPTION_LABEL = 'Your Pet\'s Name';
const PET_BREED_CUSTOMIZATION_OPTION_LABEL = 'Your Pet\'s Breed';

const SIZE_CUSTOMIZATION_OPTION_LABEL = 'Size';
const POSTURE_CUSTOMIZATION_OPTION_LABEL = 'Posture';
const MOUTH_SHAPE_CUSTOMIZATION_OPTION_LABEL = 'Mouth Shape';
const EAR_SHAPE_CUSTOMIZATION_OPTION_LABEL = 'Ear Shape';
const TAIL_SHAPE_CUSTOMIZATION_OPTION_LABEL = 'Tail';
const DIFFERENT_EYE_COLOR_CUSTOMIZATION_OPTION_LABEL = 'My pet has two different colored eyes';
const EYE_COLOR_CUSTOMIZATION_OPTION_LABEL = 'Eye Color';
const LEFT_EYE_COLOR_CUSTOMIZATION_OPTION_LABEL = 'Left Eye';
const RIGHT_EYE_COLOR_CUSTOMIZATION_OPTION_LABEL = 'Right Eye';
const FUR_COLOR_CUSTOMIZATION_OPTION_LABEL = 'Fur';
const COLOR_PALLETE_CUSTOMIZATION_OPTION_LABEL = 'Optional: Color Palette';
const DESCRIPTION_CUSTOMIZATION_OPTION_LABEL = 'Describe Your Pet\'s Physical Features';
const UPGRADES_CUSTOMIZATION_OPTION_LABEL = 'Upgrade Your Plush (optional)';
const DESCRIPTION_TEXT = 'Test description';
const UPDATED_DESCRIPTION_TEXT = 'Updated description';
const TEST_EMAIL = 'test@test.test';
const PET_NAME = 'Test Pet Name';
const UPDATED_PET_NAME = 'Updated Pet Name';

const TYPE_STEP_TITLE = 'Type';
const PHOTO_STEP_TITLE = 'Photo';
const PET_INFO_STEP_TITLE = 'Pet Info';
const CUSTOMIZATION_STEP_TITLE = 'Customize';

const test = testFactory('/forevers/create/');

async function fillPetInfoStepRequiredFields (customizableProductPage: CustomizableProductPage) {
  await customizableProductPage.fillCustomizationTextValue(PET_NAME_CUSTOMIZATION_OPTION_LABEL, PET_NAME);
  await customizableProductPage.fillCustomizationTextValue(EMAIL_CUSTOMIZATION_OPTION_LABEL, TEST_EMAIL);
}

async function fillCustomizeStepRequiredFields (customizableProductPage: CustomizableProductPage) {
  await customizableProductPage.fillCustomizationThumbnailValueByIndex(SIZE_CUSTOMIZATION_OPTION_LABEL, 0);
  await customizableProductPage.fillCustomizationThumbnailValueByIndex(POSTURE_CUSTOMIZATION_OPTION_LABEL, 0);
  await customizableProductPage.fillCustomizationThumbnailValueByIndex(MOUTH_SHAPE_CUSTOMIZATION_OPTION_LABEL, 0);
  await customizableProductPage.fillCustomizationThumbnailValueByIndex(EAR_SHAPE_CUSTOMIZATION_OPTION_LABEL, 0);
  await customizableProductPage.fillCustomizationThumbnailValueByIndex(TAIL_SHAPE_CUSTOMIZATION_OPTION_LABEL, 0);
  await customizableProductPage.fillCustomizationThumbnailValueByIndex(EYE_COLOR_CUSTOMIZATION_OPTION_LABEL, 0);
  await customizableProductPage.fillCustomizationThumbnailValueByIndex(FUR_COLOR_CUSTOMIZATION_OPTION_LABEL, 0);
  await customizableProductPage.fillCustomizationTextValue(DESCRIPTION_CUSTOMIZATION_OPTION_LABEL, DESCRIPTION_TEXT);

}

async function fillAllStepsRequiredFields (customizableProductPage: CustomizableProductPage, plushieProductPage: PlushieProductPage) {
  await plushieProductPage.waitStepToBeVisible(PHOTO_STEP_TITLE);
  await customizableProductPage.fillCustomizationImageValue(UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL);
  await plushieProductPage.clickContinueButton();

  await plushieProductPage.waitStepToBeVisible(PET_INFO_STEP_TITLE);
  await fillPetInfoStepRequiredFields(customizableProductPage);
  await plushieProductPage.clickContinueButton();

  await plushieProductPage.waitStepToBeVisible(CUSTOMIZATION_STEP_TITLE);
  await fillCustomizeStepRequiredFields(customizableProductPage);
}

test('form layout is correct', async ({ customizableProductPage, plushieProductPage }) => {
  await expect(plushieProductPage.headingTitle).not.toBeEmpty();
  await expect(plushieProductPage.typeSelector).toBeVisible();

  await plushieProductPage.selectTypeByIndex(0);
  await plushieProductPage.waitStepToBeVisible(PHOTO_STEP_TITLE);

  const uploadPhotoWidget = customizableProductPage.getCustomizationWidgetByLabel(UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL);
  await expect(uploadPhotoWidget).toBeVisible();
  await customizableProductPage.fillCustomizationImageValue(UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL);

  await plushieProductPage.clickContinueButton();

  await plushieProductPage.waitStepToBeVisible(PET_INFO_STEP_TITLE);

  const petNameWidget = customizableProductPage.getCustomizationWidgetByLabel(PET_NAME_CUSTOMIZATION_OPTION_LABEL);
  await expect(petNameWidget).toBeVisible();

  const petBreedWidget = customizableProductPage.getCustomizationWidgetByLabel(PET_BREED_CUSTOMIZATION_OPTION_LABEL);
  await expect(petBreedWidget).toBeVisible();

  const emailWidget = customizableProductPage.getCustomizationWidgetByLabel(EMAIL_CUSTOMIZATION_OPTION_LABEL);
  await expect(emailWidget).toBeVisible();
  await fillPetInfoStepRequiredFields(customizableProductPage);

  await plushieProductPage.clickContinueButton();
  await plushieProductPage.waitStepToBeVisible(CUSTOMIZATION_STEP_TITLE);

  const sizeWidget = customizableProductPage.getCustomizationWidgetByLabel(SIZE_CUSTOMIZATION_OPTION_LABEL);
  const postureWidget = customizableProductPage.getCustomizationWidgetByLabel(POSTURE_CUSTOMIZATION_OPTION_LABEL);
  const mouthShapeWidget = customizableProductPage.getCustomizationWidgetByLabel(MOUTH_SHAPE_CUSTOMIZATION_OPTION_LABEL);
  const earShapeWidget = customizableProductPage.getCustomizationWidgetByLabel(EAR_SHAPE_CUSTOMIZATION_OPTION_LABEL);
  const tailShapeWidget = customizableProductPage.getCustomizationWidgetByLabel(TAIL_SHAPE_CUSTOMIZATION_OPTION_LABEL);
  const differentEyeColorWidget = customizableProductPage.getCheckboxByLabel(DIFFERENT_EYE_COLOR_CUSTOMIZATION_OPTION_LABEL);
  const eyeColorWidget = customizableProductPage.getCustomizationWidgetByLabel(EYE_COLOR_CUSTOMIZATION_OPTION_LABEL);
  const leftEyeColorWidget = customizableProductPage.getCustomizationWidgetByLabel(LEFT_EYE_COLOR_CUSTOMIZATION_OPTION_LABEL);
  const rightEyeColorWidget = customizableProductPage.getCustomizationWidgetByLabel(RIGHT_EYE_COLOR_CUSTOMIZATION_OPTION_LABEL);
  const furColorWidget = customizableProductPage.getCustomizationWidgetByLabel(FUR_COLOR_CUSTOMIZATION_OPTION_LABEL);
  const colorPalleteWidget = customizableProductPage.getCustomizationWidgetByLabel(COLOR_PALLETE_CUSTOMIZATION_OPTION_LABEL);
  const descriptionWidget = customizableProductPage.getCustomizationWidgetByLabel(DESCRIPTION_CUSTOMIZATION_OPTION_LABEL);
  const upgradesWidget = customizableProductPage.getCustomizationWidgetByLabel(UPGRADES_CUSTOMIZATION_OPTION_LABEL);

  await expect(sizeWidget).toBeVisible();
  await expect(postureWidget).toBeVisible();
  await expect(mouthShapeWidget).toBeVisible();
  await expect(earShapeWidget).toBeVisible();
  await expect(tailShapeWidget).toBeVisible();
  await expect(differentEyeColorWidget).toBeVisible();
  await expect(eyeColorWidget).toBeVisible();
  await expect(furColorWidget).toBeVisible();
  await expect(colorPalleteWidget).toBeVisible();
  await expect(descriptionWidget).toBeVisible();
  await expect(upgradesWidget).toBeVisible();

  await expect(leftEyeColorWidget).toBeHidden();
  await expect(rightEyeColorWidget).toBeHidden();

  await customizableProductPage.toggleCheckboxCustomizationValue(DIFFERENT_EYE_COLOR_CUSTOMIZATION_OPTION_LABEL);
  await expect(leftEyeColorWidget).toBeVisible();
  await expect(rightEyeColorWidget).toBeVisible();
  await expect(plushieProductPage.agreement).toBeVisible();
  await expect(customizableProductPage.addToCartButton).toBeVisible();
  await expect(plushieProductPage.quantityField).toBeVisible();
  await expect(plushieProductPage.quantityPopupButton).toBeVisible();

  await plushieProductPage.quantityPopupButton.click();
  await expect(plushieProductPage.quantityDiscountPopup).toBeVisible();
});

test('form errors displayed correctly', async ({ plushieProductPage, customizableProductPage }) => {
  await plushieProductPage.selectTypeByIndex(0);
  await plushieProductPage.waitStepToBeVisible(PHOTO_STEP_TITLE);
  await plushieProductPage.clickContinueButton();
  await expect(plushieProductPage.formErrors).toBeVisible();

  await customizableProductPage.fillCustomizationImageValue(UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL);
  await expect(plushieProductPage.formErrors).toBeHidden();
  await plushieProductPage.clickContinueButton();

  await plushieProductPage.waitStepToBeVisible(PET_INFO_STEP_TITLE);
  await plushieProductPage.clickContinueButton();
  await expect(plushieProductPage.formErrors).toBeVisible();
  await fillPetInfoStepRequiredFields(customizableProductPage);
  await expect(plushieProductPage.formErrors).toBeHidden();
  await plushieProductPage.clickContinueButton();

  await plushieProductPage.waitStepToBeVisible(CUSTOMIZATION_STEP_TITLE);
  await customizableProductPage.addToCart();
  await expect(plushieProductPage.formErrors).toBeVisible();
  await fillCustomizeStepRequiredFields(customizableProductPage);
  await expect(plushieProductPage.formErrors).toBeHidden();
});

test('product added to cart successfully', async ({ crossSellsPage, plushieProductPage, customizableProductPage }) => {
  await plushieProductPage.selectTypeByIndex(0);
  await fillAllStepsRequiredFields(customizableProductPage, plushieProductPage);
  await customizableProductPage.addToCartAndVerifyResponse();
  await crossSellsPage.waitPageToBeVisible();
});

test('product can be edited', async ({ cartPage, crossSellsPage, customizableProductPage, plushieProductPage }) => {
  const productName = await plushieProductPage.selectTypeByIndex(0);
  expect(productName).not.toBeNull();

  await fillAllStepsRequiredFields(customizableProductPage, plushieProductPage);
  await customizableProductPage.addToCartAndVerifyResponse();
  await crossSellsPage.waitPageToBeVisible();

  await cartPage.goto();
  await cartPage.editCartItemByProductName(productName);

  await plushieProductPage.waitPageToBeVisible();
  await plushieProductPage.waitStepToBeVisible(PHOTO_STEP_TITLE);

  // make sure ability to change product type is disabled on edit
  const typeStepButton = plushieProductPage.page.locator(`.sf-steps__step--disabled:has-text("${TYPE_STEP_TITLE}")`);
  await expect(typeStepButton).toBeVisible();

  await plushieProductPage.clickContinueButton();
  await plushieProductPage.waitStepToBeVisible(PET_INFO_STEP_TITLE);
  const filledPetName = await customizableProductPage.getCustomizationTextValueByLabel(PET_NAME_CUSTOMIZATION_OPTION_LABEL);
  expect(PET_NAME).toEqual(filledPetName);
  await customizableProductPage.fillCustomizationTextValue(PET_NAME_CUSTOMIZATION_OPTION_LABEL, UPDATED_PET_NAME);

  await plushieProductPage.clickContinueButton();
  await plushieProductPage.waitStepToBeVisible(CUSTOMIZATION_STEP_TITLE);

  const filledDescription = await customizableProductPage.getCustomizationTextValueByLabel(DESCRIPTION_CUSTOMIZATION_OPTION_LABEL);
  expect(DESCRIPTION_TEXT).toEqual(filledDescription);

  await customizableProductPage.fillCustomizationTextValue(
    DESCRIPTION_CUSTOMIZATION_OPTION_LABEL,
    UPDATED_DESCRIPTION_TEXT
  );

  await customizableProductPage.addToCartAndVerifyResponse();
  await crossSellsPage.waitPageToBeVisible();

  await cartPage.goto();
  const updatedCartItem = cartPage.getCartItemByProductName(productName);
  await cartPage.expectCartItemToHaveProperties(updatedCartItem, [UPDATED_PET_NAME]);
});
