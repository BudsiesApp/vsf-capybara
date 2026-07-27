<template>
  <div
    class="o-order-review"
    :class="skinClass"
  >
    <SfHeading
      :title="$t('Details')"
      :level="3"
      class="sf-heading--left sf-heading--no-underline title"
    />

    <div class="_section">
      <div class="review__header">
        <h3 class="review__title">
          {{ $t('Contact') }}
        </h3>

        <SfButton
          class="sf-button--text color-secondary"
          @click="emitCheckoutEdit('personalDetails')"
        >
          {{ $t('Edit') }}
        </SfButton>
      </div>

      <p class="content">
        {{ personalDetails.firstName }} {{ personalDetails.lastName }}
      </p>

      <p class="content">
        {{ personalDetails.emailAddress }}
      </p>
    </div>

    <div class="_section" v-if="!isVirtualCart">
      <div class="review__header">
        <h3 class="review__title">
          {{ $t('Shipping') }}
        </h3>

        <SfButton
          class="sf-button--text color-secondary"
          @click="emitCheckoutEdit('shipping')"
        >
          {{ $t('Edit') }}
        </SfButton>
      </div>

      <p class="content">
        <span class="content__label">
          {{ shippingMethod }}
        </span>

        {{ shippingDetails.streetAddress }}
        {{ shippingDetails.apartmentNumber }},
        {{ shippingDetails.zipCode }}
        <br>
        {{ shippingDetails.city }}, {{ shippingDetails.country }}
      </p>

      <p class="content" v-if="shippingDetails.phoneNumber">
        {{ formatPhoneNumber(shippingDetails.phoneNumber, shippingDetails.country) }}
      </p>
    </div>

    <div class="_section">
      <div class="review__header">
        <h3 class="review__title">
          {{ $t('Billing address') }}
        </h3>

        <SfButton
          class="sf-button--text color-secondary"
          @click="emitCheckoutEdit('payment')"
        >
          {{ $t('Edit') }}
        </SfButton>
      </div>

      <p class="content">
        {{ paymentDetails.streetAddress }}
        {{ paymentDetails.apartmentNumber }},
        {{ paymentDetails.zipCode }}
        <br>
        {{ paymentDetails.city }}, {{ paymentDetails.country }}
      </p>

      <p class="content" v-if="paymentDetails.phoneNumber">
        {{ formatPhoneNumber(paymentDetails.phoneNumber, paymentDetails.country) }}
      </p>
    </div>
  </div>
</template>
<script>
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { mapGetters } from 'vuex';
import { SfHeading, SfButton } from '@storefront-ui/vue';
import { parsePhoneNumberWithError } from 'libphonenumber-js';

import { currentStoreView } from '@vue-storefront/core/lib/multistore';
import { createPhoneHelpers } from 'src/modules/shared';

import getCurrentThemeClass from 'theme/helpers/get-current-theme-class';

const phoneHelpers = createPhoneHelpers(parsePhoneNumberWithError);

export default {
  name: 'OOrderReview',
  components: {
    SfHeading,
    SfButton
  },
  computed: {
    ...mapGetters({
      shippingDetails: 'checkout/getShippingDetails',
      shippingMethods: 'checkout/getShippingMethods',
      paymentDetails: 'checkout/getPaymentDetails',
      personalDetails: 'checkout/getPersonalDetails',
      isVirtualCart: 'cart/isVirtualCart'
    }),
    shippingMethod () {
      const shippingMethod = this.shippingMethods.find(
        method => this.shippingDetails.shippingMethod === method.method_code
      );

      if (!shippingMethod) {
        return '';
      }

      if (!shippingMethod.hasOwnProperty('method_name')) {
        return shippingMethod.carrier_title;
      }

      return shippingMethod.method_title;
    },
    skinClass () {
      return getCurrentThemeClass();
    }
  },
  methods: {
    emitCheckoutEdit (section) {
      EventBus.$emit('checkout-before-edit', section);
    },
    formatPhoneNumber (phoneNumber, countryId) {
      if (!phoneNumber) {
        return phoneNumber;
      }

      const { i18n } = currentStoreView();

      return phoneHelpers.formatPhoneNumberForDisplay(
        phoneNumber,
        countryId || i18n.defaultCountry
      );
    }
  }
};
</script>
<style lang="scss" scoped>
.title {
  --heading-title-margin: 0 0 var(--spacer-lg) 0;
}

.review {
  box-sizing: border-box;
  width: 100%;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    margin: 0 0 var(--spacer-xs);
    font: inherit;
  }
}

._section {
  margin-bottom: var(--spacer-base);

  &:last-child {
    margin-bottom: 0;
  }
}

.content {
  font-family: var(--font-family-primary);
  font-size: var(--font-xs);
  line-height: 1.45;
  font-weight: var(--font-light);
  margin: 0;
  color: var(--c-dark-variant);

  &__label {
    color: var(--c-text);
    font-weight: var(--font-normal);
    margin-bottom: var(--spacer-2xs);
  }
}

.o-order-review {
  &.-skin-petsies {
    .content {
      color: var(--c-text);
    }
  }
}
</style>
