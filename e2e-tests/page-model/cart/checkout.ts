import { expect, FrameLocator, Locator, Page } from '@playwright/test';

import { CartPage } from './cart';

const REQUIRED_FIELD_ERROR_MESSAGE = 'Field is required';
const COUNTRY_WITH_STATES_LIST = 'United States';
const COUNTRY_WITHOUT_STATES_LIST = 'United Kingdom';

export class PersonalDetailsStep {
  public stepTitle: Locator;

  public continueToShippingButton: Locator;
  public firstNameInput: Locator;
  public lastNameInput: Locator;
  public emailInput: Locator;

  public createAccountCheckbox: Locator;
  public passwordInput: Locator;
  public repeatPasswordInput: Locator;
  public agreeToTermsCheckbox: Locator;

  public firstNameError: Locator;
  public lastNameError: Locator;
  public emailError: Locator;
  public passwordError: Locator;
  public repeatPasswordError: Locator;

  // TODO: currently this checkbox is not validated properly
  public agreeToTermsError: Locator;

  public constructor (public readonly page: Page) {
    this.stepTitle = page.locator('.sf-heading__title--h3:has-text("Contact")');

    this.continueToShippingButton = page.locator('button:has-text("Continue to shipping")');
    this.firstNameInput = page.locator('input[name="first-name"]');
    this.lastNameInput = page.locator('input[name="last-name"]');
    this.emailInput = page.locator('input[name="email-address"]');
    this.createAccountCheckbox = page.locator('label:has-text("I want to create an account")');
    this.passwordInput = page.locator('input[name="password"]');
    this.repeatPasswordInput = page.locator('input[name="password-confirm"]');
    this.agreeToTermsCheckbox = page.locator('input[name="acceptConditions"]');

    this.firstNameError = this.firstNameInput.locator('..').locator('..').locator('.sf-input__error-message');
    this.lastNameError = this.lastNameInput.locator('..').locator('..').locator('.sf-input__error-message');
    this.emailError = this.emailInput.locator('..').locator('..').locator('.sf-input__error-message');
    this.passwordError = this.passwordInput.locator('..').locator('..').locator('.sf-input__error-message');
    this.repeatPasswordError = this.repeatPasswordInput.locator('..').locator('..').locator('.sf-input__error-message');
  }

  public async fillPersonalDetails (
    firstName: string,
    lastName: string,
    email: string,
    createAccount: boolean = false,
    password: string = 'testPassword123'
  ) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);

    if (createAccount) {
      await this.createAccountCheckbox.click();
      await this.passwordInput.fill(password);
      await this.repeatPasswordInput.fill(password);
    }

    await this.continueToShippingButton.click();
  }

  public async expectCorrectValidation () {
    await this.fillPersonalDetails('', '', '', true, '');

    await expect(this.firstNameError).toHaveText(REQUIRED_FIELD_ERROR_MESSAGE);
    await expect(this.lastNameError).toHaveText(REQUIRED_FIELD_ERROR_MESSAGE);
    await expect(this.emailError).toHaveText(REQUIRED_FIELD_ERROR_MESSAGE);
    await expect(this.passwordError).toHaveText(REQUIRED_FIELD_ERROR_MESSAGE);
    await expect(this.repeatPasswordError).toHaveText(REQUIRED_FIELD_ERROR_MESSAGE);

    await this.emailInput.fill('test');
    await expect(this.emailError).toHaveText('Please provide valid e-mail address.');

    await this.passwordInput.fill('test');
    await this.repeatPasswordInput.fill('test2');

    await expect(this.passwordError).toHaveText('Password must have at least 7 symbols.');
    await expect(this.repeatPasswordError).toHaveText('Passwords must be identical');
  }

  public async waitToBeVisible () {
    await expect(this.stepTitle).toBeVisible();
  }
}

export class AddressForm {
  public firstNameInput: Locator;
  public lastNameInput: Locator;
  public streetAddressInput: Locator;

  public countrySelector: Locator;
  public selectedCountry: Locator;
  public stateSelector: Locator;
  public stateInput: Locator;
  public cityInput: Locator;
  public zipCodeInput: Locator;
  public phoneInput: Locator;

  public firstNameError: Locator;
  public lastNameError: Locator;
  public streetAddressError: Locator;
  public countryError: Locator;
  public stateError: Locator;
  public cityError: Locator;
  public zipCodeError: Locator;
  public phoneError: Locator;

  public constructor (public readonly page: Page) {
    this.firstNameInput = page.locator('input[name="first-name"]');
    this.lastNameInput = page.locator('input[name="last-name"]');
    this.streetAddressInput = page.locator('input[name="street-address"]');
    this.countrySelector = page.locator('label:has-text("Country")');
    this.selectedCountry = page.locator('.multiselect__single');
    this.stateSelector = page.locator('.m-multiselect > label:has-text("State / Province")');
    this.stateInput = page.locator('input[name="address-level1"]');
    this.cityInput = page.locator('input[name="city"]');
    this.zipCodeInput = page.locator('input[name="zipCode"]');
    this.phoneInput = page.locator('input[name="phone"]');

    this.firstNameError = this.firstNameInput.locator('..').locator('..').locator('.sf-input__error-message');
    this.lastNameError = this.lastNameInput.locator('..').locator('..').locator('.sf-input__error-message');
    this.streetAddressError = this.streetAddressInput.locator('..').locator('..').locator('.sf-input__error-message');
    this.countryError = this.countrySelector.locator('..').locator('.m-multiselect__error-message');
    this.stateError = this.stateSelector.locator('..').locator('.m-multiselect__error-message');
    this.cityError = this.cityInput.locator('..').locator('..').locator('.sf-input__error-message');
    this.zipCodeError = this.zipCodeInput.locator('..').locator('..').locator('.sf-input__error-message');
    this.phoneError = this.phoneInput.locator('..').locator('..').locator('.sf-input__error-message');
  }

  public async fillAddress (address: string, country: string, state: string, city: string, zipCode: string, phone: string) {
    await this.streetAddressInput.fill(address);
    await this.selectCountryByName(country);

    if (state) {
      await this.selectStateByName(state);
    }

    await this.cityInput.fill(city);
    await this.zipCodeInput.fill(zipCode);
    await this.phoneInput.fill(phone);
  }

  public async selectCountryByName (country: string) {
    await this.countrySelector.click();
    await this.page.locator('li').getByText(country).click();
  }

  public async selectStateByName (state: string) {
    await this.stateSelector.click();
    await this.page.locator('li').getByText(state).click();
  }

  public async expectCorrectValidation () {
    await this.firstNameInput.fill('');
    await this.lastNameInput.fill('');

    await this.fillAddress('', COUNTRY_WITHOUT_STATES_LIST, '', '', '', '');
    await this.fillAddress('', COUNTRY_WITH_STATES_LIST, '', '', '', '');

    await expect(this.firstNameError).toHaveText(REQUIRED_FIELD_ERROR_MESSAGE);
    await expect(this.lastNameError).toHaveText(REQUIRED_FIELD_ERROR_MESSAGE);
    await expect(this.streetAddressError).toHaveText(REQUIRED_FIELD_ERROR_MESSAGE);
    await expect(this.stateError).toHaveText(REQUIRED_FIELD_ERROR_MESSAGE);
    await expect(this.cityError).toHaveText(REQUIRED_FIELD_ERROR_MESSAGE);
    await expect(this.zipCodeError).toHaveText(REQUIRED_FIELD_ERROR_MESSAGE);

    await this.selectCountryByName(COUNTRY_WITHOUT_STATES_LIST);
    await expect(this.stateSelector).toBeHidden();
    await expect(this.phoneError).toHaveText(REQUIRED_FIELD_ERROR_MESSAGE);
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
}

export class ReviewStep {
  private readonly creditCardNumber = '4111111111111111';
  private readonly creditCardExpiration = '12/29';
  private readonly creditCardCvv = '123';

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
  }

  public async selectCreditCardPaymentMethodAndFillCardData () {
    const creditCardOption = this.paymentMethodSelector.locator('.checkout-card');
    await creditCardOption.click();

    await this.creditCardNumberInput.locator('input#credit-card-number').fill(this.creditCardNumber);
    await this.creditCardExpirationInput.locator('input#expiration').fill(this.creditCardExpiration);
    await this.creditCardCvvInput.locator('input#cvv').fill(this.creditCardCvv);
  }
}

export class CheckoutPage {
  public personalDetailsStep: PersonalDetailsStep;
  public shippingStep: ShippingStep;
  public billingStep: BillingStep;
  public orderReviewStep: ReviewStep;

  public orderSuccessPage: Locator;

  public constructor (public readonly page: Page, public readonly cartPage: CartPage) {
    this.personalDetailsStep = new PersonalDetailsStep(page);
    this.shippingStep = new ShippingStep(page);
    this.billingStep = new BillingStep(page);
    this.orderReviewStep = new ReviewStep(page);
    this.orderSuccessPage = page.locator('.o-order-success');
  }

  public async fillShippingAddress (address: string, country: string, state: string, city: string, zipCode: string, phone: string) {
    await this.shippingStep.addressForm.fillAddress(address, country, state, city, zipCode, phone);
    await this.shippingStep.continueToPaymentButton.click();
  }

  public async fillBillingAddress () {
    await this.billingStep.goToReviewButton.click();
  }

  public async selectPaymentMethodAndPlaceOrder (createAccount: boolean = false) {
    await this.orderReviewStep.selectCreditCardPaymentMethodAndFillCardData();
    await this.orderReviewStep.placeOrderButton.click();

    if (createAccount) {
      await expect(this.orderReviewStep.accountCreatingLoader).toBeVisible();
    } else {
      // TODO: this modal should be also visible after account creation
      await expect(this.orderReviewStep.orderProcessingLoader).toBeVisible();
    }

    await expect(this.orderSuccessPage).toBeVisible({ timeout: 30000 });
  }

  public async goto () {
    await this.cartPage.goToCheckout();
  }
}
