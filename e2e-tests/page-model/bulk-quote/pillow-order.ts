import { Page } from '@playwright/test';

import { QuoteOrderPage } from './quote-order';
import { SelectFormField } from '../../helpers/form/form-fields';

export class PillowQuoteOrderPage extends QuoteOrderPage {
  public static readonly PILLOW_QUOTE_ORDER_PAGE_URL = '/pillow-quote/';

  public sizeSelectorField: SelectFormField;

  public constructor (public page: Page, public readonly pageIdSelector: string) {
    super(page, pageIdSelector);

    this.sizeSelectorField = new SelectFormField(
      page.locator('._section'),
      '.sf-select._size-select',
      page
    );
  }

  public async goto () {
    await this.page.goto(PillowQuoteOrderPage.PILLOW_QUOTE_ORDER_PAGE_URL);
  }

  public async fillSize (size: string): Promise<void> {
    await this.sizeSelectorField.selectByOptionTitle(size);
  }
}
