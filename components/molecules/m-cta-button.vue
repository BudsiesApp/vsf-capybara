<template>
  <div
    class="m-cta-button"
    :class="{ '-small': size === 'small' }"
    v-show="showCtaButtonContainer"
  >
    <SfButton class="_checkout-button" @click="goToCheckout">
      {{ $t('Go to Checkout') }}
    </SfButton>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { SfButton } from '@storefront-ui/vue';

import Product from 'core/modules/catalog/types/Product';

enum HeaderCtaButtonType {
  GO_TO_CHECKOUT = 'go-to-checkout',
  HIDDEN = 'hidden',
}

export default Vue.extend({
  props: {
    size: {
      type: String,
      default: ''
    }
  },
  components: {
    SfButton
  },
  computed: {
    cartItems (): Product[] {
      return this.$store.getters['cart/getCartItems'];
    },
    ctaButtonType (): HeaderCtaButtonType {
      const routeName = this.$route.name;
      if (
        routeName === 'detailed-cart' &&
        this.cartItems &&
        this.cartItems.length > 0
      ) {
        return HeaderCtaButtonType.GO_TO_CHECKOUT;
      }

      return HeaderCtaButtonType.HIDDEN;
    },
    showCtaButtonContainer (): boolean {
      return this.showGoToCheckoutButton;
    },
    showGoToCheckoutButton (): boolean {
      return this.ctaButtonType === HeaderCtaButtonType.GO_TO_CHECKOUT;
    }
  },
  methods: {
    goToCheckout (): void {
      this.$router.push({ name: 'checkout' });
    }
  }
});
</script>

<style lang="scss" scoped>
.m-cta-button {
  .sf-button {
    --button-font-size: var(--font-sm);
    --button-font-line-height: 1;
  }

  &.-small {
    .sf-button {
      --button-font-size: var(--font-2xs);
      --button-font-line-height: 1;
      --button-padding: calc(var(--spacer-2xs) * 3);
    }
  }
}
</style>
