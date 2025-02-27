import { test, expect } from '@playwright/test';

import { getCustomizationWidgetByLabel } from '../../helpers/get-customization-widget-by-label';
import { uploadImage } from '../../helpers/upload-image';

const DESIGN_CUSTOMIZATION_OPTION_LABEL = 'Design';
const UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL = 'Upload your photo';
const ADD_MORE_PHOTOS_CUSTOMIZATION_OPTION_LABEL = 'Add more photos';

test.describe('Printed Socks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pet-socks/');
  });

  test('form layout is correct', async ({ page }) => {
    const initializedSwiper = page.locator('._stage-content .swiper-initialized');
    await expect(initializedSwiper).toBeVisible();

    const headingTitle = page.locator('._product-name-desktop.sf-heading__title');
    await expect(headingTitle).not.toBeEmpty();

    const shortDescription = page.locator('._short-description:not(._placeholder-item)');
    await expect(shortDescription).not.toBeEmpty();

    const designWidget = getCustomizationWidgetByLabel(page, DESIGN_CUSTOMIZATION_OPTION_LABEL);
    const uploadPhotoWidget = getCustomizationWidgetByLabel(page, UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL);
    const addMorePhotosWidget = getCustomizationWidgetByLabel(page, ADD_MORE_PHOTOS_CUSTOMIZATION_OPTION_LABEL);

    await expect(designWidget).toBeVisible();
    await expect(uploadPhotoWidget).toBeVisible();
    await expect(addMorePhotosWidget).toBeVisible();

    const quantityField = page.locator('._quantity-field');
    const addToCartButton = page.locator('._add-to-cart');
    const agreement = page.locator('.m-block-story');

    await expect(addToCartButton).toBeVisible();
    await expect(quantityField).toBeVisible();
    await expect(agreement).toBeVisible();
  });

  test('form errors display correctly', async ({ page }) => {
    const addToCartButton = page.locator('._add-to-cart');
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();

    const formErrors = page.locator('._form-errors');
    await expect(formErrors).toBeVisible();
  });

  test('product added to cart successfully', async ({ page }) => {
    const designWidget = getCustomizationWidgetByLabel(page, DESIGN_CUSTOMIZATION_OPTION_LABEL);
    const uploadPhotoWidget = getCustomizationWidgetByLabel(page, UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL);
    const addToCartButton = page.locator('._add-to-cart');

    await designWidget.click();

    const designOption = designWidget.locator('li.sf-select-option').nth(1);
    await expect(designOption).toBeVisible();

    await designOption.click();

    await uploadImage(page, uploadPhotoWidget);

    await expect(addToCartButton).toBeDisabled();
    await expect(addToCartButton).toBeEnabled();

    await addToCartButton.click();

    const crossSellsPageHeader = page.getByText('Other pet gifts you might like');
    await expect(crossSellsPageHeader).toBeVisible();
  });
});
