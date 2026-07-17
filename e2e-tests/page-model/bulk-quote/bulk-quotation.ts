import { expect, Locator, Page } from '@playwright/test';

export class BulkQuotationPage {
  public readonly QUOTE_SUBMIT_RESOURCE_URL = '/api/ext/budsies/bulk-orders/quote-choose';
  public readonly PAGE_ID = 'bulkorder-quotation';

  public quoteSubmitButton: Locator;
  public pageLocator: Locator;
  public quoteRows: Locator;
  public selectedQuoteRows: Locator;
  public quoteTable: Locator;
  public samplePrototypeCard: Locator;
  public moreInfoBlock: Locator;
  public notificationTitle: Locator;

  public constructor (public readonly page: Page) {
    this.quoteSubmitButton = page.locator('._quote-submit-button');
    this.quoteRows = page.locator('._quote-row');
    this.selectedQuoteRows = page.locator('._quote-row.-selected');
    this.quoteTable = page.locator('._quote-table');
    this.samplePrototypeCard = page.locator('._sample-prototype-card');
    this.moreInfoBlock = page.locator('._more-info');
    this.notificationTitle = page.locator('._notification-title');

    this.pageLocator = page.locator(`#${this.PAGE_ID}`);
  }

  public async waitPageToBeVisible () {
    await expect(this.pageLocator).toBeVisible();
  }

  public async expectDraftQuoteResultRedesign (): Promise<void> {
    await expect(this.page.locator('text=Your Estimated Bulk Order Quote')).toBeVisible();
    await expect(this.page.locator('text=Pricing below is an estimate for bulk production only. No order has been placed!')).toBeVisible();
    await expect(this.quoteTable).toBeVisible();
    await expect(this.quoteRows.first()).toBeVisible();
    await expect(this.selectedQuoteRows).toHaveCount(1);
    await expect(this.samplePrototypeCard).toBeVisible();
    await expect(this.quoteSubmitButton).toHaveText(/Get Sample Prototype/i);
    await expect(this.moreInfoBlock).toBeVisible();
  }

  public async selectQuoteRow (index: number): Promise<void> {
    await this.quoteRows.nth(index).click();
  }

  public async submitQuoteAndVerifyResponse (): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      (response) => response.url().includes(this.QUOTE_SUBMIT_RESOURCE_URL) && response.status() === 200
    );

    await this.quoteSubmitButton.click();
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
  }
}
