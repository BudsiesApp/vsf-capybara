import { Locator, Page } from '@playwright/test';

import { QuoteOrderPage } from './quote-order';
import { SelectFormField } from '../../helpers/form/form-fields';

export class PlushQuoteOrderPage extends QuoteOrderPage {
  public static readonly PLUSH_QUOTE_ORDER_PAGE_URL = '/bulk-quote/';
  private readonly SIZE_FIELD_LABEL = 'Size in inches';

  public sizeInputField: SelectFormField;

  public colorSelectorField: Locator;
  public colorSelectorError: Locator;

  public constructor (public page: Page, public readonly pageIdSelector: string) {
    super(page, pageIdSelector);

    this.sizeInputField = new SelectFormField(
      page.locator(
        '.customization-option',
        {
          has: this.page.locator(`text="${this.SIZE_FIELD_LABEL}"`)
        }
      ),
      '.sf-select',
      page
    );
    this.colorSelectorField = page.locator('.colors-list-widget');
    this.colorSelectorError = this.colorSelectorField.locator('._error-message');
  }

  public async goto () {
    await this.page.goto(PlushQuoteOrderPage.PLUSH_QUOTE_ORDER_PAGE_URL);
  }

  public async selectColorByIndex (index: number) {
    await this.colorSelectorField.locator('._option').nth(index).click();
  }

  public async fillPlushData () {
    await this.sizeInputField.selectByOptionIndex(1);
    await this.selectColorByIndex(1);
  }
}
