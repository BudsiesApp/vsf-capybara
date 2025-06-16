<template>
  <SfPrice
    :regular="formattedRegularPrice"
    :special="formattedSpecialPrice"
  >
    <template #special="{ special }">
      <ins v-if="special" class="sf-price__special">{{ special }}</ins>
      <ins v-if="special" class="sf-price__saved-value">
        (Save {{ formatPrice(saveAmount) }} |
        {{ savePercent }}%)
      </ins>
    </template>
  </SfPrice>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { SfPrice } from '@storefront-ui/vue';
import { PriceHelper } from '@vue-storefront/core/helpers';

import { Currency, GET_ACTIVE_CURRENCY } from 'src/modules/currency';

export default Vue.extend({
  name: 'ACustomPrice',
  components: {
    SfPrice
  },
  props: {
    regular: {
      type: Number,
      required: true
    },
    specialPrice: {
      type: Number as PropType<number | null>,
      default: 0
    }
  },
  computed: {
    selectedCurrency (): Currency {
      return this.$store.getters[GET_ACTIVE_CURRENCY];
    },
    formattedRegularPrice (): string {
      return PriceHelper.formatPrice(this.regular, this.selectedCurrency.symbol);
    },
    formattedSpecialPrice (): string {
      return PriceHelper.formatPrice(this.specialPrice, this.selectedCurrency.symbol);
    },
    saveAmount (): number {
      if (this.specialPrice === null) {
        return 0;
      }

      return this.regular - this.specialPrice;
    },
    savePercent (): number {
      return Math.round(
        (this.saveAmount / this.regular) * 100
      );
    }
  },
  methods: {
    formatPrice (value: number): string {
      return PriceHelper.formatPrice(value, this.selectedCurrency.symbol);
    }
  }
})
</script>

<style lang="scss" scoped>
.sf-price {
  --price-regular-color: var(--c-warning);

  ::v-deep &__special {
    margin: var(--price-old-margin, 0 var(--spacer-xs) 0 0);
  }

  ::v-deep  &__saved-value {
    color: var(--price-special-color, var(--c-text));
    font: var(--price-special-font, var(--price-special-font-weight, var(--font-medium)) var(--price-special-font-size, var(--font-lg))/var(--price-special-font-line-height, 1.6) var(--price-special-font-family, var(--font-family-secondary)));
    font-size: 1em;
    text-decoration: var(--price-special-text-decoration, none);
  }
}
</style>
