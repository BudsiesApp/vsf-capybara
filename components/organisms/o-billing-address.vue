<template>
  <div class="o-billing-address">
    <SfHeading
      :title="`${$t('Billing address')}`"
      :level="3"
      class="sf-heading--left sf-heading--no-underline title"
    />
    <validation-observer ref="validationObserver" slim tag="div">
      <div class="form" :disabled="isAddressFormDisabled">
        <SfCheckbox
          v-if="!isVirtualCart"
          v-model="sendToShippingAddress"
          class="form__element form__checkbox -always-enabled"
          name="sendToShippingAddress"
          :label="$t('Copy address data from shipping')"
        />
        <SfCheckbox
          v-if="hasBillingData()"
          v-model="sendToBillingAddress"
          class="form__element form__checkbox -always-enabled"
          name="sendToBillingAddress"
          :label="$t('Use my default billing data')"
        />

        <div
          class="_form-fields"
          v-show="showAddressFormFields"
        >
          <OBaseAddressForm
            ref="baseAddressForm"
            v-model="addressValue"
            :is-form-fields-disabled="isAddressFormDisabled"
            :get-field-anchor-name="getFieldAnchorName"
            @country-changed="onChangeCountry"
          />
        </div>
      </div>
    </validation-observer>

    <div class="form">
      <div class="form__action">
        <SfButton
          class="sf-button--full-width form__action-button"
          :disabled="isValidatingAddress"
          @click="onGoReviewButtonClicked"
        >
          {{ $t('Go review the order') }}
        </SfButton>
        <SfButton
          class="
            sf-button--full-width sf-button--text
            form__action-button form__action-button--secondary
          "
          @click="$bus.$emit('checkout-before-edit', isVirtualCart ? 'personalDetails' :'shipping')"
        >
          {{ isVirtualCart ? $t('Edit contact') : $t('Edit shipping') }}
        </SfButton>
      </div>
    </div>

    <template v-if="$additionalContent.privacyPolicyAdditionalLinks">
      <component :is="linkComponent.component" :key="linkComponent.key" v-for="linkComponent in $additionalContent.privacyPolicyAdditionalLinks" />
    </template>
    <!-- This dummy container below is needed because src\modules\payment-cash-on-delivery\index.ts
         tries to inject here a component with payment description -->
    <div v-show="false" id="checkout-order-review-additional-container" />
  </div>
</template>
<script>
import { defineComponent, ref, toRef } from '@vue/composition-api';
import { mapGetters } from 'vuex';
import { Payment } from '@vue-storefront/core/modules/checkout/components/Payment';
import {
  SfInput,
  SfButton,
  SfHeading,
  SfCheckbox
} from '@storefront-ui/vue';
import { ValidationObserver } from 'vee-validate';
import { createSmoothscroll } from 'theme/helpers';
import MMultiselect from 'theme/components/molecules/m-multiselect';
import { PERSISTED_CUSTOMER_FIRST_NAME, PERSISTED_CUSTOMER_LAST_NAME, PERSISTED_CUSTOMER_PHONE_NUMBER, SET_PERSISTED_CUSTOMER_FIRST_NAME, SET_PERSISTED_CUSTOMER_LAST_NAME, SET_PERSISTED_CUSTOMER_PHONE_NUMBER, SET_PERSISTED_CUSTOMER_BILLING_ADDRESS } from 'src/modules/persisted-customer-data';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'

import { mapCheckoutAddressToFormValue, mapFormValueToCheckoutAddress } from 'theme/helpers/checkout-address-mapper';
import { useFormValidation, getFieldAnchorName } from 'theme/helpers/use-form-validation';
import { useAddressValidation } from 'src/modules/address';
import OBaseAddressForm from './o-base-address-form.vue';

const States = require('@vue-storefront/i18n/resource/states.json');

export default defineComponent({
  name: 'OBillingAddress',
  components: {
    SfInput,
    SfButton,
    SfHeading,
    SfCheckbox,
    MMultiselect,
    OBaseAddressForm,
    ValidationObserver
  },
  mixins: [Payment],
  setup (_, context) {
    const validationObserver = ref(null);
    const baseAddressForm = ref(null);

    const { validateAddress, isValidating: isValidatingAddress } = useAddressValidation(context);

    const { validateAndGoToFirstError } = useFormValidation(
      validationObserver,
      () => {
        const baseAddressFormComponent = baseAddressForm.value;
        return {
          ...context.refs,
          ...(baseAddressFormComponent?.$refs || {})
        };
      }
    );

    return {
      validationObserver,
      baseAddressForm,
      validateAddress,
      isValidatingAddress,
      validateAndGoToFirstError,
      getFieldAnchorName
    };
  },
  data: () => {
    return {
      states: States
    };
  },
  computed: {
    addressValue: {
      get () {
        return mapCheckoutAddressToFormValue(this.payment);
      },
      set (value) {
        this.payment = mapFormValueToCheckoutAddress(value, this.payment);
      }
    },
    ...mapGetters({
      isVirtualCart: 'cart/isVirtualCart'
    }),
    isAddressFormDisabled () {
      return this.sendToShippingAddress || this.sendToBillingAddress;
    },
    cartItems () {
      return this.$store.getters['cart/getCartItems'];
    },
    showAddressFormFields () {
      return !this.sendToShippingAddress;
    },
    selectedRegionName () {
      if (!this.payment.region_id) {
        return '';
      }

      const hasStates = this.payment.country && States.hasOwnProperty(this.payment.country);

      if (!hasStates) {
        return '';
      }

      const statesList = States[this.payment.country];
      const state = statesList.find(
        ({ id }) => this.payment.region_id === id
      );

      return state ? state.name : '';
    }
  },
  mounted () {
    createSmoothscroll(
      document.documentElement.scrollTop || document.body.scrollTop,
      0
    );

    this.fillLastUsedCustomerData();
    EventBus.$on('user-after-loggedin', this.fillLastUsedCustomerData);
  },
  beforeDestroy () {
    EventBus.$off('user-after-loggedin', this.fillLastUsedCustomerData);
  },
  methods: {
    async onChangeCountry () {
      await this.$nextTick();

      this.payment.state = '';
      this.payment.region_id = null;

      await Promise.all([
        this.$store.dispatch('checkout/updatePaymentDetails', { country: this.payment.country }),
        this.$store.dispatch('cart/syncPaymentMethods', { forceServerSync: true })
      ]);
    },
    async onGoReviewButtonClicked () {
      const shouldValidate = !this.sendToShippingAddress && !this.sendToBillingAddress;

      if (shouldValidate) {
        const isFormValid = await this.validateAndGoToFirstError();

        if (!isFormValid) {
          return;
        }

        const paymentRef = toRef(this, 'payment');
        const shouldProceed = await this.validateAddress(paymentRef);

        if (!shouldProceed) {
          return;
        }
      }

      this.$store.commit(
        SET_PERSISTED_CUSTOMER_FIRST_NAME,
        this.payment.firstName
      );

      this.$store.commit(
        SET_PERSISTED_CUSTOMER_LAST_NAME,
        this.payment.lastName
      );

      this.$store.commit(
        SET_PERSISTED_CUSTOMER_PHONE_NUMBER,
        this.payment.phoneNumber
      );

      this.$store.commit(
        SET_PERSISTED_CUSTOMER_BILLING_ADDRESS,
        {
          firstName: this.payment.firstName,
          lastName: this.payment.lastName,
          phoneNumber: this.payment.phoneNumber,
          city: this.payment.city,
          state: this.selectedRegionName || this.payment.state,
          zipCode: this.payment.zipCode,
          country: this.payment.country
        }
      );

      this.sendDataToCheckout();
      this.$store.dispatch('cart/syncPaymentMethods', { forceServerSync: true });
    },
    fillLastUsedCustomerData () {
      const customerFirstName = this.$store
        .getters[PERSISTED_CUSTOMER_FIRST_NAME];
      const customerLastName = this.$store
        .getters[PERSISTED_CUSTOMER_LAST_NAME];
      const customerPhoneNumber = this.$store
        .getters[PERSISTED_CUSTOMER_PHONE_NUMBER];

      if (customerFirstName && !this.payment.firstName) {
        this.payment.firstName = customerFirstName;
      }

      if (customerLastName && !this.payment.lastName) {
        this.payment.lastName = customerLastName;
      }

      if (customerPhoneNumber && !this.payment.phoneNumber) {
        this.payment.phoneNumber = customerPhoneNumber;
      }
    }
  },
  watch: {
  }
});
</script>
<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.title {
  --heading-padding: var(--spacer-base) 0;
  @include for-desktop {
    --heading-padding: var(--spacer-xl) 0 var(--spacer-base) 0;
  }
}

.gift-card-payment {
  width: 100%;
}

.form {
  &__checkbox {
    --checkbox-label-color: var(--c-dark-variant);
    margin: 0 0 var(--spacer-sm) 0;
  }
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

  &[disabled] {
    .form__element {
      &:not(.-always-enabled) {
        pointer-events: none;
        opacity: 0.75;
      }
    }
  }

  &__element {
      margin: 0 0 var(--spacer-sm) 0;
  }

  @include for-desktop {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    column-gap: var(--spacer-xl);
    margin-right: var(--spacer-2xl);

    ._form-fields {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      column-gap: var(--spacer-xl);
    }

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
  }
}

.california-privacy-notice-link {
  --privacy-notice-link-display: inline;
}
</style>
