import { expect, Locator, Page } from '@playwright/test';
import { normalizeLabel } from 'theme/e2e-tests/helpers/normalize-label';

export class PlushieProductPage {
  public headingTitle: Locator;
  public formErrors: Locator;
  public quantityPopupButton: Locator;
  public quantityDiscountPopup: Locator;
  public agreement: Locator;
  public activeStepContent: Locator;
  public typeSelector: Locator;
  public quantityField: Locator;

  public stepsContainer: Locator;
  public stepsHeader: Locator;

  public constructor (public readonly page: Page) {
    this.headingTitle = this.page.locator('h1.sf-heading__title');
    this.formErrors = this.page.locator('._form-errors');
    this.quantityPopupButton = this.page.locator('._popup-link');
    this.quantityDiscountPopup = this.page.locator('._popup-content');
    this.agreement = this.page.locator('._actions .m-block-story');
    this.activeStepContent = this.page.locator('.sf-step').filter({ hasText: /\S/ }).nth(0);
    this.typeSelector = this.page.locator('.plushie-wizard-product-type-step');
    this.quantityField = this.page.locator('._qty-container');

    this.stepsContainer = this.page.locator('._steps-container');
    this.stepsHeader = this.stepsContainer.locator('.sf-steps__header');
  }

  public async waitStepToBeVisible (title: string) {
    const step = this.stepsHeader.locator(`.sf-steps__step--current:has-text("${title}")`);
    await expect(step).toBeVisible();
  }

  public async clickContinueButton () {
    const continueButton = this.activeStepContent.locator('button:has-text("Continue")');
    await continueButton.click();
  }

  public async selectTypeByIndex (index: number): Promise<string | null> {
    const typeOption = this.typeSelector.locator('._button').nth(index);
    const title = typeOption.locator('._title');

    const typeOptionText = await title.textContent();
    await typeOption.click();

    if (!typeOptionText) {
      return null;
    }

    return normalizeLabel(typeOptionText);
  }

  public async waitPageToBeVisible () {
    await expect(this.page.locator('#plushie-product')).toBeVisible();
  }
}
