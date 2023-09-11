<template>
  <div class="a-promo-code">
    <div class="a-promo-code__title">
      <slot name="title" />
    </div>

    <div v-if="!isCouponCode" class="a-promo-code__form">
      <SfInput
        v-model="promoCode"
        name="promoCode"
        :placeholder="$t('Add a discount code')"
        :disabled="isSubmitting"
        class="sf-input--filled a-promo-code__input"
        @keyup.enter="applyCoupon"
      />

      <MSpinnerButton
        :show-spinner="isSubmitting"
        class="_circle-button"
        button-class="sf-button--text -icon-button"
        @click="applyCoupon"
      >
        <SfCircleIcon
          class="a-promo-code__circle-icon"
          icon="check"
          :disabled="isSubmitting"
        />
      </MSpinnerButton>
    </div>

    <MSpinnerButton
      v-else-if="allowPromoCodeRemoval"
      :show-spinner="isSubmitting"
      class="a-promo-code__button"
      button-class="color-secondary"
      @click="removeCoupon"
    >
      {{ $t('Delete discount code') }}
    </MSpinnerButton>

    <div class="a-promo-code__message" v-if="message">
      {{ message }}
    </div>

    <slot
      name="bottom-helper-text"
      :is-coupon-applied="isCouponCode"
    />
  </div>
</template>

<script>
import { SfInput, SfCircleIcon } from '@storefront-ui/vue';

import MSpinnerButton from 'theme/components/molecules/m-spinner-button.vue';

export default {
  name: 'APromoCode',
  components: {
    MSpinnerButton,
    SfInput,
    SfCircleIcon
  },
  props: {
    allowPromoCodeRemoval: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      promoCode: '',
      fMessage: undefined,
      isSubmitting: false
    };
  },
  computed: {
    isCouponCode () {
      return this.$store.state.cart.platformTotals ? this.$store.state.cart.platformTotals.coupon_code : false;
    },
    message: {
      set: function (message) {
        this.fMessage = message;

        setTimeout(() => { this.fMessage = undefined }, 5000);
      },
      get: function () {
        return this.fMessage;
      }
    }
  },
  methods: {
    async applyCoupon () {
      if (this.isSubmitting) {
        return;
      }

      this.isSubmitting = true;

      try {
        const result = await this.$store.dispatch('cart/applyCoupon', this.promoCode);

        if (result.code !== 200) {
          throw new Error(result.result.errorMessage);
        }
      } catch (error) {
        const errorMessage = error.errorMessage || `Coupon code "${this.promoCode}" is not valid.`;
        this.message = errorMessage;
      } finally {
        this.isSubmitting = false;
        this.promoCode = '';
      }
    },
    async removeCoupon () {
      if (this.isSubmitting) {
        return;
      }

      this.isSubmitting = true;

      try {
        await this.$store.dispatch('cart/removeCoupon');
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.a-promo-code {
  display: flex;
  flex-direction: column;

  ._circle-button {
    --spinner-button-display: flex;
    --spinner-button-width: var(--font-base);
    --spinner-button-height: var(--font-base);
    --spinner-button-background: var(--c-primary);
    --spinner-button-border-radius: 50%;
  }

  &__form {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: var(--spacer-sm);
  }
  &__circle-icon {
    --button-size: 2rem;
    --icon-size: 0.6875rem;
  }
  &__input {
    --input-background: var(--c-white);
    flex: 1;
    margin: 0 var(--spacer-lg) 0 0;
  }
  &__button {
    --button-height: 2rem;
    --button-font-size: 0.6875rem;
  }
  &__message {
    margin-top: var(--spacer-xs);
    font-size: var(--font-xs);
    color: var(--c-danger-variant);
  }
  ::v-deep .sf-input {
    &__wrapper {
      --input-margin: 0;
    }
    &__error-message {
      height: auto;
    }
  }
}
</style>
