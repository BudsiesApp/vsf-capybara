<template>
  <div class="m-price-summary" :class="skinClass">
    <dl class="m-price-summary__list">
      <div
        v-for="row in summaryRows"
        :key="row.code"
        class="property"
        :class="{
          'property--large': isLarge,
          'property--marked': row.isMarked
        }"
      >
        <dt class="property__name" v-text="row.name" />
        <dd class="property__value">
          {{ row.value }}
        </dd>
      </div>
    </dl>

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

    <dl class="m-price-summary__list">
      <div
        class="property"
        aria-live="polite"
        aria-atomic="true"
        :class="{'property--large': isLarge}"
      >
        <dt class="property__name" v-text="$t('Grand Total')" />
        <dd class="property__value">
          {{ formatPrice(prices.grand_total) }}
        </dd>
      </div>

      <div
        v-if="showDefaultCurrencyGrandTotal"
        class="property"
        :class="{'property--large': isLarge}"
      >
        <dt class="property__name" v-text="$t('Grand Total(USD)')" />
        <dd class="property__value">
          {{ prices.grand_total | price }}
        </dd>
      </div>
    </dl>

    <div v-if="showDefaultCurrencyGrandTotal" class="_note">
      {{ $t(`Note: You will be charged in USD. The amount shown in your selected currency is an estimate based on the current exchange rate and may vary slightly depending on your payment provider.`) }}
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { SfDivider } from '@storefront-ui/vue';
import { IS_COUPON_INTERACTION_BLOCKED } from '@vue-storefront/core/modules/cart';

import { PriceHelper } from '@vue-storefront/core/helpers';
import { DEFAULT_CURRENCY, GET_CURRENCY_EXCHANGE_RATE, GET_ACTIVE_CURRENCY } from 'src/modules/currency';

import MSpinnerButton from 'theme/components/molecules/m-spinner-button.vue';

import getCurrentThemeClass from 'theme/helpers/get-current-theme-class';

export default {
  name: 'MPriceSummary',
  components: {
    MSpinnerButton,
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
    summaryRows () {
      const rows = [];

      rows.push({
        code: 'products',
        name: this.$t('Products'),
        value: this.totalItems
      });

      if (this.regularSubtotalPrice) {
        rows.push({
          code: 'subtotal',
          name: this.$t('Subtotal'),
          value: this.formatPrice(this.regularSubtotalPrice)
        });
      }

      if (this.prices.subtotal_incl_tax) {
        rows.push({
          code: 'subtotal-incl-tax',
          name: this.$t('Subtotal Incl Tax'),
          value: this.formatPrice(this.prices.subtotal_incl_tax)
        });
      }

      if (this.prices.tax) {
        rows.push({
          code: 'tax',
          name: this.$t('Tax'),
          value: this.formatPrice(this.prices.tax)
        });
      }

      if (this.prices.shipping || this.prices.shipping === 0) {
        rows.push({
          code: 'shipping',
          name: this.$t('Shipping'),
          value: this.formatPrice(this.prices.shipping)
        });
      }

      if (this.discount) {
        rows.push({
          code: 'discount',
          name: this.discount.title,
          value: this.formatPrice(this.discount.value),
          isMarked: true
        });
      }

      if (this.prices.amgiftcard) {
        rows.push({
          code: 'gift-cards-applied',
          name: this.$t('Gift Cards Applied'),
          value: this.formatPrice(this.prices.amgiftcard),
          isMarked: true
        });
      }

      if (this.savingsTotal) {
        rows.push({
          code: 'price-savings',
          name: this.$t('Price Savings'),
          value: this.formatPrice(this.savingsTotal),
          isMarked: true
        });
      }

      if (this.discountsTotal) {
        rows.push({
          code: 'total-discounts',
          name: this.$t('Total Discounts'),
          value: this.formatPrice(this.discountsTotal),
          isMarked: true
        });
      }

      return rows;
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
    skinClass () {
      return getCurrentThemeClass();
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
@import "~@storefront-ui/shared/styles/helpers/typography";

.m-price-summary {
  &__list {
    margin: 0;
    padding: 0;
  }

  .divider {
    --divider-border-color: var(--c-white);
    --divider-width: 100%;
    --divider-margin: 0 0 var(--spacer-base) 0;
  }

  ._note {
    font-size: var(--font-xs);
  }

  .property {
    display: flex;
    justify-content: space-between;
    width: 100%;
    color: var(--property-color, var(--c-text));
    margin: 0 0 var(--spacer-base) 0;

    &__name {
      margin: var(--property-name-margin, 0 var(--spacer-xs) 0 0);
      color: var(--property-name-color, var(--c-secondary-variant));
      text-transform: var(--property-name-text-transform);
      @include font(
        --property-name-font,
        var(--font-normal),
        var(--font-sm),
        1.2,
        var(--font-family-secondary)
      );

      &::after {
        content: var(--property-name-content, ":");
      }
    }

    &__value {
      margin: 0;
      color: var(--property-value-color);
      @include font(
        --property-value-font,
        var(--font-medium),
        var(--font-sm),
        1.2,
        var(--font-family-secondary)
      );
    }

    &--large {
      --property-name-font-size: var(--font-lg);
      --property-value-font-size: var(--font-lg);
      --property-value-font-weight: var(--font-semibold);
    }

    &--marked {
      --property-name-color: var(--_c-light-primary);
      --property-value-color: var(--_c-light-primary);
      --property-name-font-weight: var(--font-bold);
      --property-value-font-weight: var(--font-bold);
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

  &.-skin-budsies {
    .property--marked {
      --property-name-color: var(--c-accent);
      --property-value-color: var(--c-accent);
    }
  }
}
</style>
