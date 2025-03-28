import { expect, Locator, Page } from '@playwright/test';
import { InputFormField } from '../../helpers/form/form-fields';

export class BulkQuotationPage {
  public readonly QUOTE_SUBMIT_RESOURCE_URL = '/api/ext/budsies/bulk-orders/quote-choose';
  public readonly QUESTION_SUBMIT_RESOURCE_URL = '/api/ext/budsies/bulk-orders/question';
  public readonly PAGE_ID = 'bulkorder-quotation';

  public quoteSubmitButton: Locator;
  public pageLocator: Locator;

  public messageFormOpenButton: Locator;
  public messageTextareaField: InputFormField;
  public messageFormSubmitButton: Locator;

  public constructor (public readonly page: Page) {
    this.quoteSubmitButton = page.locator('._quote-submit-button');

    this.messageFormOpenButton = page.locator('._message-submit-button');
    this.messageTextareaField = new InputFormField(page.locator('._send-message-to-manager'), 'textarea', page, '._error-text');
    this.messageFormSubmitButton = page.locator('._send-message-to-manager-submit');

    this.pageLocator = page.locator(`#${this.PAGE_ID}`);
  }

  public async waitPageToBeVisible () {
    await expect(this.pageLocator).toBeVisible();
  }

  public async submitQuoteAndVerifyResponse (): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      (response) => response.url().includes(this.QUOTE_SUBMIT_RESOURCE_URL) && response.status() === 200
    );

    await this.quoteSubmitButton.click();
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
  }

  public async submitQuestionAndVerifyResponse (): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      (response) => response.url().includes(this.QUESTION_SUBMIT_RESOURCE_URL) && response.status() === 200
    );

    if (await this.messageFormOpenButton.isVisible()) {
      await this.messageFormOpenButton.click();
    }

    await this.messageTextareaField.fill('Test message');
    await this.messageFormSubmitButton.click();

    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
  }
}
