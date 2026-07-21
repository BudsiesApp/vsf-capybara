import { Page } from '@playwright/test';

import { CustomizableProductPage } from './customizable-product';
import { VerticalStepsProductPage } from './vertical-steps-form';

export class PlushSamplePage extends VerticalStepsProductPage {
  public readonly UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL = 'Please upload your awesome design';
  public readonly SIZE_CUSTOMIZATION_OPTION_LABEL = 'Size in inches';
  public readonly NAME_CUSTOMIZATION_OPTION_LABEL = 'Name';
  public readonly COLOR_PALETTE_CUSTOMIZATION_OPTION_LABEL = 'Color Palette';
  public readonly CUSTOMER_TYPE_CUSTOMIZATION_OPTION_LABEL = 'Which of the following best describes you?';
  public readonly EMAIL_CUSTOMIZATION_OPTION_LABEL = 'Enter your email address';
  public readonly AGREEMENT_CHECKBOX_SELECTOR = '.sf-checkbox._agreement label';

  public constructor (
    public readonly page: Page,
    public readonly customizableProductPage: CustomizableProductPage,
    public readonly productName: string,
    public readonly descriptionCustomizationOptionValue: string,
    public readonly hasSize: boolean
  ) {
    super(page, customizableProductPage);
  }

  public async fillRequiredFields (
    name = 'Test name',
    email = 'test@test.test',
    description = 'Test description'
  ): Promise<void> {
    await this.customizableProductPage.fillCustomizationImageValue(this.UPLOAD_PHOTO_CUSTOMIZATION_OPTION_LABEL);

    if (this.hasSize) {
      await this.customizableProductPage.fillCustomizationSelectValueByIndex(
        this.SIZE_CUSTOMIZATION_OPTION_LABEL,
        2
      );
    }

    await this.customizableProductPage.fillCustomizationTextValue(this.NAME_CUSTOMIZATION_OPTION_LABEL, name);
    await this.customizableProductPage.fillCustomizationThumbnailValueByIndex(this.COLOR_PALETTE_CUSTOMIZATION_OPTION_LABEL, 1);
    await this.customizableProductPage.fillCustomizationSelectValueByIndex(this.CUSTOMER_TYPE_CUSTOMIZATION_OPTION_LABEL, 1);
    await this.customizableProductPage.fillCustomizationTextValue(this.descriptionCustomizationOptionValue, description);
    await this.customizableProductPage.fillCustomizationTextValue(this.EMAIL_CUSTOMIZATION_OPTION_LABEL, email);
    await this.customizableProductPage.page.locator(this.AGREEMENT_CHECKBOX_SELECTOR).click();
  }

  public async goto (): Promise<void> {
    await this.customizableProductPage.goto();
    await this.customizableProductPage.waitPageToBeVisible();
  }
}
