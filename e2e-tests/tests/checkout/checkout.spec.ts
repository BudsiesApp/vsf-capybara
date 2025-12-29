import { test, expect } from '../../fixtures/checkout-page';
import { getRandomEmail } from '../../helpers/get-random-email';
import { AddressData, COUNTRY_WITH_STATES_DEFAULT_STATE, COUNTRY_WITH_STATES_LIST, COUNTRY_WITH_STATES_LIST_CODE } from '../../page-model/cart/checkout';

const simpleProductUrl = '/p/voice-recorder/';

const FIRST_NAME = 'First name';
const LAST_NAME = 'Last name';

const FEDEX_SHIPPING_COUNTRY_CODE = 'AR';
const FEDEX_SHIPPING_COUNTRY_LABEL = 'Argentina';
const FEDEX_LABEL = 'Fedex';
const fedexAvailableAddress: AddressData = {
  firstName: FIRST_NAME,
  lastName: LAST_NAME,
  address: 'Street name, 256, 4',
  country: FEDEX_SHIPPING_COUNTRY_LABEL,
  countryId: FEDEX_SHIPPING_COUNTRY_CODE,
  state: '',
  regionId: null,
  city: 'Buenos Aires',
  zipCode: 'C1420',
  phoneNumber: '+548752887012'
};

const USPS_SHIPPING_COUNTRY_CODE = 'US';
const USPS_SHIPPING_COUNTRY_LABEL = 'United States';
const USPS_SHIPPING_STATE_LABEL = 'Georgia';
const USPS_LABEL = 'USPS or local equivalent';
const uspsAvailableAddress: AddressData = {
  firstName: FIRST_NAME,
  lastName: LAST_NAME,
  address: '15 Bridge Creek Rd',
  country: USPS_SHIPPING_COUNTRY_LABEL,
  countryId: USPS_SHIPPING_COUNTRY_CODE,
  state: USPS_SHIPPING_STATE_LABEL,
  regionId: 19,
  city: 'Tiger',
  zipCode: '30576',
  phoneNumber: '+17472920712'
};

const billingAddress: AddressData = {
  firstName: `Billing ${FIRST_NAME}`,
  lastName: `Billing ${LAST_NAME}`,
  address: 'Street name, 128, 2',
  country: COUNTRY_WITH_STATES_LIST,
  countryId: COUNTRY_WITH_STATES_LIST_CODE,
  state: COUNTRY_WITH_STATES_DEFAULT_STATE,
  regionId: 12,
  city: 'Test city',
  zipCode: '12345',
  phoneNumber: '+17472920712'
}

const COUNTRY_WITHOUT_SHIPPING_METHODS = 'Curaçao';

test('personal details form has correct validation', async ({ page, cartPage, checkoutPage, simpleProductPage }) => {
  await page.goto(simpleProductUrl);
  await simpleProductPage.waitPageToBeVisible();
  await simpleProductPage.addToCartAndVerifyResponse();

  await cartPage.goto();
  await checkoutPage.goto();
  await checkoutPage.personalDetailsStep.waitToBeVisible();

  await checkoutPage.personalDetailsStep.expectCorrectValidation();
});

test('shipping address form has correct validation', async ({ cartPage, checkoutPage, simpleProductPage, page }) => {
  await page.goto(simpleProductUrl);
  await simpleProductPage.waitPageToBeVisible();
  await simpleProductPage.addToCartAndVerifyResponse();

  await cartPage.goto();
  await checkoutPage.goto();
  await checkoutPage.personalDetailsStep.fillPersonalDetails(FIRST_NAME, LAST_NAME);

  const shippingStepAddressForm = checkoutPage.shippingStep.addressForm;
  await shippingStepAddressForm.firstNameFormField.expectToHaveValue(FIRST_NAME);
  await shippingStepAddressForm.lastNameFormField.expectToHaveValue(LAST_NAME);
  await shippingStepAddressForm.countrySelectorFormField.expectOptionToBeSelected('United States');

  await expect(shippingStepAddressForm.stateSelectorFormField.formField).toBeVisible();
  await expect(shippingStepAddressForm.stateInputFormField.formField).toBeHidden();
  await checkoutPage.shippingStep.continueToPaymentButton.click();

  await shippingStepAddressForm.expectCorrectValidation();
});

test('billing address form has correct validation', async ({ cartPage, checkoutPage, simpleProductPage, page }) => {
  await page.goto(simpleProductUrl);
  await simpleProductPage.waitPageToBeVisible();
  await simpleProductPage.addToCartAndVerifyResponse();

  await cartPage.goto();
  await checkoutPage.goto();

  await checkoutPage.personalDetailsStep.fillPersonalDetails();
  await checkoutPage.fillShippingAddress();

  await checkoutPage.billingStep.useShippingAddressCheckbox.click();
  await checkoutPage.billingStep.goToReviewButton.click();
  await checkoutPage.billingStep.addressForm.expectCorrectValidation();
});

test('order can be placed', async ({ page, printedSocksPage, simpleProductPage, cartPage, checkoutPage }) => {
  test.setTimeout(40_000);

  await page.goto(simpleProductUrl);
  await simpleProductPage.waitPageToBeVisible();
  await simpleProductPage.addToCartAndVerifyResponse();

  await printedSocksPage.goto();
  await printedSocksPage.addProductToCart();
  await cartPage.goto();

  await checkoutPage.goto();
  await checkoutPage.personalDetailsStep.fillPersonalDetails();
  await checkoutPage.fillShippingAddress();
  await checkoutPage.fillBillingAddress();
  await checkoutPage.selectPaymentMethodAndPlaceOrder();
});

test.skip('order can be placed and user account created', async ({ page, simpleProductPage, cartPage, checkoutPage }) => {
  test.setTimeout(60_000);

  await page.goto(simpleProductUrl);
  await simpleProductPage.waitPageToBeVisible();
  await simpleProductPage.addToCartAndVerifyResponse();

  await cartPage.goto();
  await checkoutPage.goto();

  const email = getRandomEmail();
  await checkoutPage.personalDetailsStep.fillPersonalDetails(undefined, undefined, email);

  await checkoutPage.fillShippingAddress();
  await checkoutPage.fillBillingAddress();
  await checkoutPage.selectPaymentMethodAndPlaceOrder(true);
  await expect(page.locator('._header .a-account-icon .sf-header__icon--is-active')).toBeVisible();
});

test('shipping step is hidden if cart contains only virtual gift card', async ({ giftCardProductPage, checkoutPage }) => {
  await giftCardProductPage.goto();
  await giftCardProductPage.fillFormData();
  await giftCardProductPage.addToCartButton.click();

  await checkoutPage.goto();

  await checkoutPage.personalDetailsStep.waitToBeVisible();
  await checkoutPage.expectStepToBeHidden(checkoutPage.stepsName.shipping);
});

test('shipping step is visible if cart contains virtual gift card and other product', async ({ giftCardProductPage, page, cartPage, checkoutPage, simpleProductPage }) => {
  await giftCardProductPage.goto();
  await giftCardProductPage.fillFormData();
  await giftCardProductPage.addToCartButton.click();

  await page.goto(simpleProductUrl);
  await simpleProductPage.waitPageToBeVisible();
  await simpleProductPage.addToCartAndVerifyResponse();

  await cartPage.goto();
  await checkoutPage.goto();
  await checkoutPage.expectStepToBeVisible(checkoutPage.stepsName.shipping);
});

// Currently "Send physical" option is disabled
test.skip('shipping step is visible if cart contains only gift card with "Send physical" option enabled', async ({ giftCardProductPage, checkoutPage }) => {
  await giftCardProductPage.goto();
  await giftCardProductPage.fillFormData(undefined, undefined, undefined, true);
  await giftCardProductPage.addToCartButton.click();

  await checkoutPage.goto();
  await checkoutPage.expectStepToBeVisible(checkoutPage.stepsName.shipping);
});

test('Gift Cards payment is not available if cart contains Gift Card', async ({ giftCardProductPage, checkoutPage }) => {
  await giftCardProductPage.goto();
  await giftCardProductPage.fillFormData();
  await giftCardProductPage.addToCartButton.click();

  await checkoutPage.goto();
  await checkoutPage.personalDetailsStep.fillPersonalDetails();
  await checkoutPage.fillBillingAddress(false);

  await checkoutPage.orderReviewStep.expectGiftCardPaymentToBeNotAvailable();
});

test('shipping address and shipping method are correct while placing order', async ({ cartPage, checkoutPage, printedSocksPage }) => {
  test.slow();

  await printedSocksPage.goto();
  await printedSocksPage.addProductToCart();

  await cartPage.goto();
  await checkoutPage.goto();
  await checkoutPage.personalDetailsStep.fillPersonalDetails(
    fedexAvailableAddress.firstName,
    fedexAvailableAddress.lastName
  );

  await checkoutPage.shippingStep.addressForm.fillAddress(
    fedexAvailableAddress.address,
    fedexAvailableAddress.country,
    '',
    fedexAvailableAddress.city,
    fedexAvailableAddress.zipCode,
    fedexAvailableAddress.phoneNumber
  );
  await expect(checkoutPage.shippingStep.continueToPaymentButton).toBeDisabled();
  await checkoutPage.shippingStep.expectShippingMethodToBeSelected(FEDEX_LABEL);
  await expect(checkoutPage.shippingStep.continueToPaymentButton).not.toBeDisabled();

  await checkoutPage.shippingStep.continueToPaymentButton.click();

  await checkoutPage.billingStep.fillAddress(
    false,
    billingAddress.address,
    billingAddress.country,
    billingAddress.state,
    billingAddress.city,
    billingAddress.zipCode,
    billingAddress.phoneNumber
  );
  await checkoutPage.billingStep.addressForm.firstNameFormField.fill(billingAddress.firstName);
  await checkoutPage.billingStep.addressForm.lastNameFormField.fill(billingAddress.lastName);
  await checkoutPage.billingStep.goToReviewButton.click();

  const placeOrderRequestPromise = checkoutPage.waitForPlaceOrderRequest();
  await checkoutPage.selectPaymentMethodAndPlaceOrder();

  const placeOrderRequest = await placeOrderRequestPromise;
  const postData = JSON.parse(placeOrderRequest.postData());
  const addressInformation = postData.addressInformation;

  expect(addressInformation.shipping_carrier_code).toEqual('fedex');
  const shippingAddress = addressInformation.shippingAddress;
  const payloadBillingAddress = addressInformation.billingAddress;

  checkoutPage.expectAddressInPlaceOrderPayloadToBeEqual(shippingAddress, fedexAvailableAddress);
  checkoutPage.expectAddressInPlaceOrderPayloadToBeEqual(payloadBillingAddress, billingAddress);
});

test('usps shipping method available and address data is correct while placing order', async ({ cartPage, checkoutPage, printedSocksPage }) => {
  test.setTimeout(40_000);

  await printedSocksPage.goto();
  await printedSocksPage.addProductToCart();

  await cartPage.goto();
  await checkoutPage.goto();
  await checkoutPage.personalDetailsStep.fillPersonalDetails(
    uspsAvailableAddress.firstName,
    uspsAvailableAddress.lastName
  );

  await checkoutPage.shippingStep.addressForm.fillAddress(
    uspsAvailableAddress.address,
    uspsAvailableAddress.country,
    uspsAvailableAddress.state,
    uspsAvailableAddress.city,
    uspsAvailableAddress.zipCode,
    uspsAvailableAddress.phoneNumber
  );

  await checkoutPage.shippingStep.expectShippingMethodToBeSelected(USPS_LABEL);
  await checkoutPage.shippingStep.continueToPaymentButton.click();

  await checkoutPage.billingStep.fillAddress(true);
  await checkoutPage.billingStep.goToReviewButton.click();

  const placeOrderRequestPromise = checkoutPage.waitForPlaceOrderRequest();
  await checkoutPage.selectPaymentMethodAndPlaceOrder();

  const placeOrderRequest = await placeOrderRequestPromise;
  const postData = JSON.parse(placeOrderRequest.postData());

  const addressInformation = postData.addressInformation;
  const shippingAddress = addressInformation.shippingAddress;
  const payloadBillingAddress = addressInformation.billingAddress;

  expect(addressInformation.shipping_carrier_code).toEqual('tablerate');

  checkoutPage.expectAddressInPlaceOrderPayloadToBeEqual(shippingAddress, uspsAvailableAddress);
  checkoutPage.expectAddressInPlaceOrderPayloadToBeEqual(payloadBillingAddress, uspsAvailableAddress);
});

test('continue button is disabled if no shipping methods available', async ({ cartPage, checkoutPage, printedSocksPage }) => {
  await printedSocksPage.goto();
  await printedSocksPage.addProductToCart();

  await cartPage.goto();
  await checkoutPage.goto();
  await checkoutPage.personalDetailsStep.fillPersonalDetails(
    uspsAvailableAddress.firstName,
    uspsAvailableAddress.lastName
  );

  await checkoutPage.shippingStep.addressForm.countrySelectorFormField.selectByOptionTitle(COUNTRY_WITHOUT_SHIPPING_METHODS);
  await checkoutPage.shippingStep.expectShippingMethodsCountToBe(0);
  await expect(checkoutPage.shippingStep.continueToPaymentButton).toBeDisabled();
});

test('billing address is correct after "use shipping address" option is selected', async ({ cartPage, checkoutPage, printedSocksPage }) => {
  test.slow();

  await printedSocksPage.goto();
  await printedSocksPage.addProductToCart();

  await cartPage.goto();
  await checkoutPage.goto();
  await checkoutPage.personalDetailsStep.fillPersonalDetails(
    fedexAvailableAddress.firstName,
    fedexAvailableAddress.lastName
  );

  await checkoutPage.shippingStep.addressForm.fillAddress(
    fedexAvailableAddress.address,
    fedexAvailableAddress.country,
    '',
    fedexAvailableAddress.city,
    fedexAvailableAddress.zipCode,
    fedexAvailableAddress.phoneNumber
  );
  await expect(checkoutPage.shippingStep.continueToPaymentButton).toBeDisabled();
  await checkoutPage.shippingStep.expectShippingMethodToBeSelected(FEDEX_LABEL);
  await expect(checkoutPage.shippingStep.continueToPaymentButton).not.toBeDisabled();

  await checkoutPage.shippingStep.continueToPaymentButton.click();

  await checkoutPage.billingStep.fillAddress(
    false,
    billingAddress.address,
    billingAddress.country,
    billingAddress.state,
    billingAddress.city,
    billingAddress.zipCode,
    billingAddress.phoneNumber
  );
  await checkoutPage.billingStep.addressForm.firstNameFormField.fill(billingAddress.firstName);
  await checkoutPage.billingStep.addressForm.lastNameFormField.fill(billingAddress.lastName);
  await checkoutPage.billingStep.goToReviewButton.click();

  await checkoutPage.waitStepToBeActive(checkoutPage.stepsName.orderReview);
  await checkoutPage.goToStepByName(checkoutPage.stepsName.billing);

  await checkoutPage.billingStep.useShippingAddress();
  await checkoutPage.billingStep.goToReviewButton.click();

  const placeOrderRequestPromise = checkoutPage.waitForPlaceOrderRequest();
  await checkoutPage.selectPaymentMethodAndPlaceOrder();

  const placeOrderRequest = await placeOrderRequestPromise;
  const postData = JSON.parse(placeOrderRequest.postData());

  const addressInformation = postData.addressInformation;
  const shippingAddress = addressInformation.shippingAddress;
  const payloadBillingAddress = addressInformation.billingAddress;

  expect(addressInformation.shipping_carrier_code).toEqual('fedex');

  checkoutPage.expectAddressInPlaceOrderPayloadToBeEqual(shippingAddress, fedexAvailableAddress);
  checkoutPage.expectAddressInPlaceOrderPayloadToBeEqual(payloadBillingAddress, fedexAvailableAddress);
});
