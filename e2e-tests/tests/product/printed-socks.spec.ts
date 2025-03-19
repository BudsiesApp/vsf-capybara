import { testFactory, expect } from '../../fixtures/images-gallery-product-page';
import { CustomizableProductPage } from '../../page-model/product/customizable-product';

const DESIGN_CUSTOMIZATION_OPTION_LABEL = 'Design';
const UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL = 'Upload your photo';
const ADD_MORE_PHOTOS_CUSTOMIZATION_OPTION_LABEL = 'Add more photos';

const PRODUCT_NAME = 'Custom Pet Socks';

const test = testFactory('/pet-socks/');

async function fillRequiredFields (customizableProductPage: CustomizableProductPage) {
  await customizableProductPage.fillCustomizationSelectValueByIndex(DESIGN_CUSTOMIZATION_OPTION_LABEL, 1);
  await customizableProductPage.fillCustomizationImageValue(UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL);
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

  await expect(designWidget).toBeVisible();
  await expect(uploadPhotoWidget).toBeVisible();
  await expect(addMorePhotosWidget).toBeVisible();
});

test('form errors displayed correctly', async ({ imagesGalleryProductPage, customizableProductPage }) => {
  await customizableProductPage.addToCart();
  await expect(imagesGalleryProductPage.formErrors).toBeVisible();
});

test('product added to cart successfully', async ({ crossSellsPage, customizableProductPage }) => {
  await fillRequiredFields(customizableProductPage);
  await customizableProductPage.addToCartAndVerifyResponse();
  await crossSellsPage.waitPageToBeVisible();
});

test('product display in cart correctly', async ({ crossSellsPage, cartPage, customizableProductPage }) => {
  await fillRequiredFields(customizableProductPage);
  await customizableProductPage.addToCartAndVerifyResponse();
  await crossSellsPage.waitPageToBeVisible();

  await cartPage.goto();
  const cartItem = cartPage.getCartItemByProductName(PRODUCT_NAME);

  await expect(cartItem).toBeVisible();
});

test('product can be edited', async ({ cartPage, crossSellsPage, customizableProductPage, imagesGalleryProductPage }) => {
  await fillRequiredFields(customizableProductPage);
  const selectedDesign = await customizableProductPage.getCustomizationSelectValueByLabel(DESIGN_CUSTOMIZATION_OPTION_LABEL);
  await customizableProductPage.addToCartAndVerifyResponse();
  await crossSellsPage.waitPageToBeVisible();

  await cartPage.goto();
  await cartPage.editCartItemByProductName(PRODUCT_NAME);
  await imagesGalleryProductPage.moveFocusOutsideImagesGallery();

  await customizableProductPage.waitPageToBeVisible();

  const filledSelectedDesign = await customizableProductPage.getCustomizationSelectValueByLabel(DESIGN_CUSTOMIZATION_OPTION_LABEL);

  expect(selectedDesign).toEqual(filledSelectedDesign);
  await customizableProductPage.fillCustomizationSelectValueByIndex(DESIGN_CUSTOMIZATION_OPTION_LABEL, 2);
  const newSelectedDesign = await customizableProductPage.getCustomizationSelectValueByLabel(DESIGN_CUSTOMIZATION_OPTION_LABEL);

  expect(newSelectedDesign).toBeTruthy();
  await customizableProductPage.addToCartAndVerifyResponse();
  await crossSellsPage.waitPageToBeVisible();

  await cartPage.goto();
  const updatedCartItem = cartPage.getCartItemByProductName(PRODUCT_NAME);
  await cartPage.expectCartItemToHaveProperties(updatedCartItem, [newSelectedDesign]);
});
