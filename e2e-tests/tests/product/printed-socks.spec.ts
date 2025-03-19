import { testFactory, expect } from '../../fixtures/printed-socks-page';

const test = testFactory('/pet-socks/');

test('form layout is correct', async ({ printedSocksPage, customizableProductPage, imagesGalleryProductPage }) => {
  await expect(imagesGalleryProductPage.initializedSwiper).toBeVisible();
  await expect(imagesGalleryProductPage.headingTitle).not.toBeEmpty();
  await expect(imagesGalleryProductPage.shortDescription).not.toBeEmpty();
  await expect(imagesGalleryProductPage.agreement).toBeVisible();

  await expect(customizableProductPage.addToCartButton).toBeVisible();
  await expect(customizableProductPage.quantityField).toBeVisible();

  await expect(printedSocksPage.designWidget).toBeVisible();
  await expect(printedSocksPage.uploadPhotoWidget).toBeVisible();
  await expect(printedSocksPage.addMorePhotosWidget).toBeVisible();
});

test('form errors displayed correctly', async ({ imagesGalleryProductPage, customizableProductPage }) => {
  await customizableProductPage.addToCart();
  await expect(imagesGalleryProductPage.formErrors).toBeVisible();
});

test('product added to cart successfully', async ({ printedSocksPage }) => {
  await printedSocksPage.addProductToCart();
});

test('product display in cart correctly', async ({ cartPage, printedSocksPage }) => {
  await printedSocksPage.addProductToCart();

  await cartPage.goto();
  const cartItem = cartPage.getCartItemByProductName(printedSocksPage.PRODUCT_NAME);

  await expect(cartItem).toBeVisible();
});

test('product can be edited', async ({ cartPage, crossSellsPage, customizableProductPage, imagesGalleryProductPage, printedSocksPage }) => {
  await printedSocksPage.fillRequiredFields();
  const selectedDesign = await customizableProductPage.getCustomizationSelectValueByLabel(
    printedSocksPage.DESIGN_CUSTOMIZATION_OPTION_LABEL
  );
  await customizableProductPage.addToCartAndVerifyResponse();
  await crossSellsPage.waitPageToBeVisible();

  await cartPage.goto();
  await cartPage.editCartItemByProductName(printedSocksPage.PRODUCT_NAME);
  await imagesGalleryProductPage.moveFocusOutsideImagesGallery();

  await customizableProductPage.waitPageToBeVisible();

  const filledSelectedDesign = await customizableProductPage.getCustomizationSelectValueByLabel(
    printedSocksPage.DESIGN_CUSTOMIZATION_OPTION_LABEL
  );

  expect(selectedDesign).toEqual(filledSelectedDesign);
  await customizableProductPage.fillCustomizationSelectValueByIndex(
    printedSocksPage.DESIGN_CUSTOMIZATION_OPTION_LABEL,
    2
  );
  const newSelectedDesign = await customizableProductPage.getCustomizationSelectValueByLabel(
    printedSocksPage.DESIGN_CUSTOMIZATION_OPTION_LABEL
  );

  expect(newSelectedDesign).toBeTruthy();
  await customizableProductPage.addToCartAndVerifyResponse();
  await crossSellsPage.waitPageToBeVisible();

  await cartPage.goto();
  const updatedCartItem = cartPage.getCartItemByProductName(printedSocksPage.PRODUCT_NAME);
  await cartPage.expectCartItemToHaveProperties(updatedCartItem, [newSelectedDesign]);
});
