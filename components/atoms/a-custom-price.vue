<template>
  <SfPrice
    :regular="formattedRegularPrice"
    :special="formattedSpecialPrice"
  >
    <template #special="{ special }">
      <ins v-if="special" class="sf-price__special">{{ special }}</ins>
      <ins v-if="special" class="sf-price__saved-value">
        (Save {{ saveAmount | price() }} |
        {{ savePercent }}%)
      </ins>
    </template>
  </SfPrice>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { SfPrice } from '@storefront-ui/vue';
import { formatPrice } from 'src/modules/shared/helpers/price';

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
    formattedRegularPrice (): string {
      return formatPrice(this.regular);
    },
    formattedSpecialPrice (): string {
      return formatPrice(this.specialPrice);
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
  }
})
</script>

<style lang="scss" scoped>
.sf-price {
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
