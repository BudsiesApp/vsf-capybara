import { expect, testFactory } from '../../fixtures/images-gallery-product-page';
import { CustomizableProductPage } from '../../page-model/product/customizable-product';

const DESIGN_CUSTOMIZATION_OPTION_LABEL = 'Select design';
const UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL = 'Upload your photo';
const STYLE_CUSTOMIZATION_OPTION_LABEL = 'Select style';
const SET_CUSTOMIZATION_OPTION_LABEL = 'Select set';
const SIZE_CUSTOMIZATION_OPTION_LABEL = 'Select size';
const SHORTS_STYLE_CUSTOMIZATION_OPTION_LABEL = 'Short\'s Style';
const ADD_MORE_PHOTOS_CUSTOMIZATION_OPTION_LABEL = 'Add more photos';

const PRODUCT_NAME = 'Custom Pajamas';

const test = testFactory('/custom-pajamas/');

async function fillRequiredFields (customizableProductPage: CustomizableProductPage) {
  await customizableProductPage.fillCustomizationThumbnailValueByIndex(DESIGN_CUSTOMIZATION_OPTION_LABEL, 1);
  await customizableProductPage.fillCustomizationImageValue(UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL);
  await customizableProductPage.fillCustomizationThumbnailValueByIndex(STYLE_CUSTOMIZATION_OPTION_LABEL, 1);
  await customizableProductPage.fillCustomizationSelectValueByIndex(SET_CUSTOMIZATION_OPTION_LABEL, 1);
  await customizableProductPage.fillCustomizationSelectValueByIndex(SIZE_CUSTOMIZATION_OPTION_LABEL, 1);
}

test('form layout is correct', async ({ customizableProductPage, imagesGalleryProductPage }) => {
  await expect(imagesGalleryProductPage.initializedSwiper).toBeVisible();
  await expect(imagesGalleryProductPage.headingTitle).not.toBeEmpty();
  await expect(imagesGalleryProductPage.shortDescription).not.toBeEmpty();
  await expect(imagesGalleryProductPage.agreement).toBeVisible();

  await expect(customizableProductPage.addToCartButton).toBeVisible();
  await expect(customizableProductPage.quantityField).toBeVisible();

  const designWidget = customizableProductPage.getCustomizationWidgetByLabel(DESIGN_CUSTOMIZATION_OPTION_LABEL);
  const uploadPhotoWidget = customizableProductPage.getCustomizationWidgetByLabel(UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL);
  const addMorePhotosWidget = customizableProductPage.getCustomizationWidgetByLabel(ADD_MORE_PHOTOS_CUSTOMIZATION_OPTION_LABEL);
  const styleWidget = customizableProductPage.getCustomizationWidgetByLabel(STYLE_CUSTOMIZATION_OPTION_LABEL);
  const setWidget = customizableProductPage.getCustomizationWidgetByLabel(SET_CUSTOMIZATION_OPTION_LABEL);
  const sizeWidget = customizableProductPage.getCustomizationWidgetByLabel(SIZE_CUSTOMIZATION_OPTION_LABEL);
  const shortsStyleWidget = customizableProductPage.getCustomizationWidgetByLabel(SHORTS_STYLE_CUSTOMIZATION_OPTION_LABEL);

  await expect(designWidget).toBeVisible();
  await expect(uploadPhotoWidget).toBeVisible();
  await expect(addMorePhotosWidget).toBeVisible();
  await expect(styleWidget).toBeVisible();

  await expect(setWidget).toBeHidden();
  await expect(shortsStyleWidget).toBeHidden();
  await expect(sizeWidget).toBeHidden();

  await customizableProductPage.fillCustomizationThumbnailValueByIndex(STYLE_CUSTOMIZATION_OPTION_LABEL, 1);

  await expect(setWidget).toBeVisible();
  await expect(sizeWidget).toBeVisible();

  await customizableProductPage.fillCustomizationThumbnailValueByIndex(STYLE_CUSTOMIZATION_OPTION_LABEL, 0);
  await customizableProductPage.fillCustomizationSelectValueByIndex(SET_CUSTOMIZATION_OPTION_LABEL, 1);

  await expect(shortsStyleWidget).toBeVisible();
});

test('form errors displayed correctly', async ({ imagesGalleryProductPage, customizableProductPage }) => {
  await customizableProductPage.addToCart();
  await expect(imagesGalleryProductPage.formErrors).toBeVisible();
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

test('product can be edited', async ({ page, cartPage, customizableProductPage, imagesGalleryProductPage }) => {
  await fillRequiredFields(customizableProductPage);
  const selectedSet = await customizableProductPage.getCustomizationSelectValueByLabel(SET_CUSTOMIZATION_OPTION_LABEL);
  await customizableProductPage.addToCartAndVerifyResponse();
  await cartPage.waitPageToBeVisible();

  await cartPage.editCartItemByProductName(PRODUCT_NAME);
  await imagesGalleryProductPage.moveFocusOutsideImagesGallery();

  await customizableProductPage.waitPageToBeVisible();

  const filledSelectedSet = await customizableProductPage.getCustomizationSelectValueByLabel(SET_CUSTOMIZATION_OPTION_LABEL);

  expect(selectedSet).toEqual(filledSelectedSet);
  await customizableProductPage.fillCustomizationSelectValueByIndex(SET_CUSTOMIZATION_OPTION_LABEL, 2);
  const newSelectedSet = await customizableProductPage.getCustomizationSelectValueByLabel(SET_CUSTOMIZATION_OPTION_LABEL);

  expect(newSelectedSet).toBeTruthy();
  await customizableProductPage.addToCartAndVerifyResponse();
  await cartPage.waitPageToBeVisible();

  await cartPage.goto();
  const updatedCartItem = cartPage.getCartItemByProductName(PRODUCT_NAME);
  await cartPage.expectCartItemToHaveProperties(updatedCartItem, [newSelectedSet]);
});
