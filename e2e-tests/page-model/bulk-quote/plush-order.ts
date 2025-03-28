import { Locator, Page } from '@playwright/test';

import { QuoteOrderPage } from './quote-order';
import { InputFormField } from '../../helpers/form/form-fields';

export class PlushQuoteOrderPage extends QuoteOrderPage {
  public static readonly PLUSH_QUOTE_ORDER_PAGE_URL = '/bulk-quote/';

  public sizeInputField: InputFormField;

  public colorSelectorField: Locator;
  public colorSelectorError: Locator;

  public constructor (public page: Page, public readonly pageIdSelector: string) {
    super(page, pageIdSelector);

    this.sizeInputField = new InputFormField(
      page.locator('._section .sf-input'),
      'input[name="size"]',
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
    await this.sizeInputField.fill('12');
    await this.selectColorByIndex(1);
  }
}
