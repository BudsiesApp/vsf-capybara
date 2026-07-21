import { expect, Locator, Page } from '@playwright/test';

import { InputFormField, MultiselectFormField, SelectFormField } from '../../helpers/form/form-fields';
import { uploadImage } from '../../helpers/upload-image';

export class QuantityField {
  public quantityInput: InputFormField;
  public additionalQuantityButton: Locator;
  public additionalQuantityInput: InputFormField;

  public constructor (public page: Page) {
    this.quantityInput = new InputFormField(page.locator('._section'), 'input[name="quantity"]', page, '._error-text');
    this.additionalQuantityButton = page.locator('._quantity-button');
    this.additionalQuantityInput = new InputFormField(page.locator('._section'), 'input[name="additional-quantity"]', page);
  }
}

export class DeliveryDeadlineField {
  public deliveryRadioInput: Locator;
  public error: Locator;
  public dateInput: InputFormField;

  public constructor (public page: Page) {
    this.deliveryRadioInput = page.locator('input[name="deadline-radio"]+.sf-radio__checkmark');
    this.error = page.locator('._deadline-input-error');
    this.dateInput = new InputFormField(page.locator('._section'), '._deadline-input input', page, '._error-text');
  }
}
export class QuoteOrderPage {
  public readonly DEFAULT_PROJECT_NAME = 'Test Project';
  public readonly DEFAULT_PROJECT_DESCRIPTION = 'Test Description';
  public readonly DEFAULT_QUANTITY = '100';
  public readonly DEFAULT_CUSTOMER_FIRST_NAME = 'Test first name';
  public readonly DEFAULT_CUSTOMER_LAST_NAME = 'Test last name';
  public readonly DEFAULT_CUSTOMER_EMAIL = 'test@test.test';
  public readonly DEFAULT_CUSTOMER_PHONE = '+17715128896';
  public readonly DEFAULT_COUNTRY_NAME = 'United States';

  public readonly BULK_QUOTE_CREATION_RESOURCE_URL = '/api/ext/budsies/bulk-orders/create'

  public photoUploader: Locator;
  public photoUploaderError: Locator;
  public projectNameInput: InputFormField
  public projectDescriptionInput: InputFormField;
  public quantityField: QuantityField;
  public deliveryDeadlineField: DeliveryDeadlineField;
  public countrySelect: MultiselectFormField;

  public customerFirstNameInput: InputFormField;
  public customerLastNameInput: InputFormField;
  public customerEmailInput: InputFormField;
  public customerPhoneInput: InputFormField;

  public customerTypeSelect: SelectFormField;
  public agreementCheckbox: Locator;
  public agreementError: Locator;
  public submitButton: Locator;
  public submitAnimation: Locator;

  public pageLocator: Locator;

  public constructor (public page: Page, public readonly pageIdSelector: string) {
    this.photoUploader = page.locator('._section', { has: page.locator('.m-artwork-upload') });
    this.photoUploaderError = this.photoUploader.locator('._error-text');
    this.projectNameInput = new InputFormField(page.locator('._section'), 'input[name="project-name"]', page);
    this.projectDescriptionInput = new InputFormField(page.locator('._section'), 'textarea[name="description"]', page, '._error-text');
    this.quantityField = new QuantityField(page);
    this.deliveryDeadlineField = new DeliveryDeadlineField(page);
    this.countrySelect = new MultiselectFormField(page.locator('._section'), '._coutry-select', page);
    this.customerFirstNameInput = new InputFormField(page.locator('._section .sf-input'), 'input[name="first-name"]', page);
    this.customerLastNameInput = new InputFormField(page.locator('._section .sf-input'), 'input[name="last-name"]', page);
    this.customerEmailInput = new InputFormField(page.locator('._section .sf-input'), 'input[name="email"]', page);
    this.customerPhoneInput = new InputFormField(page.locator('._section .sf-input'), 'input[name="phone-number"]', page);
    this.customerTypeSelect = new SelectFormField(page.locator('._section'), '._customer-type-selector', page);
    this.agreementCheckbox = page.locator('._agreement-checkbox .sf-checkbox__checkmark');
    this.agreementError = page.locator('._agreement-error');
    this.submitButton = page.locator('._button-container .sf-button:has-text("Get My Quote")');
    this.submitAnimation = page.locator('.sf-modal._quotation-calculating-modal ._quotation-calculating-modal-video');

    this.pageLocator = page.locator(pageIdSelector);
  }

  public async waitPageToBeVisible () {
    await expect(this.pageLocator).toBeVisible();
  }

  public async expectCorrectValidation (): Promise<void> {
    await expect(this.photoUploaderError).toBeVisible();
    await expect(this.projectNameInput.error).toBeVisible();
    await expect(this.projectDescriptionInput.error).toBeVisible();
    await expect(this.quantityField.quantityInput.error).toBeVisible();

    await expect(this.deliveryDeadlineField.error).toBeVisible();
    await this.deliveryDeadlineField.deliveryRadioInput.nth(1).click();
    await expect(this.deliveryDeadlineField.dateInput.error).toBeVisible();

    await expect(this.customerFirstNameInput.error).toBeVisible();
    await expect(this.customerEmailInput.error).toBeVisible();
    await expect(this.customerPhoneInput.error).toBeVisible();
    await expect(this.agreementError).toBeVisible();
  }

  public async fillRequiredData (
    projectName: string = this.DEFAULT_PROJECT_NAME,
    projectDescription: string = this.DEFAULT_PROJECT_DESCRIPTION,
    quantity: string = this.DEFAULT_QUANTITY,
    deadlineOptionIndex = 0,
    countryName: string = this.DEFAULT_COUNTRY_NAME,
    customerFirstName: string = this.DEFAULT_CUSTOMER_FIRST_NAME,
    customerLastName: string = this.DEFAULT_CUSTOMER_LAST_NAME,
    customerEmail: string = this.DEFAULT_CUSTOMER_EMAIL,
    customerPhone: string = this.DEFAULT_CUSTOMER_PHONE
  ): Promise<void> {
    await uploadImage(this.page, this.photoUploader);
    const uploadStatus = this.page.locator('.filepond--file-status-main');
    await expect(uploadStatus).toHaveText('Upload complete');

    await this.projectNameInput.fill(projectName);
    await this.projectDescriptionInput.fill(projectDescription);
    await this.quantityField.quantityInput.fill(quantity);
    await this.deliveryDeadlineField.deliveryRadioInput.nth(deadlineOptionIndex).click();
    await this.countrySelect.selectByOptionTitle(countryName);
    await this.customerFirstNameInput.fill(customerFirstName);
    await this.customerLastNameInput.fill(customerLastName);
    await this.customerEmailInput.fill(customerEmail);
    await this.customerPhoneInput.fill(customerPhone);
    await this.agreementCheckbox.click();
  }

  public async submitFormAndVerifyResponse (): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      response => response.url().includes(this.BULK_QUOTE_CREATION_RESOURCE_URL) && response.status() === 200
    );

    await this.submitForm();
    await expect(this.submitAnimation).toBeVisible();
    await expect(this.submitAnimation).not.toBeVisible({ timeout: 10000 });

    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
  }

  public async submitForm (): Promise<void> {
    await this.submitButton.click();
  }
}
