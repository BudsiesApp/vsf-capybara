import { expect, FrameLocator, Locator, Page, Request } from '@playwright/test';

import { CartPage } from './cart';
import { MultiselectFormField, InputFormField } from '../../helpers/form/form-fields';

export const COUNTRY_WITH_STATES_LIST = 'United States';
export const COUNTRY_WITH_STATES_LIST_CODE = 'US';
export const COUNTRY_WITH_STATES_DEFAULT_STATE = 'California';
export const COUNTRY_WITHOUT_STATES_LIST = 'United Kingdom';

const REQUIRED_FIELD_ERROR_MESSAGE = 'Field is required';

const DEFAULT_FIRST_NAME = 'Test first name';
const DEFAULT_LAST_NAME = 'Test last name';
const DEFAULT_EMAIL = 'test@test.test';
const DEFAULT_PASSWORD = 'testPassword123';
const DEFAULT_ADDRESS = 'Test Address';
const DEFAULT_COUNTRY = COUNTRY_WITH_STATES_LIST;
const DEFAULT_STATE = COUNTRY_WITH_STATES_DEFAULT_STATE;
const DEFAULT_CITY = 'Test City';
const DEFAULT_ZIP_CODE = '12345';
const DEFAULT_PHONE = '+17472920712';

export interface AddressData {
  firstName: string,
  lastName: string,
  address: string,
  country: string,
  countryId: string,
  state: string,
  regionId: null | number,
  city: string,
  zipCode: string,
  phoneNumber: string
}

export class PersonalDetailsStep {
  public stepTitle: Locator;

  public formFieldLocator: Locator;
  public passwordFormFieldLocator: Locator;

  public firstNameFormField: InputFormField;
  public lastNameFormField: InputFormField;
  public emailFormField: InputFormField;

  public continueButton: Locator;

  public agreeToTermsCheckbox: Locator;

  public constructor (public readonly page: Page) {
    this.stepTitle = page.locator('.sf-heading__title--h3:has-text("Contact")');

    this.formFieldLocator = page.locator('.form__element');
    this.passwordFormFieldLocator = page.locator('.m-password ._input');

    this.continueButton = page.locator('.sf-button._continue-button');

    this.firstNameFormField = new InputFormField(this.formFieldLocator, 'input[name="first-name"]', page);
    this.lastNameFormField = new InputFormField(this.formFieldLocator, 'input[name="last-name"]', page);
    this.emailFormField = new InputFormField(this.formFieldLocator, 'input[name="email-address"]', page);

    const checkboxInputLocator = page.locator('input[name="acceptConditions"]');

    this.agreeToTermsCheckbox = page.locator(
      '.sf-checkbox',
      {
        has: checkboxInputLocator
      }
    );
  }

  public async fillPersonalDetails (
    firstName: string = DEFAULT_FIRST_NAME,
    lastName: string = DEFAULT_LAST_NAME,
    email: string = DEFAULT_EMAIL
  ) {
    await this.firstNameFormField.fill(firstName);
    await this.lastNameFormField.fill(lastName);
    await this.emailFormField.fill(email);

    await this.continueButton.click();
  }

  public async expectCorrectValidation () {
    await this.fillPersonalDetails('', '', '');
    await this.continueButton.click();

    await this.firstNameFormField.expectToHaveErrorMessage(REQUIRED_FIELD_ERROR_MESSAGE);
    await this.lastNameFormField.expectToHaveErrorMessage(REQUIRED_FIELD_ERROR_MESSAGE);
    await this.emailFormField.expectToHaveErrorMessage(REQUIRED_FIELD_ERROR_MESSAGE);

    await this.emailFormField.fill('test');
    await this.emailFormField.expectToHaveErrorMessage('Please, provide the correct email address');
  }

  public async waitToBeVisible () {
    await expect(this.stepTitle).toBeVisible();
  }
}

export class AddressForm {
  public formFieldLocator: Locator;
  public multiselectFieldLocator: Locator;

  public firstNameFormField: InputFormField;
  public lastNameFormField: InputFormField;
  public streetAddressFormField: InputFormField;

  public countrySelectorFormField: MultiselectFormField;
  public stateSelectorFormField: MultiselectFormField;
  public stateInputFormField: InputFormField;
  public cityFormField: InputFormField;
  public zipCodeFormField: InputFormField;
  public phoneFormField: InputFormField;

  public constructor (public readonly page: Page) {
    this.formFieldLocator = page.locator('.form__element');
    this.multiselectFieldLocator = page.locator('.m-multiselect');

    this.firstNameFormField = new InputFormField(this.formFieldLocator, 'input[name="first-name"]', page);
    this.lastNameFormField = new InputFormField(this.formFieldLocator, 'input[name="last-name"]', page);
    this.streetAddressFormField = new InputFormField(this.formFieldLocator, 'input[name="street-address"]', page);

    this.countrySelectorFormField = new MultiselectFormField(this.multiselectFieldLocator, 'label:has-text("Country")', page);
    this.stateSelectorFormField = new MultiselectFormField(this.multiselectFieldLocator, 'label:has-text("State / Province")', page);
    this.stateInputFormField = new InputFormField(this.formFieldLocator, 'input[name="address-level1"]', page);

    this.cityFormField = new InputFormField(this.formFieldLocator, 'input[name="city"]', page);
    this.zipCodeFormField = new InputFormField(this.formFieldLocator, 'input[name="zipCode"]', page);
    this.phoneFormField = new InputFormField(this.formFieldLocator, 'input[name="phone"]', page);
  }

  public async fillAddress (
    address: string = DEFAULT_ADDRESS,
    country: string = DEFAULT_COUNTRY,
    state: string = DEFAULT_STATE,
    city: string = DEFAULT_CITY,
    zipCode: string = DEFAULT_ZIP_CODE,
    phone: string = DEFAULT_PHONE
  ) {
    await this.streetAddressFormField.fill(address);
    await this.countrySelectorFormField.selectByOptionTitle(country);

    if (state) {
      await this.stateSelectorFormField.selectByOptionTitle(state);
    }

    await this.cityFormField.fill(city);
    await this.zipCodeFormField.fill(zipCode);
    await this.phoneFormField.fill(phone);
  }

  public async expectCorrectValidation () {
    await this.firstNameFormField.fill('');
    await this.lastNameFormField.fill('');

    await this.fillAddress('', COUNTRY_WITHOUT_STATES_LIST, '', '', '', '');
    await this.fillAddress('', COUNTRY_WITH_STATES_LIST, '', '', '', '');

    await this.firstNameFormField.expectToHaveErrorMessage(REQUIRED_FIELD_ERROR_MESSAGE);
    await this.lastNameFormField.expectToHaveErrorMessage(REQUIRED_FIELD_ERROR_MESSAGE);
    await this.streetAddressFormField.expectToHaveErrorMessage(REQUIRED_FIELD_ERROR_MESSAGE);
    await this.stateSelectorFormField.expectToHaveErrorMessage(REQUIRED_FIELD_ERROR_MESSAGE);
    await this.cityFormField.expectToHaveErrorMessage(REQUIRED_FIELD_ERROR_MESSAGE);
    await this.zipCodeFormField.expectToHaveErrorMessage(REQUIRED_FIELD_ERROR_MESSAGE);

    await this.countrySelectorFormField.selectByOptionTitle(COUNTRY_WITHOUT_STATES_LIST);
    await expect(this.stateInputFormField.formField).toBeVisible();
    await expect(this.stateSelectorFormField.formField).toBeHidden();
    await this.phoneFormField.expectToHaveErrorMessage(REQUIRED_FIELD_ERROR_MESSAGE);
  }
}

export class ShippingStep {
  public addressForm: AddressForm;
  public shippingMethodSelector: Locator;
  public continueToPaymentButton: Locator;

  public constructor (public readonly page: Page) {
    this.addressForm = new AddressForm(page);
    this.shippingMethodSelector = page.locator('input.form__radio.shipping input[type="radio"]');
    this.continueToPaymentButton = page.locator('button:has-text("Continue to payment")');
  }

  public async expectShippingMethodsCountToBe (count: number): Promise<void> {
    await expect(this.shippingMethodSelector).toHaveCount(count);
  }

  public async expectShippingMethodToBeSelected (label: string): Promise<void> {
    const selectedShippingMethod = this.page.locator('.shipping.sf-radio--is-active', {
      has: this.page.locator(`.shipping__label:has-text("${label}")`)
    });

    await expect(selectedShippingMethod).toBeVisible({ timeout: 10000 });
  }
}

export class BillingStep {
  public addressForm: AddressForm;
  public useShippingAddressCheckbox: Locator;
  public goToReviewButton: Locator;

  public constructor (public readonly page: Page) {
    this.addressForm = new AddressForm(page);
    this.useShippingAddressCheckbox = page.locator('input[name="sendToShippingAddress"]').locator('..');
    this.goToReviewButton = page.locator('button:has-text("Go review the order")');
  }

  public async useShippingAddress (): Promise<void> {
    const isChecked = await this.useShippingAddressCheckbox.isChecked();

    if (isChecked) {
      return;
    }

    await this.useShippingAddressCheckbox.locator('.sf-checkbox__label').click();
    await expect(this.useShippingAddressCheckbox).toBeChecked();
  }

  public async fillAddress (
    useShippingAddress: boolean = true,
    address?: string,
    country?: string,
    state?: string,
    city?: string,
    zipCode?: string,
    phone?: string
  ) {
    if (useShippingAddress) {
      return;
    }

    if (await this.useShippingAddressCheckbox.isVisible()) {
      await this.useShippingAddressCheckbox.locator('.sf-checkbox__label').click();
    }

    await this.addressForm.fillAddress(
      address,
      country,
      state,
      city,
      zipCode,
      phone
    );
  }
}

export class ReviewStep {
  private readonly creditCardNumber = '4111111111111111';
  private readonly creditCardExpiration = '12/29';
  private readonly creditCardCvv = '123';

  public giftCardPayment: Locator;
  public paymentMethodSelector: Locator;

  public creditCardNumberInput: FrameLocator;
  public creditCardExpirationInput: FrameLocator;
  public creditCardCvvInput: FrameLocator;

  public placeOrderButton: Locator;
  public orderProcessingLoader: Locator;
  public accountCreatingLoader: Locator;

  public constructor (public readonly page: Page) {
    this.paymentMethodSelector = page.locator('.form__radio-group');
    this.placeOrderButton = page.locator('button:has-text("Place the order")');

    this.creditCardNumberInput = page.frameLocator('#card-number iframe');
    this.creditCardExpirationInput = page.frameLocator('#expiration-date iframe');
    this.creditCardCvvInput = page.frameLocator('#cvv iframe');
    this.orderProcessingLoader = page.locator('.m-loader--message:has-text("Processing order...")');
    this.accountCreatingLoader = page.locator('.m-loader--message:has-text("Registering the account ...")');
    this.giftCardPayment = page.locator('.gift-card-payment');
  }

  public async selectCreditCardPaymentMethodAndFillCardData () {
    const creditCardOption = this.paymentMethodSelector.locator('.checkout-card');
    const creditCardOptionInput = creditCardOption.locator('input');

    if (await creditCardOptionInput.isDisabled()) {
      await expect(creditCardOptionInput).toBeEnabled();
    }

    await creditCardOption.click();

    await this.creditCardNumberInput.locator('input#credit-card-number').fill(this.creditCardNumber);
    await this.creditCardExpirationInput.locator('input#expiration').fill(this.creditCardExpiration);
    await this.creditCardCvvInput.locator('input#cvv').fill(this.creditCardCvv);
  }

  public async expectGiftCardPaymentToBeNotAvailable (): Promise<void> {
    const message = this.giftCardPayment.locator('._notice-message');
    await expect(message).toHaveText('Gift Cards cannot be used to purchase Gift Card products');
  }
}

export class CheckoutPage {
  public readonly PLACE_ORDER_API_RESOURCE = '/api/order';
  public readonly stepsName = {
    personalDetails: 'Contact',
    shipping: 'Shipping',
    billing: 'Billing address',
    orderReview: 'Review'
  };

  public steps: Locator;

  public personalDetailsStep: PersonalDetailsStep;
  public shippingStep: ShippingStep;
  public billingStep: BillingStep;
  public orderReviewStep: ReviewStep;

  public orderSuccessPage: Locator;

  public constructor (public readonly page: Page, public readonly cartPage: CartPage) {
    this.steps = page.locator('.sf-steps__header');

    this.personalDetailsStep = new PersonalDetailsStep(page);
    this.shippingStep = new ShippingStep(page);
    this.billingStep = new BillingStep(page);
    this.orderReviewStep = new ReviewStep(page);
    this.orderSuccessPage = page.locator('.o-order-success');
  }

  public async fillShippingAddress (
    address?: string,
    country?: string,
    state?: string,
    city?: string,
    zipCode?: string,
    phone?: string
  ) {
    await this.shippingStep.addressForm.fillAddress(address, country, state, city, zipCode, phone);
    await this.shippingStep.continueToPaymentButton.click();
  }

  public async fillBillingAddress (
    useShippingAddress: boolean = true,
    address?: string,
    country?: string,
    state?: string,
    city?: string,
    zipCode?: string,
    phone?: string
  ) {
    await this.billingStep.fillAddress(useShippingAddress, address, country, state, city, zipCode, phone);

    await this.billingStep.goToReviewButton.click();
  }

  public async waitForPlaceOrderRequest (): Promise<Request> {
    return this.page.waitForRequest((request) => request.url().includes(this.PLACE_ORDER_API_RESOURCE));
  }

  public expectAddressInPlaceOrderPayloadToBeEqual (payloadAddress: any, addressData: AddressData): void {
    expect(payloadAddress.city).toEqual(addressData.city);

    if (addressData.regionId) {
      expect(payloadAddress.region_id).toEqual(addressData.regionId);
      expect(payloadAddress.region).toEqual('');
    } else {
      expect(payloadAddress.region_id).toBeNull();
      expect(payloadAddress.region).toEqual(addressData.state);
    }

    expect(payloadAddress.country_id).toEqual(addressData.countryId);
    expect(payloadAddress.firstname).toEqual(addressData.firstName);
    expect(payloadAddress.lastname).toEqual(addressData.lastName);
    expect(payloadAddress.postcode).toEqual(addressData.zipCode);
    expect(payloadAddress.telephone).toEqual(addressData.phoneNumber);
    expect(payloadAddress.street[0]).toEqual(addressData.address);
  }

  public async selectPaymentMethodAndPlaceOrder () {
    await this.orderReviewStep.selectCreditCardPaymentMethodAndFillCardData();
    await this.orderReviewStep.placeOrderButton.click();

    await expect(this.orderReviewStep.orderProcessingLoader).toBeVisible({ timeout: 10000 });

    await expect(this.orderSuccessPage).toBeVisible({ timeout: 30000 });
  }

  public isStepVisible (stepName: string): Promise<boolean> {
    const step = this.steps.locator(`.sf-steps__title:has-text("${stepName}")`);
    return step.isVisible();
  }

  public async expectStepToBeHidden (stepName: string): Promise<void> {
    const step = this.steps.locator(`.sf-steps__title:has-text("${stepName}")`);
    await expect(step).toBeHidden();
  }

  public async expectStepToBeVisible (stepName: string): Promise<void> {
    const step = this.steps.locator(`.sf-steps__title:has-text("${stepName}")`);
    await expect(step).toBeVisible();
  }

  public async waitStepToBeActive (stepName: string): Promise<void> {
    const activeStep = this.steps.locator(`.sf-steps__step--current .sf-steps__title:has-text("${stepName}")`);
    await expect(activeStep).toBeVisible();
  }

  public async goToStepByName (stepName: string): Promise<void> {
    const step = this.steps.locator(`.sf-steps__title:has-text("${stepName}")`);
    await step.click();

    await this.waitStepToBeActive(stepName);
  }

  public async goto () {
    await this.cartPage.goToCheckout();
  }
}
