<template>
  <div
    class="m-cta-button"
    :class="{ '-small': size === 'small' }"
    v-show="showCtaButtonContainer"
  >
    <SfButton class="_bulk-quote-button" v-show="showDefaultButton">
      <router-link class="_inner" :to="{name: 'bulk-quote'}">
        {{ $t('Get Quote') }}
      </router-link>
    </SfButton>

    <SfButton v-show="showGoToCheckoutButton" @click="goToCheckout">
      {{ $t('Go to Checkout') }}
    </SfButton>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { SfButton } from '@storefront-ui/vue';

import Product from 'core/modules/catalog/types/Product';

enum HeaderCtaButtonType {
  DEFAULT = 'default',
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
    ctaButtonType () {
      const routeName = this.$route.name;
      if (
        routeName === 'detailed-cart' &&
        this.cartItems &&
        this.cartItems.length > 0
      ) {
        return HeaderCtaButtonType.GO_TO_CHECKOUT;
      }

      if (routeName === 'checkout') {
        return HeaderCtaButtonType.HIDDEN;
      }

      return HeaderCtaButtonType.DEFAULT;
    },
    showCtaButtonContainer (): boolean {
      return this.ctaButtonType !== HeaderCtaButtonType.HIDDEN;
    },
    showGoToCheckoutButton (): boolean {
      return this.ctaButtonType === HeaderCtaButtonType.GO_TO_CHECKOUT;
    },
    showDefaultButton (): boolean {
      return this.ctaButtonType === HeaderCtaButtonType.DEFAULT;
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
$small-button-padding: calc(var(--spacer-2xs) * 3);

.m-cta-button {
  .sf-button {
    --button-font-size: var(--font-sm);
    --button-font-line-height: 1;
  }

  ._bulk-quote-button {
    --c-link: var(--c-white);
    --c-link-hover: var(--c-white);
    --button-padding: 0;

    ._inner {
      padding: var(--spacer-sm) calc(var(--spacer-sm) * 2);
    }
  }

  &.-small {
    .sf-button {
      --button-font-size: var(--font-2xs);
      --button-font-line-height: 1;
      --button-padding: $small-button-padding;
    }

    ._bulk-quote-button {
      ._inner {
        padding: $small-button-padding;
      }
    }
  }
}
</style>
