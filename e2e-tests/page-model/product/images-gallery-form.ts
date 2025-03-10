import { Locator, Page } from '@playwright/test';
import { CustomizableProductPage } from './customizable-product';

export class ImagesGalleryProductPage {
  public initializedSwiper: Locator;
  public headingTitle: Locator;
  public shortDescription: Locator;
  public agreement: Locator;
  public formErrors: Locator;

  public constructor (
    public readonly page: Page,
    public readonly customizableProductPage: CustomizableProductPage
  ) {
    this.initializedSwiper = this.page.locator('._stage-content .swiper-initialized');
    this.headingTitle = this.page.locator('._product-name-desktop.sf-heading__title');
    this.shortDescription = this.page.locator('._short-description:not(._placeholder-item)');
    this.agreement = this.page.locator('.m-block-story');
    this.formErrors = this.page.locator('._form-errors');
  }

  public async moveFocusOutsideImagesGallery () {
    await this.page.mouse.move(0, 0);
  }
}
