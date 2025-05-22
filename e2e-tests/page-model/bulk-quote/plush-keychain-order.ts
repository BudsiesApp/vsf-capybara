import { Locator, Page } from '@playwright/test';

import { QuoteOrderPage } from './quote-order';

export class PlushKeychainQuoteOrderPage extends QuoteOrderPage {
  public static readonly PLUSH_QUOTE_ORDER_PAGE_URL = '/plush-keychain-quote/';

  public colorSelectorField: Locator;
  public colorSelectorError: Locator;

  public constructor (public page: Page, public readonly pageIdSelector: string) {
    super(page, pageIdSelector);

    this.colorSelectorField = page.locator('.colors-list-widget');
    this.colorSelectorError = this.colorSelectorField.locator('._error-message');
  }

  public async goto () {
    await this.page.goto(PlushKeychainQuoteOrderPage.PLUSH_QUOTE_ORDER_PAGE_URL);
  }

  public async selectColorByIndex (index: number) {
    await this.colorSelectorField.locator('._option').nth(index).click();
  }

  public async fillPlushData () {
    await this.selectColorByIndex(1);
  }
}
