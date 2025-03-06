import { expect, Locator, Page } from '@playwright/test';

import { uploadImage } from '../../helpers/upload-image';

export class CustomizableProductPage {
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
    const labelElement = this.page.getByText(label);
    const parent = labelElement.locator('..');

    return parent.locator('> ._widget').first();
  }

  public fillCustomizationTextValue (label: string, value: string) {
    const widget = this.getCustomizationWidgetByLabel(label);
    widget.fill(value);
  }

  public async getCustomizationSelectValueByLabel (label: string): Promise<string | null> {
    const widget = this.getCustomizationWidgetByLabel(label);
    const selectedOption = await widget.locator('.sf-select__selected').textContent();
    return selectedOption;
  }

  public async fillCustomizationSelectValueByIndex (label: string, index: number = 0) {
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

  public async updateQuantity (quantity: number) {
    await this.quantityField.fill(String(quantity));
  }

  public async addToCart () {
    await expect(this.addToCartButton).toBeEnabled();
    await this.addToCartButton.click();
  }
}
