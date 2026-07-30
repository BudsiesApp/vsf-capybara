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
        :disabled="isInteractionDisabled"
        :aria-label="$t('Add a discount code')"
        class="sf-input--filled a-promo-code__input"
        @keyup.enter="applyCoupon"
      />

      <MSpinnerButton
        :show-spinner="isSubmitting"
        :disabled="isInteractionDisabled"
        :title="$t('Apply coupon')"
        :aria-label="$t('Apply coupon')"
        class="_circle-button"
        button-class="sf-button -icon-button"
        @click="applyCoupon"
      >
        <SfIcon
          icon="check"
          size="12px"
          color="white"
        />
      </MSpinnerButton>
    </div>

    <MSpinnerButton
      v-else-if="allowPromoCodeRemoval"
      :show-spinner="isSubmitting"
      :disabled="isInteractionDisabled"
      class="a-promo-code__button"
      button-class="color-secondary"
      @click="removeCoupon"
    >
      {{ $t('Delete discount code') }}
    </MSpinnerButton>

    <div class="a-promo-code__message" v-if="message" aria-live="polite">
      {{ message }}
    </div>

    <span
      class="_screen-reader-message"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ couponAppliedAnnouncement }}
    </span>

    <slot
      name="bottom-helper-text"
      :is-coupon-applied="isCouponCode"
    />
  </div>
</template>

<script>
import { SfIcon, SfInput } from '@storefront-ui/vue';
import { IS_COUPON_INTERACTION_BLOCKED } from '@vue-storefront/core/modules/cart';

import MSpinnerButton from 'theme/components/molecules/m-spinner-button.vue';

export default {
  name: 'APromoCode',
  components: {
    MSpinnerButton,
    SfInput,
    SfIcon
  },
  props: {
    allowPromoCodeRemoval: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      promoCode: '',
      fMessage: undefined,
      isSubmitting: false,
      couponAppliedAnnouncement: ''
    };
  },
  computed: {
    isCouponCode () {
      return this.$store.state.cart.platformTotals ? this.$store.state.cart.platformTotals.coupon_code : false;
    },
    isCouponInteractionBlocked () {
      return Boolean(this.$store.getters[IS_COUPON_INTERACTION_BLOCKED]);
    },
    isInteractionDisabled () {
      return this.disabled || this.isSubmitting || this.isCouponInteractionBlocked;
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
      if (this.isInteractionDisabled) {
        return;
      }

      this.isSubmitting = true;
      this.couponAppliedAnnouncement = '';

      try {
        const result = await this.$store.dispatch('cart/applyCoupon', { couponCode: this.promoCode });

        if (result.code !== 200) {
          throw new Error(result.result.errorMessage);
        }

        this.couponAppliedAnnouncement = this.$t('Coupon applied.').toString();
      } catch (error) {
        const errorMessage = error.errorMessage || `Coupon code "${this.promoCode}" is not valid.`;
        this.message = errorMessage;
      } finally {
        this.isSubmitting = false;
        this.promoCode = '';
      }
    },
    async removeCoupon () {
      if (this.isInteractionDisabled) {
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

    --button-size: 2rem;
    --icon-size: 0.6875rem;
    --button-padding: 0;
  }

  &__form {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: var(--spacer-sm);
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
  ._screen-reader-message {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
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
