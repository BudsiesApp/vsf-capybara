import { Page } from '@playwright/test';

export class CartPage {
  public constructor (public readonly page: Page) { }

  public async goto () {
    await this.page.goto('/checkout/cart/');
  }

  public getCartItemByProductName (productName: string) {
    const productLocator = this.page.locator(`.sf-collected-product__title-wraper:has-text("${productName}")`);
    return productLocator;
  }
}
