import { expect, Locator, Page } from '@playwright/test';

import { uploadImage } from '../../helpers/upload-image';
import { normalizeLabel } from '../../helpers/normalize-label';

export class CustomizableProductPage {
  public readonly ADD_TO_CART_API_RESOURCE = '/api/cart/update';
  public quantityField: Locator;
  public addToCartButton: Locator;

  public constructor (public readonly page: Page, private readonly pageUrl: string) {
    this.quantityField = this.page.locator('._quantity-field');
    this.addToCartButton = this.page.locator('._add-to-cart');
  }

  public async goto () {
    await this.page.goto(this.pageUrl);
  }

  public getCustomizationWidgetByLabel (label: string): Locator {
    const customizationOption = this.page.locator(
      '.customization-option',
      {
        has: this.page.locator(`text="${label}"`)
      }
    );

    return customizationOption.locator('> ._widget');
  }

  public getCheckboxByLabel (label: string): Locator {
    return this.page.locator(`.sf-checkbox__label:text("${label}")`);
  }

  public async fillCustomizationTextValue (label: string, value: string) {
    const widget = this.getCustomizationWidgetByLabel(label);
    const input = widget.locator('input,textarea');
    await input.fill(value);
  }

  public async getCustomizationTextValueByLabel (label: string): Promise<string | null> {
    const widget = this.getCustomizationWidgetByLabel(label);
    const input = widget.locator('input,textarea');
    const value = await input.inputValue();
    return value || null;
  }

  public async getCustomizationSelectValueByLabel (label: string): Promise<string | null> {
    const widget = this.getCustomizationWidgetByLabel(label);
    const selectedOption = await widget.locator('.sf-select__selected').textContent();

    if (!selectedOption) {
      return null;
    }

    return normalizeLabel(selectedOption);
  }

  public async fillCustomizationSelectValueByIndex (label: string, index = 0) {
    const widget = this.getCustomizationWidgetByLabel(label);
    await widget.click();

    const option = widget.locator('li.sf-select-option').nth(index);
    await option.click();
  }

  public async fillCustomizationImageValue (label: string) {
    const uploadPhotoWidget = this.getCustomizationWidgetByLabel(label);
    await uploadImage(this.page, uploadPhotoWidget);
    const uploadStatus = this.page.locator('.filepond--file-status-main');
    await expect(uploadStatus).toHaveText('Upload complete');
  }

  public fillCustomizationThumbnailValueByIndex (label: string, index = 0) {
    const widget = this.getCustomizationWidgetByLabel(label);
    const thumbnail = widget.locator('._option').nth(index);
    return thumbnail.click();
  }

  public async getCustomizationThumbnailValueByLabel (label: string): Promise<string | null> {
    const widget = this.getCustomizationWidgetByLabel(label);
    const selectedThumbnail = widget.locator('._option.-selected ._content-wrapper ._name');

    if (await selectedThumbnail.count() === 0) {
      return null;
    }

    const text = await selectedThumbnail.textContent();

    if (!text) {
      return null;
    }

    return normalizeLabel(text);
  }

  public toggleCheckboxCustomizationValue (label: string) {
    const widget = this.getCheckboxByLabel(label);
    return widget.click();
  }

  public async updateQuantity (quantity: number) {
    await this.quantityField.fill(String(quantity));
  }

  public async addToCart () {
    await expect(this.addToCartButton).toBeEnabled();
    await this.addToCartButton.click();
  }

  public async addToCartAndVerifyResponse () {
    const responsePromise = this.page.waitForResponse(
      response => response.url().includes(this.ADD_TO_CART_API_RESOURCE) && response.status() === 200
    );

    await this.addToCart();

    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
  }

  public async waitPageToBeVisible () {
    await expect(this.page.locator('#customizable-product')).toBeVisible();
  }
}
