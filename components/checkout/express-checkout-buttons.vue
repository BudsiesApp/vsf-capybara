<template>
  <div class="express-checkout" v-if="braintreeClient">
    <div class="_buttons">
      <component
        v-for="btn in sorted"
        class="_button"
        :is="btn.is"
        :key="btn.key"
        v-bind="btn.props"
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
import {
  computed,
  defineComponent,
  inject,
  ref,
  onBeforeMount,
  onBeforeUnmount
} from '@vue/composition-api';
import { Client } from 'braintree-web';
import Bowser from 'bowser';
import { parsePhoneNumberWithError } from 'libphonenumber-js';

import { currentStoreView } from '@vue-storefront/core/lib/multistore';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { registerModule } from '@vue-storefront/core/lib/modules';
import { OrderModule } from '@vue-storefront/core/modules/order';
import { CHECKOUT_UPDATE_SHIPPING_DETAILS_MUTATION, CHECKOUT_UPDATE_PAYMENT_DETAILS_MUTATION, useOrderCreation, CHECKOUT_UPDATE_SUCCESS_ORDER_DATA_MUTATION } from '@vue-storefront/core/modules/checkout';

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
  PaymentMethodCodePayPal,
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

type AllSupportedMethodsCodes = BraintreeSupportedMethodCodes | AmazonPaySupportedMethodCodes;

interface ExpressCheckoutMethod {
  is: string,
  key: AllSupportedMethodsCodes,
  props?: { [key: string]: any }
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
    const root = context.root;
    const windowObj = inject<Window & typeof window>('WindowObject');
    const isPlacing = ref(false);

    let activeShippingDetailsChangedPromise: undefined | Promise<ExpressCheckoutUpdateData>;
    let nextShippingDetailsChangedData: undefined | ShippingDetailsChangedCallbackData;

    const availableExpressCheckoutMethods = computed<Record<string, ExpressCheckoutMethod>>(() => {
      const availablePaymentMethods = root.$store.getters['checkout/getPaymentMethods'];
      const availableExpressCheckoutMethods: Record<string, ExpressCheckoutMethod> = {};
      const payPalPaymentMethods: PaymentMethodCodePayPal[] = [];

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
          case BraintreeSupportedMethodCodes.VENMO:
            payPalPaymentMethods.push(method.code);
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

      if (payPalPaymentMethods.length > 0) {
        availableExpressCheckoutMethods['paypal'] = {
          is: 'PaymentPayPal',
          key: BraintreeSupportedMethodCodes.PAY_PAL,
          props: {
            paymentMethods: payPalPaymentMethods
          }
        };
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

    const braintreeClient = computed<Client>(() => root.$store.getters['braintree/braintreeClient']);

    function onOrderAfterPlaced (payload: any) {
      root.$store.commit(CHECKOUT_UPDATE_SUCCESS_ORDER_DATA_MUTATION, payload);
      root.$router.push({ name: 'checkout', params: { success: 'success' } });
    }

    function onPaymentErrorEventHandler () {
      root.$store.dispatch('notification/spawnNotification', {
        type: 'danger',
        message: root.$t('Something went wrong. Please try another payment method'),
        action1: { label: root.$t('OK') }
      });
    }

    onBeforeMount(async () => {
      EventBus.$on(PAYMENT_ERROR_EVENT, onPaymentErrorEventHandler);
      EventBus.$on('order-after-placed', onOrderAfterPlaced);
      await root.$store.dispatch('braintree/createBraintreeClient');
    });

    onBeforeUnmount(() => {
      EventBus.$off(PAYMENT_ERROR_EVENT, onPaymentErrorEventHandler);
      EventBus.$off('order-after-placed', onOrderAfterPlaced);
    });

    const { expressCheckoutTotals } = useExpressCheckoutTotals(context);

    const shippingMethods = computed<ExpressCheckoutUpdateData['availableShippingMethods']>(() => {
      return root.$store.getters['checkout/getShippingMethods'];
    });

    async function updateCustomerData (data: ExpressCheckoutAuthorizedCallbackData['customer']): Promise<void> {
      if (!data) {
        return;
      }

      await root.$store.dispatch('checkout/savePersonalDetails', data);

      if (data.firstName && data.lastName && data.emailAddress) {
        await root.$store.dispatch('budsies/updatePersonalDetails', data);
      }
    }

    async function updateShippingDetails (data: ShippingDetailsChangedCallbackData): Promise<ExpressCheckoutUpdateData> {
      if (data.shippingAddress) {
        root.$store.commit(CHECKOUT_UPDATE_SHIPPING_DETAILS_MUTATION, data.shippingAddress);
      }

      if (data.paymentAddress) {
        root.$store.commit(CHECKOUT_UPDATE_PAYMENT_DETAILS_MUTATION, data.paymentAddress);
      }

      await root.$store.dispatch('cart/syncShippingMethods', { forceServerSync: true });

      let selectedShippingMethod = shippingMethods.value.find((method) => method.method_code === data.shippingMethod) || shippingMethods.value[0];

      if (selectedShippingMethod) {
        root.$store.commit(
          CHECKOUT_UPDATE_SHIPPING_DETAILS_MUTATION,
          {
            shippingCarrier: selectedShippingMethod.carrier_code,
            shippingMethod: selectedShippingMethod.method_code
          }
        );

        await root.$store.dispatch('cart/fetchTotals');
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

    const { prepareOrderData } = useOrderCreation(context);

    const onExpressCheckoutAuthorized = async (data: ExpressCheckoutAuthorizedCallbackData): Promise<void> => {
      EventBus.$emit('notification-progress-start', root.$t('Processing order...'))
      await updateCustomerData(data.customer);

      const { i18n } = currentStoreView();
      const defaultCountry = i18n.defaultCountry;

      if (data.shippingDetails.phoneNumber) {
        const checkoutShippingDetails = root.$store.getters['checkout/getShippingDetails'];
        const country = checkoutShippingDetails.country || defaultCountry;

        data.shippingDetails.phoneNumber = phoneHelpers.formatPhoneNumberToE164(
          data.shippingDetails.phoneNumber,
          country
        ) || undefined;
      }

      if (data.paymentDetails.phoneNumber) {
        const checkoutPaymentDetails = root.$store.getters['checkout/getPaymentDetails'];
        const country = checkoutPaymentDetails.country || defaultCountry;

        data.paymentDetails.phoneNumber = phoneHelpers.formatPhoneNumberToE164(
          data.paymentDetails.phoneNumber,
          country
        ) || undefined;
      }

      root.$store.commit(CHECKOUT_UPDATE_SHIPPING_DETAILS_MUTATION, data.shippingDetails);
      root.$store.commit(CHECKOUT_UPDATE_PAYMENT_DETAILS_MUTATION, data.paymentDetails);
      root.$store.commit(
        CHECKOUT_UPDATE_PAYMENT_DETAILS_MUTATION,
        { paymentMethod: data.paymentMethod }
      );
    };

    const onPaymentStarted = (): void => {
      EventBus.$emit(CartEvents.BEGIN_CHECKOUT, true);
    };

    const onPaymentSuccess = async (): Promise<void> => {
      if (isPlacing.value) return;
      isPlacing.value = true;

      try {
        registerModule(OrderModule);

        const paymentMethod = root.$store.getters['checkout/getPaymentDetails'].paymentMethod;
        const isAmazonPay = paymentMethod === AmazonPaySupportedMethodCodes.AMAZON_PAY;

        const additionalData: Record<string, any> = {};

        if (isAmazonPay) {
          const amazonSessionId = root.$store.getters[AMAZON_SESSION_ID_GETTER];
          root.$store.commit(CLEAR_AMAZON_SESSION_ID_MUTATION);
          additionalData.amazon_session_id = amazonSessionId;
        } else {
          const paymentMethodNonce = root.$store.getters['braintree/paymentMethodNonce'];
          root.$store.commit(SET_PAYMENT_METHOD_NONCE_MUTATION, undefined);
          additionalData.payment_method_nonce = paymentMethodNonce;
        }

        await root.$store.dispatch(
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

    ._button {
      margin-top: var(--spacer-sm);

      &:first-child {
        margin-top: 0;
      }
    }
  }
}
</style>
