import { testFactory, expect } from '../../fixtures/images-gallery-product-page.ts';
import { CustomizableProductPage } from '../../page-model/product/customizable-product';

const DESIGN_CUSTOMIZATION_OPTION_LABEL = 'Design';
const UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL = 'Upload your photo';
const ADD_MORE_PHOTOS_CUSTOMIZATION_OPTION_LABEL = 'Add more photos';

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

test('form errors display correctly', async ({ imagesGalleryProductPage, customizableProductPage }) => {
  await customizableProductPage.addToCart();
  await expect(imagesGalleryProductPage.formErrors).toBeVisible();
});

test('product added to cart successfully', async ({ page, customizableProductPage }) => {
  await fillRequiredFields(customizableProductPage);
  await customizableProductPage.addToCart();

  await page.waitForSelector('#cross-sells');
});

test('product display in cart correctly', async ({ page, cartPage, customizableProductPage }) => {
  await fillRequiredFields(customizableProductPage);
  await customizableProductPage.addToCart();

  await page.waitForSelector('#cross-sells');

  await cartPage.goto();
  const cartItem = cartPage.getCartItemByProductName('Custom Pet Socks');

  await expect(cartItem).toBeVisible();
});
