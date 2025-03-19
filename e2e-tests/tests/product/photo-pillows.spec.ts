import { expect, testFactory } from '../../fixtures/photo-pillow-product-page';
import { CustomizableProductPage } from '../../page-model/product/customizable-product';
import { PhotoPillowProductPage } from '../../page-model/product/photo-pillows-product';

const PRODUCT_NAME = 'Phrase Pillow';

const UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL = 'Upload your photo';
const EMAIL_CUSTOMIZATION_OPTION_LABEL = 'Enter your email address';
const PET_NAME_CUSTOMIZATION_OPTION_LABEL = 'Pet Name';
const FRONT_DESIGN_CUSTOMIZATION_OPTION_LABEL = 'Try a different design for the front';
const BACK_DESIGN_CUSTOMIZATION_OPTION_LABEL = 'Select design for the back of pillow';
const ACCENT_COLOR_CUSTOMIZATION_OPTION_LABEL = 'Accent Color';

const TEST_EMAIL = 'test@test.test';
const PET_NAME = 'Test Pet Name';

const FRONT_DESIGN_TITLE_STEP = 'Front Design';
const PHOTO_STEP_TITLE = 'Upload Photo';
const BACK_DESIGN_TITLE_STEP = 'Back Design';
const CUSTOM_OPTIONS_TITLE_STEP = 'Custom Options';
const ADD_TO_CART_TITLE_STEP = 'Add to Cart';

const test = testFactory('/photo-pillows/create/');

async function fillAllStepsRequiredFields (customizableProductPage: CustomizableProductPage, photoPillowProductPage: PhotoPillowProductPage) {
  await photoPillowProductPage.goToStep(FRONT_DESIGN_TITLE_STEP);
  await customizableProductPage.fillCustomizationThumbnailValueByIndex(FRONT_DESIGN_CUSTOMIZATION_OPTION_LABEL, 0);
  await photoPillowProductPage.clickNextButton();

  await photoPillowProductPage.waitStepToBeVisible(PHOTO_STEP_TITLE);
  await customizableProductPage.fillCustomizationImageValue(UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL);
  await photoPillowProductPage.clickNextButton();

  await photoPillowProductPage.waitStepToBeVisible(BACK_DESIGN_TITLE_STEP);
  await customizableProductPage.fillCustomizationThumbnailValueByIndex(BACK_DESIGN_CUSTOMIZATION_OPTION_LABEL, 0);
  await photoPillowProductPage.clickNextButton();

  await photoPillowProductPage.waitStepToBeVisible(CUSTOM_OPTIONS_TITLE_STEP);
  await customizableProductPage.fillCustomizationTextValue(PET_NAME_CUSTOMIZATION_OPTION_LABEL, PET_NAME);
  await customizableProductPage.fillCustomizationThumbnailValueByIndex(ACCENT_COLOR_CUSTOMIZATION_OPTION_LABEL, 0);
  await photoPillowProductPage.clickNextButton();

  await photoPillowProductPage.waitStepToBeVisible(ADD_TO_CART_TITLE_STEP);
  await customizableProductPage.fillCustomizationTextValue(EMAIL_CUSTOMIZATION_OPTION_LABEL, TEST_EMAIL);
}

test('form layout is correct', async ({ customizableProductPage, photoPillowProductPage }) => {
  await expect(photoPillowProductPage.headingTitle).not.toBeEmpty();
  await expect(photoPillowProductPage.subtitle).not.toBeEmpty();
  await expect(photoPillowProductPage.formPreview).toBeVisible();
  await expect(photoPillowProductPage.designImages).toBeVisible();

  const frontDesignWidget = customizableProductPage.getCustomizationWidgetByLabel(FRONT_DESIGN_CUSTOMIZATION_OPTION_LABEL);
  const photoUploadWidget = customizableProductPage.getCustomizationWidgetByLabel(UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL);
  const backDesignWidget = customizableProductPage.getCustomizationWidgetByLabel(BACK_DESIGN_CUSTOMIZATION_OPTION_LABEL);
  const petNameWidget = customizableProductPage.getCustomizationWidgetByLabel(PET_NAME_CUSTOMIZATION_OPTION_LABEL);
  const accentColorWidget = customizableProductPage.getCustomizationWidgetByLabel(ACCENT_COLOR_CUSTOMIZATION_OPTION_LABEL);
  const emailWidget = customizableProductPage.getCustomizationWidgetByLabel(EMAIL_CUSTOMIZATION_OPTION_LABEL);

  await expect(frontDesignWidget).toBeVisible();
  await photoPillowProductPage.clickNextButton();

  await photoPillowProductPage.waitStepToBeVisible(PHOTO_STEP_TITLE);
  await expect(photoUploadWidget).toBeVisible();
  await photoPillowProductPage.clickNextButton();

  await photoPillowProductPage.waitStepToBeVisible(BACK_DESIGN_TITLE_STEP);
  await expect(backDesignWidget).toBeVisible();
  await photoPillowProductPage.clickNextButton();

  await photoPillowProductPage.waitStepToBeVisible(CUSTOM_OPTIONS_TITLE_STEP);
  await expect(petNameWidget).toBeVisible();
  await expect(accentColorWidget).toBeVisible();
  await photoPillowProductPage.clickNextButton();

  await photoPillowProductPage.waitStepToBeVisible(ADD_TO_CART_TITLE_STEP);
  await expect(emailWidget).toBeVisible();
  await expect(photoPillowProductPage.quantityField).toBeVisible();
  await expect(customizableProductPage.addToCartButton).toBeVisible();
  await expect(photoPillowProductPage.agreement).toBeVisible();
});

test('form errors displayed correctly', async ({ photoPillowProductPage, customizableProductPage }) => {
  await photoPillowProductPage.goToStep(ADD_TO_CART_TITLE_STEP);
  await customizableProductPage.addToCart();

  await photoPillowProductPage.waitStepToBeVisible(PHOTO_STEP_TITLE);
  const uploadPhotoWidget = customizableProductPage.getCustomizationWidgetByLabel(UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL);
  const uploadPhotoError = uploadPhotoWidget.locator('._error-message');
  await expect(uploadPhotoError).toBeVisible();
  await customizableProductPage.fillCustomizationImageValue(UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL);
  await expect(uploadPhotoError).toBeEmpty();
  await photoPillowProductPage.goToStep(ADD_TO_CART_TITLE_STEP);

  const emailWidget = customizableProductPage.getCustomizationWidgetByLabel(EMAIL_CUSTOMIZATION_OPTION_LABEL);
  const emailError = emailWidget.locator('.sf-input__error-message');

  await customizableProductPage.addToCart();
  await expect(emailError).not.toBeEmpty();
});

test('product added to cart successfully', async ({ cartPage, crossSellsPage, photoPillowProductPage, customizableProductPage }) => {
  await fillAllStepsRequiredFields(customizableProductPage, photoPillowProductPage);
  await photoPillowProductPage.addToCartAndVerifyResponse();
  await crossSellsPage.waitPageToBeVisible();

  await cartPage.goto();
  await cartPage.waitPageToBeVisible();
  const cartItem = cartPage.getCartItemByProductName(PRODUCT_NAME);
  await expect(cartItem).toBeVisible();
});
