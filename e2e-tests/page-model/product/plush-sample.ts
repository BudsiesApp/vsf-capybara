import { Page } from '@playwright/test';

import { CustomizableProductPage } from './customizable-product';
import { VerticalStepsProductPage } from './vertical-steps-form';

export class PlushSamplePage extends VerticalStepsProductPage {
  public static readonly PAGE_URL = '/bulk-samples/create/';

  public readonly UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL = 'Please upload your awesome design';
  public readonly SIZE_CUSTOMIZATION_OPTION_LABEL = 'Size in inches';
  public readonly NAME_CUSTOMIZATION_OPTION_LABEL = 'Name';
  public readonly DESCRIPTION_CUSTOMIZATION_OPTION_VALUE = 'Describe Your Bulk Plush Sample';
  public readonly COLOR_PALETTE_CUSTOMIZATION_OPTION_LABEL = 'Color Palette';
  public readonly CUSTOMER_TYPE_CUSTOMIZATION_OPTION_LABEL = 'Which of the following best describes you?';
  public readonly EMAIL_CUSTOMIZATION_OPTION_LABEL = 'Enter your email address';
  public readonly AGREEMENT_CHECKBOX_SELECTOR = '.sf-checkbox._agreement label';

  public readonly PRODUCT_NAME = 'Bulk Plush Sample';

  public constructor (
    public readonly page: Page,
    public readonly customizableProductPage: CustomizableProductPage
  ) {
    super(page, customizableProductPage);
  }

  public async fillRequiredFields (
    name: string = 'Test name',
    email: string = 'test@test.test',
    description: string = 'Test description'
  ): Promise<void> {
    await this.customizableProductPage.fillCustomizationImageValue(this.UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL);
    await this.customizableProductPage.fillCustomizationSelectValueByIndex(this.SIZE_CUSTOMIZATION_OPTION_LABEL, 2);
    await this.customizableProductPage.fillCustomizationTextValue(this.NAME_CUSTOMIZATION_OPTION_LABEL, name);
    await this.customizableProductPage.fillCustomizationThumbnailValueByIndex(this.COLOR_PALETTE_CUSTOMIZATION_OPTION_LABEL, 1);
    await this.customizableProductPage.fillCustomizationSelectValueByIndex(this.CUSTOMER_TYPE_CUSTOMIZATION_OPTION_LABEL, 1);
    await this.customizableProductPage.fillCustomizationTextValue(this.DESCRIPTION_CUSTOMIZATION_OPTION_VALUE, description);
    await this.customizableProductPage.fillCustomizationTextValue(this.EMAIL_CUSTOMIZATION_OPTION_LABEL, email);
    await this.customizableProductPage.page.locator(this.AGREEMENT_CHECKBOX_SELECTOR).click();
  }

  public async goto (): Promise<void> {
    await this.page.goto(PlushSamplePage.PAGE_URL);
    await this.customizableProductPage.waitPageToBeVisible();
  }
}
