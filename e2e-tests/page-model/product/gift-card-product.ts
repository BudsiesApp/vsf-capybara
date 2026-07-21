import { expect, Locator, Page } from '@playwright/test';

import { InputFormField, SelectFormField } from '../../helpers/form/form-fields';

const PRODUCT_PAGE_URL = '/giftcards/';
const PRODUCT_PAGE_ID = 'gift-cards-page'

const CUSTOM_AMOUNT_OPTION = 'Custom Amount';

const DEFAULT_SENDER_NAME = 'Test Sender';
const DEFAULT_RECIPIENT_NAME = 'Test Recipient';
const DEFAULT_RECIPIENT_EMAIL = 'test@test.test';
const DEFAULT_MESSAGE = 'Test Message';

export class GiftCardTemplate {
  public readonly value: Locator;
  public readonly recipientName: Locator;
  public readonly senderName: Locator;
  public readonly message: Locator;

  public constructor (
    public parentContainerLocator: Locator
  ) {
    this.value = parentContainerLocator.locator('._gift-value');
    this.recipientName = parentContainerLocator.locator('._to');
    this.senderName = parentContainerLocator.locator('._from');
    this.message = parentContainerLocator.locator('._custom-message-container');
  }

  public async expectPreviewToHaveCorrectData (
    value: number,
    senderName: string = DEFAULT_SENDER_NAME,
    recipientName: string = DEFAULT_RECIPIENT_NAME,
    message: string = DEFAULT_MESSAGE
  ): Promise<void> {
    await expect(this.value).toHaveText(`$${value}`);
    await expect(this.senderName).toHaveText(senderName);
    await expect(this.recipientName).toHaveText(recipientName);
    await expect(this.message).toHaveText(message);
  }
}

export class GiftCardProductPage {
  public readonly PRODUCT_NAME = 'Gift Card';

  public formFieldLocator: Locator;

  public styleSelectFormField: SelectFormField;
  public valueSelectFormField: SelectFormField;
  public customValueInputFormField: InputFormField;

  public senderNameInputFormField: InputFormField;
  public recipientNameInputFormField: InputFormField;
  public recipientEmailInputFormField: InputFormField;

  public sendPhysicalGiftCardCheckbox: Locator;
  public messageTextArea: Locator;

  public modalPreviewButton: Locator;
  public leftSidePreview: GiftCardTemplate;
  public modalPreview: GiftCardTemplate;

  public addToCartButton: Locator;

  public constructor (public page: Page) {
    this.formFieldLocator = page.locator('._form-field');

    this.styleSelectFormField = new SelectFormField(
      this.formFieldLocator,
      '.sf-select[name="giftcard_template_id"]',
      page
    );
    this.valueSelectFormField = new SelectFormField(
      this.formFieldLocator,
      '.sf-select[name="price_amount"]',
      page
    );
    this.customValueInputFormField = new InputFormField(
      this.formFieldLocator,
      'input[name="custom_price_amount"]',
      page
    );

    this.senderNameInputFormField = new InputFormField(
      this.formFieldLocator,
      'input[name="customer_name"]',
      page
    );
    this.recipientNameInputFormField = new InputFormField(
      this.formFieldLocator,
      'input[name="recipient_name"]',
      page
    );
    this.recipientEmailInputFormField = new InputFormField(
      this.formFieldLocator,
      'input[name="recipient_email"]',
      page
    );

    this.sendPhysicalGiftCardCheckbox = page.locator('._recipient-ship label')
    this.messageTextArea = page.locator('textarea[name="custom_message"]');

    this.modalPreviewButton = page.locator('._giftcard-preview');
    this.leftSidePreview = new GiftCardTemplate(page.locator('._col.-left'));
    this.modalPreview = new GiftCardTemplate(page.locator('.sf-modal__content'));

    this.addToCartButton = page.locator('button[type="submit"]');
  }

  public async goto (): Promise<void> {
    await this.page.goto(PRODUCT_PAGE_URL);
    await this.waitPageToBeVisible();
  }

  public async waitPageToBeVisible (): Promise<void> {
    await expect(this.page.locator(`#${PRODUCT_PAGE_ID}`)).toBeVisible();
  }

  public async expectCorrectValidation (): Promise<void> {
    await this.addToCartButton.click();

    await this.senderNameInputFormField.expectToHaveErrorMessage('The \'Sender Name\' field is required');
    await this.recipientNameInputFormField.expectToHaveErrorMessage('The \'Recipient Name\' field is required');
    await this.recipientEmailInputFormField.expectToHaveErrorMessage('The \'Recipient Email\' field is required');

    await this.recipientEmailInputFormField.fill('invalid-email');
    await this.recipientEmailInputFormField.expectToHaveErrorMessage('Please, provide the correct email address');

    await this.valueSelectFormField.selectByOptionTitle(CUSTOM_AMOUNT_OPTION);
    await this.customValueInputFormField.fill('0');
    await this.customValueInputFormField.expectToHaveErrorMessage('Please, enter amount between 5 and 1000');
  }

  public async expectPreviewToHaveCorrectData (
    value: number,
    senderName: string = DEFAULT_SENDER_NAME,
    recipientName: string = DEFAULT_RECIPIENT_NAME,
    message: string = DEFAULT_MESSAGE
  ): Promise<void> {
    await this.leftSidePreview.expectPreviewToHaveCorrectData(value, senderName, recipientName, message);

    await this.modalPreviewButton.click();
    await this.modalPreview.expectPreviewToHaveCorrectData(value, senderName, recipientName, message);
    await this.page.locator('.sf-modal__container ._close-preview').click();
  }

  public async fillFormData (
    senderName: string = DEFAULT_SENDER_NAME,
    recipientName: string = DEFAULT_RECIPIENT_NAME,
    recipientEmail: string = DEFAULT_RECIPIENT_EMAIL,
    sendPhysicalGiftCard = false,
    message: string = DEFAULT_MESSAGE
  ): Promise<void> {
    await this.senderNameInputFormField.fill(senderName);
    await this.recipientNameInputFormField.fill(recipientName);
    await this.messageTextArea.fill(message);

    if (sendPhysicalGiftCard) {
      await this.sendPhysicalGiftCardCheckbox.click();
      return;
    }

    await this.recipientEmailInputFormField.fill(recipientEmail);
  }

  public async selectCustomAmountOption (): Promise<void> {
    await this.valueSelectFormField.selectByOptionTitle(CUSTOM_AMOUNT_OPTION);
  }
}
