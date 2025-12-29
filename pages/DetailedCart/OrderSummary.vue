<template>
  <div class="detailed-cart-order-summary">
    <SfHeading
      title="Totals"
      :level="2"
      class="sf-heading--left sf-heading--no-underline title"
    />
    <MPriceSummary :is-large="true" />

    <div class="actions">
      <APromoCode :allow-promo-code-removal="false">
        <template #bottom-helper-text="{ isCouponApplied }">
          <p class="_helper-text" v-if="!isCouponApplied">
            {{ $t('Please apply gift certificates during checkout (next step)') }}
          </p>
        </template>
      </APromoCode>

      <ExpressCheckoutButtons class="_express-checkout" />

      <SfButton
        class="sf-button--full-width actions__button _checkout-button"
        @click="goToCheckout"
      >
        {{ $t('Go to checkout') }}
      </SfButton>
    </div>

    <SfLoader v-if="isCartSyncing" :loading="isCartSyncing" />
  </div>
</template>
<script>
import {
  SfLoader,
  SfHeading,
  SfButton
} from '@storefront-ui/vue';
import { localizedRoute } from '@vue-storefront/core/lib/multistore';
import { mapActions, mapGetters } from 'vuex'

import { registerModule } from '@vue-storefront/core/lib/modules'
import { Braintree } from 'src/modules/payment-braintree';
import { IS_CART_SYNCING } from '@vue-storefront/core/modules/cart';

import APromoCode from 'theme/components/atoms/a-promo-code.vue';
import MPriceSummary from 'theme/components/molecules/m-price-summary.vue';
import ExpressCheckoutButtons from 'theme/components/checkout/express-checkout-buttons.vue';

export default {
  name: 'OrderSummary',
  components: {
    ExpressCheckoutButtons,
    MPriceSummary,
    SfLoader,
    APromoCode,
    SfHeading,
    SfButton
  },
  beforeMount () {
    registerModule(Braintree)
  },
  computed: {
    ...mapGetters({
      isCartSyncing: IS_CART_SYNCING
    })
  },
  methods: {
    ...mapActions('ui', {
      openModal: 'openModal'
    }),
    goToCheckout () {
      this.$router.push(localizedRoute({ name: 'checkout' }));
    }
  }
};
</script>
<style lang="scss" scoped>
@import "~@storefront-ui/vue/styles";

.detailed-cart-order-summary {
  position: relative;
  background: var(--c-light);
  padding: var(--spacer-xl);

  --heading-title-margin: 0 0 var(--spacer-base) 0;

  .title {
    @include for-desktop {
      --heading-title-margin: 0 0 var(--spacer-2xl) 0;
      --heading-title-font-size: var(--h3-font-size);
      --heading-title-font-weight: var(--font-semibold);
    }
  }
  ._total-notes{
    text-align: right;
    font-size: var(--font-sm);

    @include for-desktop {
      font-size: var(--font-base);
    }
  }

  .actions {
    margin-top: var(--spacer-lg);

    ._express-checkout {
      margin-top: var(--spacer-sm);
    }

    &__button {
      margin: var(--spacer-sm) 0;
      &--secondary {
        margin: 0 0 0 var(--spacer-xs);
        text-align: left;
      }
    }
  }
  .promo-code {
    padding: 0;
  }

  ._helper-text {
    margin: var(--spacer-xs) 0 0;
    font-size: var(--font-2xs);
    font-weight: var(--font-medium);
  }

  .sf-loader {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0.5;
  }
}
</style>
