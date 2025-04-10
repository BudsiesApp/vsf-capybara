import { Locator, Page, Response } from '@playwright/test';

import { CustomizableProductPage } from './customizable-product';
import { ImagesGalleryProductPage } from './images-gallery-form';
import { CrossSellsPage } from '../cross-sells';

export class PrintedSocksPage extends ImagesGalleryProductPage {
  public readonly PRODUCT_NAME = 'Custom Pet Socks';
  public readonly DESIGN_CUSTOMIZATION_OPTION_LABEL = 'Design';
  public readonly UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL = 'Upload your photo';
  public readonly ADD_MORE_PHOTOS_CUSTOMIZATION_OPTION_LABEL = 'Add more photos';

  public designWidget: Locator;
  public uploadPhotoWidget: Locator;
  public addMorePhotosWidget: Locator;

  public constructor (
    public readonly page: Page,
    public readonly customizableProductPage: CustomizableProductPage,
    public readonly crossSellsPage: CrossSellsPage
  ) {
    super(page, customizableProductPage);

    this.designWidget = this.customizableProductPage.getCustomizationWidgetByLabel(this.DESIGN_CUSTOMIZATION_OPTION_LABEL);
    this.uploadPhotoWidget = this.customizableProductPage.getCustomizationWidgetByLabel(this.UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL);
    this.addMorePhotosWidget = this.customizableProductPage.getCustomizationWidgetByLabel(this.ADD_MORE_PHOTOS_CUSTOMIZATION_OPTION_LABEL);
  }

  public async fillRequiredFields () {
    await this.customizableProductPage.fillCustomizationThumbnailValueByIndex(
      this.DESIGN_CUSTOMIZATION_OPTION_LABEL,
      1
    );
    await this.customizableProductPage.fillCustomizationImageValue(
      this.UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL
    );
  }

  public async addProductToCart (): Promise<void> {
    await this.fillRequiredFields();
    await this.customizableProductPage.addToCartAndVerifyResponse();
    await this.crossSellsPage.waitPageToBeVisible();
  }

  public async goto (): Promise<void> {
    await this.page.goto('/pet-socks/');
    await this.customizableProductPage.waitPageToBeVisible();
  }
}
