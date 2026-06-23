<template>
  <div class="m-price-summary">
    <SfProperty
      :name="$t('Products')"
      :value="totalItems"
      class="sf-property--full-width property"
      :class="{'sf-property--large': isLarge}"
    />
    <SfProperty
      v-if="regularSubtotalPrice"
      :name="$t('Subtotal')"
      :value="formatPrice(regularSubtotalPrice)"
      class="sf-property--full-width property"
      :class="{'sf-property--large': isLarge}"
    />
    <SfProperty
      v-if="prices.subtotal_incl_tax"
      :name="$t('Subtotal Incl Tax')"
      :value="formatPrice(prices.subtotal_incl_tax)"
      class="sf-property--full-width property"
      :class="{'sf-property--large': isLarge}"
    />
    <SfProperty
      v-if="prices.tax"
      :name="$t('Tax')"
      :value="formatPrice(prices.tax)"
      class="sf-property--full-width property"
      :class="{'sf-property--large': isLarge}"
    />
    <SfProperty
      v-if="prices.shipping || prices.shipping === 0"
      :name="$t('Shipping')"
      :value="formatPrice(prices.shipping)"
      class="sf-property--full-width property"
      :class="{'sf-property--large': isLarge}"
    />
    <template v-if="discount">
      <SfProperty
        :name="discount.title"
        :value="formatPrice(discount.value)"
        class="sf-property--full-width property --marked"
        :class="{'sf-property--large': isLarge}"
      />
    </template>

    <SfProperty
      v-if="prices.amgiftcard"
      :name="$t('Gift Cards Applied')"
      :value="formatPrice(prices.amgiftcard)"
      class="sf-property--full-width property --marked"
      :class="{'sf-property--large': isLarge}"
    />

    <template v-if="savingsTotal">
      <SfProperty
        :name="$t('Price Savings')"
        :value="formatPrice(savingsTotal)"
        class="sf-property--full-width property --marked"
        :class="{'sf-property--large': isLarge}"
      />
    </template>
    <template v-if="discountsTotal">
      <SfProperty
        :name="$t('Total Discounts')"
        :value="formatPrice(discountsTotal)"
        class="sf-property--full-width property --marked"
        :class="{'sf-property--large': isLarge}"
      />
    </template>
    <MSpinnerButton
      v-if="isCouponCode"
      class="promo-code__button"
      button-class="color-secondary"
      :disabled="isCouponRemovalDisabled"
      :show-spinner="isCouponRemoving"
      @click="removeCoupon"
    >
      {{ $t('Delete discount code') }}
    </MSpinnerButton>
    <SfDivider class="divider" />
    <SfProperty
      :name="$t('Grand Total')"
      :value="formatPrice(prices.grand_total)"
      class="sf-property--full-width property"
      :class="{'sf-property--large': isLarge}"
    />

    <template v-if="showDefaultCurrencyGrandTotal">
      <SfProperty
        :name="$t('Grand Total(USD)')"
        :value="prices.grand_total | price"
        class="sf-property--full-width property"
        :class="{'sf-property--large': isLarge}"
      />

      <div class="_note">
        {{ $t(`Note: You will be charged in USD. The amount shown in your selected currency is an estimate based on the current exchange rate and may vary slightly depending on your payment provider.`) }}
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { SfProperty, SfDivider } from '@storefront-ui/vue';
import { IS_COUPON_INTERACTION_BLOCKED } from '@vue-storefront/core/modules/cart';

import { PriceHelper } from '@vue-storefront/core/helpers';
import { DEFAULT_CURRENCY, GET_CURRENCY_EXCHANGE_RATE, GET_ACTIVE_CURRENCY } from 'src/modules/currency';

import MSpinnerButton from 'theme/components/molecules/m-spinner-button.vue';

export default {
  name: 'MPriceSummary',
  components: {
    MSpinnerButton,
    SfProperty,
    SfDivider
  },
  props: {
    isLarge: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      isCouponRemoving: false
    }
  },
  computed: {
    ...mapGetters({
      totals: 'cart/getTotals',
      productsInCart: 'cart/getCartItems'
    }),
    discount () {
      return this.totals.find((total) => total.code === 'discount');
    },
    prices () {
      return this.totals.reduce((result, price) => {
        result[price.code] = price.value;
        return result;
      }, {});
    },
    regularSubtotalPrice () {
      return this.prices.regular_subtotal || this.prices.subtotal;
    },
    totalItems () {
      return this.productsInCart.reduce((result, product) => {
        return result + product.qty;
      }, 0);
    },
    isCouponCode () {
      return this.$store.state.cart.platformTotals ? this.$store.state.cart.platformTotals.coupon_code : false;
    },
    savingsTotal () {
      return this.prices.savings_total || this.prices.savings;
    },
    discountsTotal () {
      return this.prices.discounts_total || this.prices.discounts;
    },
    selectedCurrency () {
      return this.$store.getters[GET_ACTIVE_CURRENCY];
    },
    isCouponInteractionBlocked () {
      return Boolean(this.$store.getters[IS_COUPON_INTERACTION_BLOCKED]);
    },
    showDefaultCurrencyGrandTotal () {
      return this.selectedCurrency.code !== DEFAULT_CURRENCY.code;
    },
    isCouponRemovalDisabled () {
      return this.isCouponRemoving || this.isCouponInteractionBlocked;
    },
    exchangeRate () {
      return this.$store.getters[GET_CURRENCY_EXCHANGE_RATE];
    }
  },
  methods: {
    async removeCoupon () {
      if (this.isCouponRemovalDisabled) {
        return;
      }

      this.isCouponRemoving = true;

      try {
        await this.$store.dispatch('cart/removeCoupon');
      } finally {
        this.isCouponRemoving = false;
      }
    },
    formatPrice (price) {
      return PriceHelper.formatPrice(
        price * this.exchangeRate,
        this.selectedCurrency.symbol
      );
    }
  }
};
</script>
<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.m-price-summary {
  .sf-property.--marked {
    --property-name-color: var(--_c-light-primary);
    --property-value-color: var(--_c-light-primary);
  }

  .divider {
    --divider-border-color: var(--c-white);
    --divider-width: 100%;
    --divider-margin: 0 0 var(--spacer-base) 0;
  }

  ._note {
    font-size: var(--font-xs);
  }
}

.property {
  margin: 0 0 var(--spacer-base) 0;

  &.sf-property--large {
    --property-name-font-size: var(--font-lg);
    --property-value-font-size: var(--font-lg);
  }

  @include for-desktop {
    margin: 0 0 var(--spacer-sm) 0;
    &__total {
      padding: var(--spacer-base) 0 0 0;
    }
  }
}

.promo-code {
  &__button {
    --button-height: 2rem;
    --button-font-size: 0.6875rem;
    margin: 1rem 0;
  }
}
</style>
