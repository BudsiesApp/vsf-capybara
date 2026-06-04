<template>
  <validation-observer
    class="o-billing-address"
    ref="validationObserver"
    tag="div"
  >
    <SfHeading
      ref="heading"
      :title="`${$t('Billing address')}`"
      :level="3"
      class="sf-heading--left sf-heading--no-underline title"
      role="heading"
      tabindex="-1"
    />
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
          v-model="payment"
          :is-form-fields-disabled="isAddressFormDisabled"
          :get-field-anchor-name="getFieldAnchorName"
          @country-changed="onChangeCountry"
        />
      </div>
    </div>

    <div class="form">
      <div class="form__action">
        <SfButton
          ref="submitStepButton"
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
  </validation-observer>
</template>
<script>
import { defineComponent, ref, toRef } from '@vue/composition-api';
import { mapGetters } from 'vuex';
import { ValidationObserver } from 'vee-validate';

import { Payment } from '@vue-storefront/core/modules/checkout/components/Payment';
import {
  SfInput,
  SfButton,
  SfHeading,
  SfCheckbox
} from '@storefront-ui/vue';
import { createSmoothscroll } from 'theme/helpers';
import MMultiselect from 'theme/components/molecules/m-multiselect';
import { PERSISTED_CUSTOMER_FIRST_NAME, PERSISTED_CUSTOMER_LAST_NAME, PERSISTED_CUSTOMER_PHONE_NUMBER, PERSISTED_CUSTOMER_VAT_ID, SET_PERSISTED_CUSTOMER_FIRST_NAME, SET_PERSISTED_CUSTOMER_LAST_NAME, SET_PERSISTED_CUSTOMER_PHONE_NUMBER, SET_PERSISTED_CUSTOMER_BILLING_ADDRESS, SET_PERSISTED_CUSTOMER_VAT_ID } from 'src/modules/persisted-customer-data';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'

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

    const { validateAddress, isValidating: isValidatingAddress, completeValidation: completeAddressValidation } = useAddressValidation(context);

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
      completeAddressValidation,
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

    this.$refs.heading.$el.focus();
    this.fillLastUsedCustomerData();
    EventBus.$on('user-after-loggedin', this.fillLastUsedCustomerData);
  },
  beforeDestroy () {
    EventBus.$off('user-after-loggedin', this.fillLastUsedCustomerData);
  },
  methods: {
    focusSubmitStepButton () {
      const submitStepButton = this.$refs.submitStepButton;

      if (!submitStepButton) {
        return;
      }

      const submitStepButtonElement = submitStepButton.$el;

      submitStepButtonElement.focus();
    },
    async onChangeCountry () {
      await Promise.all([
        this.$store.dispatch('checkout/updatePaymentDetails', { country: this.payment.country }),
        this.$store.dispatch('cart/syncPaymentMethods', { forceServerSync: true })
      ]);
    },
    async onGoReviewButtonClicked () {
      const shouldValidate = !this.sendToShippingAddress;

      if (shouldValidate) {
        const isFormValid = await this.validateAndGoToFirstError();

        if (!isFormValid) {
          return;
        }

        const paymentRef = toRef(this, 'payment');
        const shouldProceed = await this.validateAddress(paymentRef);

        if (!shouldProceed) {
          this.focusSubmitStepButton();
          return;
        }

        this.completeAddressValidation();
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
        SET_PERSISTED_CUSTOMER_VAT_ID,
        this.payment.vat_id
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

      const customerVatId = this.$store
        .getters[PERSISTED_CUSTOMER_VAT_ID];

      if (customerFirstName && !this.payment.firstName) {
        this.payment.firstName = customerFirstName;
      }

      if (customerLastName && !this.payment.lastName) {
        this.payment.lastName = customerLastName;
      }

      if (customerPhoneNumber && !this.payment.phoneNumber) {
        this.payment.phoneNumber = customerPhoneNumber;
      }

      if (customerVatId && !this.payment.vat_id) {
        this.payment.vat_id = customerVatId;
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
