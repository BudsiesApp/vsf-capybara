import { expect, Locator, Page } from '@playwright/test';

import { normalizeLabel } from '../../helpers/normalize-label';

export class CartPage {
  public cartItems: Locator;
  public orderSummary: Locator;

  public readonly DELETE_CART_ITEM_RESOURCE = '/api/cart/delete';

  public constructor (public readonly page: Page) {
    this.cartItems = page.locator('.sf-collected-product');
    this.orderSummary = page.locator('.detailed-cart-order-summary');
  }

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
    const expandableHeader = cartItem.locator('.m-expandable-section ._header');
    if (await expandableHeader.isVisible()) {
      const isExpanded = await cartItem.locator('.m-expandable-section.-expanded').isVisible();
      if (!isExpanded) {
        await expandableHeader.click();
      }
    }

    for (const property of properties) {
      const propertyLocator = cartItem.locator(`.collected-product__properties:has-text("${property}")`);
      await expect(propertyLocator).toBeVisible();
    }
  }

  public async getCartItemProperties (cartItem: Locator): Promise<string[]> {
    const properties: string[] = [];

    const expandableHeader = cartItem.locator('.m-expandable-section ._header');
    if (await expandableHeader.isVisible()) {
      const isExpanded = await cartItem.locator('.m-expandable-section.-expanded').isVisible();
      if (!isExpanded) {
        await expandableHeader.click();
      }
    }

    const propertyLocators = await cartItem.locator('.collected-product__properties').all();

    for (const locator of propertyLocators) {
      properties.push(normalizeLabel(await locator.textContent()));
    }

    return properties;
  }

  public async editCartItemByProductName (productName: string) {
    const productLocator = this.getCartItemByProductName(productName);
    const editButton = productLocator.getByRole('button', { name: 'Edit' });
    await editButton.click();
  }

  public async goToCheckout () {
    const checkoutButton = this.orderSummary.locator('button:has-text("Go to checkout")');
    await checkoutButton.click();
  }

  public async removeCartItem (cartItem: Locator) {
    const removeButton = cartItem.locator('button:has-text("Remove")');
    await removeButton.click();
  }

  public async expectCartItemRegularPriceToBe (cartItem: Locator, price: string) {
    const priceLocator = cartItem.locator('.sf-price__regular');
    await expect(priceLocator).toHaveText(price);
  }

  public async removeCartItemWithDelay (cartItem: Locator, delay: number = 1000) {
    await this.page.route(`*/**${this.DELETE_CART_ITEM_RESOURCE}?*`, async (route) => {
      await this.page.waitForTimeout(delay);
      await route.continue();
    });

    this.removeCartItem(cartItem);
  }

  public async waitForDeleteResponse () {
    return this.page.waitForResponse(
      response => response.url().includes(this.DELETE_CART_ITEM_RESOURCE) && response.status() === 200
    );
  }
}
