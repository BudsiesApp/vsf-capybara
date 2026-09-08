<template>
  <div class="express-checkout" v-if="braintreeClient">
    <div class="_buttons">
      <component
        v-for="btn in sorted"
        class="_button"
        :is="btn.is"
        :key="btn.key"
        :braintree-client="braintreeClient"
        :show-content="true"
        :on-express-checkout-authorized="onExpressCheckoutAuthorized"
        :on-shipping-details-changed="onShippingDetailsChanged"
        :type="PaymentType.EXPRESS_CHECKOUT"
        @payment-started="onPaymentStarted"
        @success="onPaymentSuccess"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { useI18n, useRouter, useStore } from '@vue-storefront/core/application-services';
import {
  computed,
  defineComponent,
  inject,
  ref,
  onBeforeMount,
  onBeforeUnmount
} from 'vue';
import { Client } from 'braintree-web';
import Bowser from 'bowser';
import { parsePhoneNumberWithError } from 'libphonenumber-js';

import { currentStoreView } from '@vue-storefront/core/lib/multistore';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { registerModule } from '@vue-storefront/core/lib/modules';
import { OrderModule } from '@vue-storefront/core/modules/order';
import { CHECKOUT_UPDATE_SHIPPING_DETAILS_MUTATION, CHECKOUT_UPDATE_PAYMENT_DETAILS_MUTATION, useOrderCreation, CHECKOUT_UPDATE_SUCCESS_ORDER_DATA_MUTATION } from '@vue-storefront/core/modules/checkout';
import isAddressesEquals from '@vue-storefront/core/modules/checkout/helpers/is-addresses-equals.function';
import { Logger } from '@vue-storefront/core/lib/logger';

import {
  PaymentAmazonPay,
  SupportedMethodCodes as AmazonPaySupportedMethodCodes,
  CLEAR_AMAZON_SESSION_ID_MUTATION,
  AMAZON_SESSION_ID_GETTER
} from 'src/modules/vsf-amazon-pay';
import {
  supportedMethodsCodes as BraintreeSupportedMethodCodes,
  PaymentApplePay,
  PaymentGooglePay,
  PaymentPayPal,
  SET_PAYMENT_METHOD_NONCE_MUTATION
} from 'src/modules/payment-braintree';
import {
  CartEvents,
  createPhoneHelpers,
  PAYMENT_ERROR_EVENT,
  PaymentType,
  ExpressCheckoutData,
  useExpressCheckoutTotals
} from 'src/modules/shared';
import { useAddressValidation } from 'src/modules/address';
import { resolveExpressCheckoutCustomerData } from 'theme/helpers/express-checkout-customer-data';

type AllSupportedMethodsCodes = BraintreeSupportedMethodCodes | AmazonPaySupportedMethodCodes;

interface ExpressCheckoutMethod {
  is: string,
  key: AllSupportedMethodsCodes
};

const phoneHelpers = createPhoneHelpers(parsePhoneNumberWithError);

type ExpressCheckoutAuthorizedCallbackData = ExpressCheckoutData.ExpressCheckoutAuthorizedCallbackData<AllSupportedMethodsCodes>;
type ExpressCheckoutUpdateData = ExpressCheckoutData.ExpressCheckoutUpdateData;
type ShippingDetailsChangedCallbackData = ExpressCheckoutData.ShippingDetailsChangedCallbackData;

export default defineComponent({
  name: 'ExpressCheckoutButtons',
  components: {
    PaymentApplePay,
    PaymentPayPal,
    PaymentGooglePay,
    PaymentAmazonPay
  },
  setup (_, context) {
    const applicationStore = useStore();
    const applicationRouter = useRouter();
    const applicationI18n = useI18n();
    const windowObj = inject<Window & typeof window>('WindowObject');
    const isPlacing = ref(false);

    let activeShippingDetailsChangedPromise: undefined | Promise<ExpressCheckoutUpdateData>;
    let nextShippingDetailsChangedData: undefined | ShippingDetailsChangedCallbackData;

    const availableExpressCheckoutMethods = computed<Record<string, ExpressCheckoutMethod>>(() => {
      const availablePaymentMethods = applicationStore.getters['checkout/getPaymentMethods'];
      const availableExpressCheckoutMethods: Record<string, ExpressCheckoutMethod> = {};

      for (const method of availablePaymentMethods) {
        switch (method.code) {
          case BraintreeSupportedMethodCodes.GOOGLE_PAY:
            availableExpressCheckoutMethods['google'] = {
              is: 'PaymentGooglePay',
              key: BraintreeSupportedMethodCodes.GOOGLE_PAY
            };
            break;
          case BraintreeSupportedMethodCodes.APPLE_PAY:
            availableExpressCheckoutMethods['apple'] = {
              is: 'PaymentApplePay',
              key: BraintreeSupportedMethodCodes.APPLE_PAY
            };
            break;
          case BraintreeSupportedMethodCodes.PAY_PAL:
            availableExpressCheckoutMethods['paypal'] = {
              is: 'PaymentPayPal',
              key: BraintreeSupportedMethodCodes.PAY_PAL
            };
            break;
          case AmazonPaySupportedMethodCodes.AMAZON_PAY:
            availableExpressCheckoutMethods['amazon'] = {
              is: 'PaymentAmazonPay',
              key: AmazonPaySupportedMethodCodes.AMAZON_PAY
            };
            break;
          default:
            continue;
        }
      }

      return availableExpressCheckoutMethods;
    });

    const sorted = computed(() => {
      const browser = Bowser.getParser(windowObj?.navigator.userAgent || '');
      const os = browser.getOS();

      let order: ('apple' | 'paypal' | 'google' | 'amazon')[] = [];

      switch (os.name) {
        case Bowser.OS_MAP.MacOS:
        case Bowser.OS_MAP.iOS:
          order = ['apple', 'paypal', 'google', 'amazon'];
          break;
        case Bowser.OS_MAP.Android:
          order = ['google', 'paypal', 'apple', 'amazon'];
          break;
        default:
          order = ['paypal', 'google', 'apple', 'amazon'];
      }

      const sortedPaymentMethods = [];
      const _availableExpressCheckoutMethods = availableExpressCheckoutMethods.value;

      for (const item of order) {
        const paymentMethod = _availableExpressCheckoutMethods[item];

        if (!paymentMethod) {
          continue;
        }

        sortedPaymentMethods.push(paymentMethod);
      }

      return sortedPaymentMethods;
    });

    const braintreeClient = computed<Client>(() => applicationStore.getters['braintree/braintreeClient']);

    function onOrderAfterPlaced (payload: any) {
      applicationStore.commit(CHECKOUT_UPDATE_SUCCESS_ORDER_DATA_MUTATION, payload);
      applicationRouter.push({ name: 'checkout', params: { success: 'success' } });
    }

    function onPaymentErrorEventHandler () {
      applicationStore.dispatch('notification/spawnNotification', {
        type: 'danger',
        message: applicationI18n.t('Something went wrong. Please try another payment method'),
        action1: { label: applicationI18n.t('OK') }
      });
    }

    onBeforeMount(async () => {
      EventBus.$on(PAYMENT_ERROR_EVENT, onPaymentErrorEventHandler);
      EventBus.$on('order-after-placed', onOrderAfterPlaced);
      await applicationStore.dispatch('braintree/createBraintreeClient');
    });

    onBeforeUnmount(() => {
      EventBus.$off(PAYMENT_ERROR_EVENT, onPaymentErrorEventHandler);
      EventBus.$off('order-after-placed', onOrderAfterPlaced);
    });

    const { expressCheckoutTotals } = useExpressCheckoutTotals();

    const { validateAddress, completeValidation } = useAddressValidation({
      interactiveVerdicts: ['CONFIRM', 'CONFIRM_ADD_SUBPREMISES']
    });

    const shippingMethods = computed<ExpressCheckoutUpdateData['availableShippingMethods']>(() => {
      return applicationStore.getters['checkout/getShippingMethods'];
    });

    const authenticatedCustomerEmail = computed<string | undefined>(() => {
      if (!applicationStore.getters['user/isLoggedIn']) {
        return undefined;
      }

      return applicationStore.state.user.current?.email;
    });

    async function updateCustomerData (data: ExpressCheckoutAuthorizedCallbackData['customer']): Promise<void> {
      if (!data) {
        return;
      }

      const customerData = resolveExpressCheckoutCustomerData(data, authenticatedCustomerEmail.value);

      await applicationStore.dispatch('checkout/savePersonalDetails', customerData);

      if (customerData.firstName && customerData.lastName && customerData.emailAddress) {
        await applicationStore.dispatch('budsies/updatePersonalDetails', customerData);
      }
    }

    async function updateShippingDetails (data: ShippingDetailsChangedCallbackData): Promise<ExpressCheckoutUpdateData> {
      if (data.shippingAddress) {
        applicationStore.commit(CHECKOUT_UPDATE_SHIPPING_DETAILS_MUTATION, data.shippingAddress);
      }

      if (data.paymentAddress) {
        applicationStore.commit(CHECKOUT_UPDATE_PAYMENT_DETAILS_MUTATION, data.paymentAddress);
      }

      await applicationStore.dispatch('cart/syncShippingMethods', { forceServerSync: true });

      let selectedShippingMethod = shippingMethods.value.find((method) => method.method_code === data.shippingMethod) || shippingMethods.value[0];

      if (selectedShippingMethod) {
        applicationStore.commit(
          CHECKOUT_UPDATE_SHIPPING_DETAILS_MUTATION,
          {
            shippingCarrier: selectedShippingMethod.carrier_code,
            shippingMethod: selectedShippingMethod.method_code
          }
        );

        await applicationStore.dispatch('cart/fetchTotals');
      }

      if (nextShippingDetailsChangedData) {
        activeShippingDetailsChangedPromise = updateShippingDetails(nextShippingDetailsChangedData);
        nextShippingDetailsChangedData = undefined;

        return activeShippingDetailsChangedPromise;
      }

      activeShippingDetailsChangedPromise = undefined;

      if (!selectedShippingMethod) {
        return {
          total: expressCheckoutTotals.value,
          availableShippingMethods: shippingMethods.value,
          selectedShippingMethod: ''
        }
      }

      return {
        total: expressCheckoutTotals.value,
        availableShippingMethods: shippingMethods.value,
        selectedShippingMethod: selectedShippingMethod.method_code || ''
      }
    }

    async function onShippingDetailsChanged (data: ShippingDetailsChangedCallbackData): Promise<ExpressCheckoutUpdateData> {
      if (activeShippingDetailsChangedPromise) {
        nextShippingDetailsChangedData = data;
        return activeShippingDetailsChangedPromise;
      }

      activeShippingDetailsChangedPromise = updateShippingDetails(data);
      return activeShippingDetailsChangedPromise;
    }

    const { prepareOrderData } = useOrderCreation();

    const onExpressCheckoutAuthorized = async (data: ExpressCheckoutAuthorizedCallbackData): Promise<void> => {
      EventBus.$emit('notification-progress-start', applicationI18n.t('Processing order...'))
      await updateCustomerData(data.customer);

      const { i18n } = currentStoreView();
      const defaultCountry = i18n.defaultCountry;

      if (data.shippingDetails.phoneNumber) {
        const checkoutShippingDetails = applicationStore.getters['checkout/getShippingDetails'];
        const country = checkoutShippingDetails.country || defaultCountry;

        data.shippingDetails.phoneNumber = phoneHelpers.formatPhoneNumberToE164(
          data.shippingDetails.phoneNumber,
          country
        ) || undefined;
      }

      if (data.paymentDetails.phoneNumber) {
        const checkoutPaymentDetails = applicationStore.getters['checkout/getPaymentDetails'];
        const country = checkoutPaymentDetails.country || defaultCountry;

        data.paymentDetails.phoneNumber = phoneHelpers.formatPhoneNumberToE164(
          data.paymentDetails.phoneNumber,
          country
        ) || undefined;
      }

      applicationStore.commit(CHECKOUT_UPDATE_SHIPPING_DETAILS_MUTATION, data.shippingDetails);
      applicationStore.commit(CHECKOUT_UPDATE_PAYMENT_DETAILS_MUTATION, data.paymentDetails);
      applicationStore.commit(
        CHECKOUT_UPDATE_PAYMENT_DETAILS_MUTATION,
        { paymentMethod: data.paymentMethod }
      );

      try {
        const shippingAddress = applicationStore.getters['checkout/getShippingDetails'];
        const paymentAddress = applicationStore.getters['checkout/getPaymentDetails'];
        const addressesAreEqual = isAddressesEquals(shippingAddress, paymentAddress);

        const shippingComputed = computed({
          get: () => applicationStore.getters['checkout/getShippingDetails'],
          set: (value) => applicationStore.commit(CHECKOUT_UPDATE_SHIPPING_DETAILS_MUTATION, value)
        });

        const shouldProceedShipping = await validateAddress(shippingComputed);

        if (!shouldProceedShipping) {
          Logger.warn('Express checkout: User cancelled address validation, proceeding with original address', 'express-checkout-validation')();
        }

        if (addressesAreEqual) {
          applicationStore.commit(CHECKOUT_UPDATE_PAYMENT_DETAILS_MUTATION, shippingComputed.value);
        } else {
          const paymentComputed = computed({
            get: () => applicationStore.getters['checkout/getPaymentDetails'],
            set: (value) => applicationStore.commit(CHECKOUT_UPDATE_PAYMENT_DETAILS_MUTATION, value)
          });

          const shouldProceedPayment = await validateAddress(paymentComputed);

          if (!shouldProceedPayment) {
            Logger.warn('Express checkout: User cancelled billing address validation, proceeding with original address', 'express-checkout-validation')();
          }
        }

        completeValidation();
      } catch (error) {
        Logger.error('Express checkout: Address validation error - ' + error, 'express-checkout-validation')();
        completeValidation();
      }
    };

    const onPaymentStarted = (): void => {
      EventBus.$emit(CartEvents.BEGIN_CHECKOUT, true);
    };

    const onPaymentSuccess = async (): Promise<void> => {
      if (isPlacing.value) return;
      isPlacing.value = true;

      try {
        registerModule(OrderModule);

        const paymentMethod = applicationStore.getters['checkout/getPaymentDetails'].paymentMethod;
        const isAmazonPay = paymentMethod === AmazonPaySupportedMethodCodes.AMAZON_PAY;

        const additionalData: Record<string, any> = {};

        if (isAmazonPay) {
          const amazonSessionId = applicationStore.getters[AMAZON_SESSION_ID_GETTER];
          applicationStore.commit(CLEAR_AMAZON_SESSION_ID_MUTATION);
          additionalData.amazon_session_id = amazonSessionId;
        } else {
          const paymentMethodNonce = applicationStore.getters['braintree/paymentMethodNonce'];
          applicationStore.commit(SET_PAYMENT_METHOD_NONCE_MUTATION, undefined);
          additionalData.payment_method_nonce = paymentMethodNonce;
        }

        await applicationStore.dispatch(
          'checkout/placeOrder',
          { order: prepareOrderData(additionalData) }
        );
      } finally {
        isPlacing.value = false;
      }
    };

    return {
      braintreeClient,
      onShippingDetailsChanged,
      onExpressCheckoutAuthorized,
      onPaymentStarted,
      onPaymentSuccess,
      sorted,
      PaymentType
    };
  }
});
</script>

<style lang="scss" scoped>
.express-checkout {
  ._buttons {
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 0;

    ._button {
      margin-top: var(--spacer-sm);

      &:first-child {
        margin-top: 0;
      }
    }
  }
}
</style>
