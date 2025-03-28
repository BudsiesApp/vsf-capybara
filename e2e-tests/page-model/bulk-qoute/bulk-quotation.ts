import { expect, Locator, Page } from '@playwright/test';
import { TextAreaFormField } from '../../helpers/form/form-fields';

export class BulkQuotationPage {
  public readonly QUOTE_SUBMIT_RESOURCE_URL = '/api/ext/budsies/bulk-orders/quote-choose';
  public readonly QUESTION_SUBMIT_RESOURCE_URL = '/api/ext/budsies/bulk-orders/question';
  public readonly PAGE_ID = 'bulkorder-quotation';

  public qouteSubmitButton: Locator;
  public pageLocator: Locator;

  public messageFormOpenButton: Locator;
  public messageTextareaField: TextAreaFormField;
  public messageFormSubmitButton: Locator;

  public constructor (public readonly page: Page) {
    this.qouteSubmitButton = page.locator('._quote-submit-button');

    this.messageFormOpenButton = page.locator('._message-submit-button');
    this.messageTextareaField = new TextAreaFormField(page.locator('._send-message-to-manager'), 'textarea', '._error-text', page);
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

    await this.qouteSubmitButton.click();
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
  }

  public async submitQuestionAndVerifyResponse (): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      (response) => response.url().includes(this.QUOTE_SUBMIT_RESOURCE_URL) && response.status() === 200
    );

    await this.messageFormOpenButton.click();
    await this.messageTextareaField.fill('Test message');
    await this.messageFormSubmitButton.click();

    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
  }
}
