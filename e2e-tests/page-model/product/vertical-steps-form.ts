import { expect, Locator, Page } from '@playwright/test';
import { CustomizableProductPage } from './customizable-product';

const ADD_TO_CART_API_RESOURCE = '/api/cart/update';

export class VerticalStepsProductPage {
  public headingTitle: Locator;
  public formErrors: Locator;
  public saveAndMakeAnotherButton: Locator;
  public quantityPopupButton: Locator;
  public quantityDiscountPopup: Locator;
  public agreement: Locator;

  public constructor (
    public readonly page: Page,
    public readonly customizableProductPage: CustomizableProductPage
  ) {
    this.headingTitle = this.page.locator('h1.sf-heading__title');
    this.formErrors = this.page.locator('._form-errors');
    this.saveAndMakeAnotherButton = this.page.locator('._add-to-cart-and-make-another');
    this.quantityPopupButton = this.page.locator('._popup-link');
    this.quantityDiscountPopup = this.page.locator('._popup-content');
    this.agreement = this.page.locator('._agreement');
  }

  public async makeAnotherAndVerifyResponse () {
    const responsePromise = this.page.waitForResponse(
      response => response.url().includes(ADD_TO_CART_API_RESOURCE) && response.status() === 200
    );

    await expect(this.saveAndMakeAnotherButton).toBeVisible();
    await this.saveAndMakeAnotherButton.click();

    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
  }
}
