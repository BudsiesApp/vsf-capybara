<template>
  <validation-observer
    ref="validationObserver"
    tag="div"
    class="o-shipping"
  >
    <SfHeading
      ref="heading"
      :title="`${$t('Shipping address')}`"
      :level="3"
      class="sf-heading--left sf-heading--no-underline title"
      tabindex="-1"
    />
    <div class="form" :disabled="isAddressFormDisabled">
      <SfCheckbox
        v-if="currentUser && hasDefaultShippingAddress"
        v-model="shipToMyAddress"
        class="form__element form__checkbox -always-enabled"
        name="shipToMyAddress"
        :label="$t('Ship to my default address')"
      />
      <OBaseAddressForm
        ref="baseAddressForm"
        v-model="shipping"
        :is-form-fields-disabled="shipToMyAddress"
        :get-field-anchor-name="getFieldAnchorName"
        @country-changed="onChangeCountry"
        @zip-code-blur="onZipCodeBlur"
      />
    </div>
    <SfHeading
      id="shipping-method-heading"
      :title="$t('Shipping method')"
      :level="3"
      class="sf-heading--left sf-heading--no-underline title"
    />
    <div class="form">
      <div class="form__radio-group" role="group" aria-labelledby="shipping-method-heading">
        <SfRadio
          v-for="method in shippingMethods"
          :key="method.method_code"
          v-model="shipping.shippingMethod"
          :value="method.method_code"
          :disabled="isShippingMethodsSyncing"
          name="shipping-method"
          class="form__radio shipping"
          @input="changeShippingMethod()"
        >
          <template #label>
            <div class="sf-radio__label shipping__label">
              <div>{{ getCarrierTitle(method) }}</div>
              <div class="shipping__label-price">
                {{ formatPrice(method.amount) }}
              </div>
            </div>
          </template>

          <template #details v-if="getMethodTitle(method)">
            <p>{{ getMethodTitle(method) }}</p>
          </template>
        </SfRadio>
        <p class="shipping__note">
          {{ $t('Our service is not responsible for local tariffs or duties on international shipments') }}
        </p>
      </div>
      <div class="form__action">
        <SfButton
          ref="submitStepButton"
          class="sf-button--full-width form__action-button"
          :disabled="isContinueButtonDisabled"
          @click="saveDataToCheckout"
        >
          {{ $t('Continue to payment') }}
        </SfButton>
        <SfButton
          type="submit"
          class="sf-button--full-width sf-button--text form__action-button form__action-button--secondary"
          @click="emitCheckoutEdit('personalDetails')"
        >
          {{ $t('Edit contact') }}
        </SfButton>
      </div>

      <template v-if="privacyPolicyLinks.length">
        <component
          :is="linkComponent.component"
          :key="linkComponent.key"
          v-for="linkComponent in privacyPolicyLinks"
        />
      </template>
    </div>
  </validation-observer>
</template>
<script>
import { toRef, defineComponent, ref } from 'vue';
import {
  SfInput,
  SfRadio,
  SfButton,
  SfHeading,
  SfCheckbox
} from '@storefront-ui/vue';
import { ValidationObserver } from 'vee-validate';

import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'
import { IS_SHIPPING_METHODS_SYNCING } from '@vue-storefront/core/modules/cart';
import { Shipping } from '@vue-storefront/core/modules/checkout/components/Shipping';
import {
  AdditionalContentOutlet,
  useAdditionalContent
} from '@vue-storefront/core/additional-content';

import { createSmoothscroll } from 'theme/helpers';
import MMultiselect from 'theme/components/molecules/m-multiselect';
import { GET_ACTIVE_CURRENCY, GET_CURRENCY_EXCHANGE_RATE } from 'src/modules/currency';
import { PERSISTED_CUSTOMER_FIRST_NAME, PERSISTED_CUSTOMER_LAST_NAME, PERSISTED_CUSTOMER_PHONE_NUMBER, PERSISTED_CUSTOMER_SHIPPING_COUNTRY, PERSISTED_CUSTOMER_VAT_ID, SET_PERSISTED_CUSTOMER_FIRST_NAME, SET_PERSISTED_CUSTOMER_LAST_NAME, SET_PERSISTED_CUSTOMER_PHONE_NUMBER, SET_PERSISTED_CUSTOMER_SHIPPING_COUNTRY, SET_PERSISTED_CUSTOMER_VAT_ID } from 'src/modules/persisted-customer-data';
import { PriceHelper } from 'src/modules/shared';
import { useAddressValidation } from 'src/modules/address';
import { useFormValidation, getFieldAnchorName } from 'theme/helpers/use-form-validation';
import OBaseAddressForm from './o-base-address-form.vue';

const States = require('@vue-storefront/i18n/resource/states.json');

export default defineComponent({
  name: 'OShipping',
  components: {
    SfInput,
    SfRadio,
    SfButton,
    SfHeading,
    SfCheckbox,
    MMultiselect,
    OBaseAddressForm,
    ValidationObserver
  },
  setup (_, context) {
    const validationObserver = ref(null);
    const baseAddressForm = ref(null);

    const { validateAddress, isValidating: isValidatingAddress, completeValidation: completeAddressValidation } = useAddressValidation();

    const { validateAndGoToFirstError } = useFormValidation(
      validationObserver,
      () => baseAddressForm.value?.getFormValidationRefs() || {}
    );

    return {
      privacyPolicyLinks: useAdditionalContent(
        AdditionalContentOutlet.PRIVACY_POLICY_LINKS
      ),
      validateAddress,
      isValidatingAddress,
      completeAddressValidation,
      validateAndGoToFirstError,
      getFieldAnchorName,
      validationObserver,
      baseAddressForm
    };
  },
  mixins: [Shipping],
  data: () => {
    return {
      states: States
    };
  },
  computed: {
    isShippingMethodsSyncing () {
      return this.$store.getters[IS_SHIPPING_METHODS_SYNCING];
    },
    isContinueButtonDisabled () {
      return !this.shippingMethods.length || this.isShippingMethodsSyncing || this.isValidatingAddress;
    },
    isAddressFormDisabled () {
      return this.shipToMyAddress;
    },
    selectedCurrency () {
      return this.$store.getters[GET_ACTIVE_CURRENCY];
    },
    currencyExchangeRate () {
      return this.$store.getters[GET_CURRENCY_EXCHANGE_RATE];
    }
  },
  methods: {
    emitCheckoutEdit (section) {
      EventBus.$emit('checkout-before-edit', section);
    },
    focusSubmitStepButton () {
      const submitStepButton = this.$refs.submitStepButton;

      if (!submitStepButton) {
        return;
      }

      const submitStepButtonElement = submitStepButton.$el;

      submitStepButtonElement?.focus();
    },
    getCarrierTitle (method) {
      // It's the only way to separate M1 from M2
      if (method.hasOwnProperty('method_name')) {
        return method.method_title;
      }

      return method.carrier_title;
    },
    getMethodTitle (method) {
      if (method.hasOwnProperty('method_name')) {
        return method.method_name;
      }

      return method.method_title;
    },
    async onChangeCountry () {
      this.changeCountry();
    },
    onZipCodeBlur () {
      EventBus.$emit('checkout-before-shippingMethods', this.shipping.country)
    },
    async saveDataToCheckout () {
      const isFormValid = await this.validateAndGoToFirstError();

      if (!isFormValid) {
        return;
      }

      const shippingRef = toRef(this, 'shipping');
      const shouldProceed = await this.validateAddress(shippingRef);

      if (!shouldProceed) {
        this.focusSubmitStepButton();
        return;
      }

      this.completeAddressValidation();

      this.$store.commit(
        SET_PERSISTED_CUSTOMER_FIRST_NAME,
        this.shipping.firstName
      );

      this.$store.commit(
        SET_PERSISTED_CUSTOMER_LAST_NAME,
        this.shipping.lastName
      );

      this.$store.commit(
        SET_PERSISTED_CUSTOMER_PHONE_NUMBER,
        this.shipping.phoneNumber
      );

      this.$store.commit(
        SET_PERSISTED_CUSTOMER_SHIPPING_COUNTRY,
        this.shipping.country
      );

      this.$store.commit(
        SET_PERSISTED_CUSTOMER_VAT_ID,
        this.shipping.vat_id
      );

      this.sendDataToCheckout();
      await this.$store.dispatch('cart/syncTotals', { forceServerSync: true });
      this.$store.dispatch('cart/pullEstimatedShipments');
    },
    fillLastUsedCustomerData () {
      const customerFirstName = this.$store
        .getters[PERSISTED_CUSTOMER_FIRST_NAME];
      const customerLastName = this.$store
        .getters[PERSISTED_CUSTOMER_LAST_NAME];
      const customerPhoneNumber = this.$store
        .getters[PERSISTED_CUSTOMER_PHONE_NUMBER];
      const customerShippingCountry = this.$store
        .getters[PERSISTED_CUSTOMER_SHIPPING_COUNTRY];
      const customerVatId = this.$store
        .getters[PERSISTED_CUSTOMER_VAT_ID];

      if (customerFirstName && !this.shipping.firstName) {
        this.shipping.firstName = customerFirstName;
      }

      if (customerLastName && !this.shipping.lastName) {
        this.shipping.lastName = customerLastName;
      }

      if (customerPhoneNumber && !this.shipping.phoneNumber) {
        this.shipping.phoneNumber = customerPhoneNumber;
      }

      if (customerVatId && !this.shipping.vat_id) {
        this.shipping.vat_id = customerVatId;
      }

      if (customerShippingCountry) {
        this.shipping.country = customerShippingCountry;
      }
    },
    formatPrice (price) {
      price = price * this.currencyExchangeRate;

      return PriceHelper.formatPrice(price, this.selectedCurrency.symbol);
    }
  },
  mounted () {
    createSmoothscroll(document.documentElement.scrollTop || document.body.scrollTop, 0);

    this.$refs.heading.$el.focus();
    this.fillLastUsedCustomerData();
    EventBus.$on('user-after-loggedin', this.fillLastUsedCustomerData);
  },
  beforeDestroy () {
    EventBus.$off('user-after-loggedin', this.fillLastUsedCustomerData);
  }
});
</script>
<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.title {
  --heading-padding: var(--spacer-base) 0;

  @include for-desktop {
    --heading-padding: var(--spacer-xl) 0 var(--spacer-base) 0;
    &:last-of-type {
      --heading-padding: var(--spacer-xs) 0 var(--spacer-base) 0;
    }
  }
}
.form {
  &__group {
    display: flex;
    align-items: center;
  }
  &__action {
    margin: var(--spacer-base) 0;
    &-button {
      &:first-child {
        --button-height: 4.0625rem;
      }
      &--secondary {
        margin: var(--spacer-base) 0;
      }
    }
  }
  &__button {
    --button-width: 100%;
  }
  &__radio-group {
    flex: 0 0 100%;
  }
  &__element {
      margin: 0 0 var(--spacer-sm) 0;
  }

  &[disabled] {
    .form__element {
      &:not(.-always-enabled) {
        pointer-events: none;
        opacity: 0.75;
      }
    }
  }

  @include for-desktop {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    column-gap: var(--spacer-xl);
    margin: 0 var(--spacer-2xl) 0 0;

    &__element {
      flex: 0 0 100%;
      &--half {
        flex: 1 1 40%;
      }
    }
    &__action {
      flex: 0 0 100%;
      display: flex;
    }
    &__button {
      --button-width: auto;
    }
    &__radio-group {
      margin: 0;
    }
  }
}
.shipping {
  --radio-container-padding: var(--spacer-sm);
  &__note {
    font-size: var(--font-sm);
    color: var(--c-dark-variant);
  }
  &__label {
    display: flex;
    justify-content: flex-start;
    align-items: flex-end;
    &-price {
      font-size: var(--font-lg);
      @include for-mobile {
        order: -1;
        margin: 0 var(--spacer-xs) 0 0;
      }
    }
  }
  &__description {
    --radio-description-margin: 0;
  }
  &__delivery {
    color: var(--c-text-muted);
    display: flex;
  }
  &__action {
    @include for-mobile {
      margin: 0 0 0 var(--spacer-xs);
    }
    &::before {
      content: "+";
    }
    &--is-active {
      --button-color: var(--c-primary);
      --button-transition: color 150ms linear;
      &::before {
        content: "-";
      }
    }
  }
  @include for-desktop {
    &__label {
      justify-content: space-between;
    }
    &__delivery {
      justify-content: space-between;
      max-width: 240px;
    }
  }
}

.california-privacy-notice-link {
  --privacy-notice-link-display: inline;
}
</style>
