import { expect, Locator, Page } from '@playwright/test';

export class CartPage {
  public constructor (public readonly page: Page) { }

  public async goto () {
    await this.page.goto('/checkout/cart/');
  }

  public getCartItemByProductName (productName: string) {
    const productLocator = this.page.locator(
      '.sf-collected-product',
      {
        has: this.page.locator(`.sf-collected-product__title-wraper:has-text("${productName}")`)
      }
    );
    return productLocator;
  }

  public async waitPageToBeVisible () {
    await expect(this.page.locator('#detailed-cart')).toBeVisible();
  }

  public async expectCartItemToHaveProperties (cartItem: Locator, properties: string[]) {
    for (const property of properties) {
      const propertyLocator = cartItem.locator(`.collected-product__properties:has-text("${property}")`);
      await expect(propertyLocator).toBeVisible();
    }
  }

  public async editCartItemByProductName (productName: string) {
    const productLocator = this.getCartItemByProductName(productName);
    const editButton = productLocator.getByRole('button', { name: 'Edit' });
    await editButton.click();
  }
}
