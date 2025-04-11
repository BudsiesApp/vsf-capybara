import { expect, Locator, Page } from '@playwright/test';

export class SimpleProductPage {
  public readonly ADD_TO_CART_API_RESOURCE = '/api/cart/update';
  public quantityField: Locator;
  public addToCartButton: Locator;

  public constructor (public readonly page: Page) {
    this.quantityField = this.page.locator('.a-product-quantity').locator('input');
    this.addToCartButton = this.page.locator('.a-add-to-cart');
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
    await expect(this.page.locator('#product')).toBeVisible();
  }
}
