import { expect, Locator, Page } from '@playwright/test';
import { CustomizableProductPage } from './customizable-product';

export class PhotoPillowProductPage {
  public headingTitle: Locator;
  public subtitle: Locator;
  public formPreview: Locator;
  public designImages: Locator;
  public agreement: Locator;
  public quantityField: Locator;
  public submitAnimator: Locator;

  public constructor (public readonly page: Page, public readonly customizableProductPage: CustomizableProductPage) {
    this.headingTitle = this.page.locator('h1.sf-heading__title');
    this.subtitle = this.page.locator('._subtitle .sf-heading__title');
    this.formPreview = this.page.locator('.phrase-pillow-form-preview');
    this.designImages = this.page.locator('._design-images-container');
    this.agreement = this.page.locator('._actions-row .m-block-story');
    this.quantityField = this.page.locator('._qty-container');
    this.submitAnimator = this.page.locator('.m-submit-animator');
  }

  public async waitStepToBeVisible (title: string) {
    const step = this.page.locator(`._customizer-step.-active:has-text("${title}")`);
    await expect(step).toBeVisible();
  }

  public async goToStep (title: string) {
    const step = this.page.locator(`._customizer-step:has-text("${title}")`);
    await step.click();
    await this.waitStepToBeVisible(title);
  }

  public async clickNextButton () {
    const continueButton = this.page.locator('._next-step-button-container button:has-text("Next"):visible');
    await continueButton.click();
  }

  public async addToCartAndVerifyResponse () {
    const responsePromise = this.page.waitForResponse(
      response => response.url().includes(this.customizableProductPage.ADD_TO_CART_API_RESOURCE) && response.status() === 200
    );

    await this.customizableProductPage.addToCart();

    await expect(this.submitAnimator).toBeVisible();

    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
  }
}
