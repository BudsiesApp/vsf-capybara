import { expect, testFactory } from '../../fixtures/vertical-steps-product-page';
import { CustomizableProductPage } from '../../page-model/product/customizable-product';

const UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL = 'Please upload your awesome design';
const SIZE_CUSTOMIZATION_OPTION_LABEL = 'Size in inches';
const NAME_CUSTOMIZATION_OPTION_LABEL = 'Name';
const DESCRIPTION_CUSTOMIZATION_OPTION_VALUE = 'Describe Your Bulk Pillow Sample';
const CUSTOMER_TYPE_CUSTOMIZATION_OPTION_LABEL = 'Which of the following best describes you?';
const EMAIL_CUSTOMIZATION_OPTION_LABEL = 'Enter your email address';
const AGREEMENT_CHECKBOX_SELECTOR = '.sf-checkbox._agreement label';

const PRODUCT_NAME = 'Bulk Pillow Sample';
const NAME_TEXT = 'Test name';
const DESCRIPTION_TEXT = 'Test description';
const UPDATED_DESCRIPTION_TEXT = 'Updated description';
const TEST_EMAIL = 'test@test.test';

const test = testFactory('/bulk-pillow-samples/create/');

async function fillRequiredFields (customizableProductPage: CustomizableProductPage) {
  await customizableProductPage.fillCustomizationImageValue(UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL);
  await customizableProductPage.fillCustomizationSelectValueByIndex(SIZE_CUSTOMIZATION_OPTION_LABEL, 1);
  await customizableProductPage.fillCustomizationTextValue(NAME_CUSTOMIZATION_OPTION_LABEL, NAME_TEXT);
  await customizableProductPage.fillCustomizationSelectValueByIndex(CUSTOMER_TYPE_CUSTOMIZATION_OPTION_LABEL, 1);
  await customizableProductPage.fillCustomizationTextValue(DESCRIPTION_CUSTOMIZATION_OPTION_VALUE, DESCRIPTION_TEXT);
  await customizableProductPage.fillCustomizationTextValue(EMAIL_CUSTOMIZATION_OPTION_LABEL, TEST_EMAIL);
  await customizableProductPage.page.locator(AGREEMENT_CHECKBOX_SELECTOR).click();
}

test('form layout is correct', async ({ customizableProductPage, page, verticalStepsProductPage }) => {
  await expect(verticalStepsProductPage.headingTitle).not.toBeEmpty();
  await expect(customizableProductPage.addToCartButton).toBeVisible();

  const uploadPhotoWidget = customizableProductPage.getCustomizationWidgetByLabel(UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL);
  const sizeWidget = customizableProductPage.getCustomizationWidgetByLabel(SIZE_CUSTOMIZATION_OPTION_LABEL);
  const descriptionWidget = customizableProductPage.getCustomizationWidgetByLabel(DESCRIPTION_CUSTOMIZATION_OPTION_VALUE);
  const nameWidget = customizableProductPage.getCustomizationWidgetByLabel(NAME_CUSTOMIZATION_OPTION_LABEL);
  const customerTypeWidget = customizableProductPage.getCustomizationWidgetByLabel(CUSTOMER_TYPE_CUSTOMIZATION_OPTION_LABEL);

  const emailWidget = customizableProductPage.getCustomizationWidgetByLabel(EMAIL_CUSTOMIZATION_OPTION_LABEL);
  const agreementCheckbox = page.locator(AGREEMENT_CHECKBOX_SELECTOR);

  await expect(uploadPhotoWidget).toBeVisible();
  await expect(sizeWidget).toBeVisible();
  await expect(nameWidget).toBeVisible();
  await expect(customerTypeWidget).toBeVisible();
  await expect(descriptionWidget).toBeVisible();

  await expect(emailWidget).toBeVisible();
  await expect(agreementCheckbox).toBeVisible();
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

  await customizableProductPage.page.locator(AGREEMENT_CHECKBOX_SELECTOR).click();

  await customizableProductPage.addToCartAndVerifyResponse();
  await cartPage.waitPageToBeVisible();
});
