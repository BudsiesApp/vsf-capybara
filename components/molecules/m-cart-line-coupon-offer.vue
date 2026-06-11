<template>
  <div
    v-if="shouldRender"
    :class="['m-cart-line-coupon-offer', `-${state}`]"
  >
    <span class="_icon" aria-hidden="true">🏷️</span>

    <div class="_content">
      <div class="_title">
        {{ offerTitle }}
      </div>

      <div class="_code">
        {{ $t('Code') }}: {{ couponCodeLabel }}
      </div>
    </div>

    <button
      type="button"
      class="_action"
      :disabled="isActionDisabled"
      @click="applyCouponOffer"
    >
      <span v-if="state === 'applying'" class="_spinner" />
      <span>{{ actionText }}</span>
    </button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api';
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';

import {
  CartLineCouponOffer,
  resolveCartLineCouponOffer
} from 'theme/helpers/cart-line-coupon-offer';
import { useCouponButton } from 'theme/helpers/use-coupon-button';

export default defineComponent({
  name: 'MCartLineCouponOffer',
  props: {
    product: {
      required: true
    }
  },
  setup (props, context) {
    const product = computed(() => props.product as CartItem);
    const offer = computed<CartLineCouponOffer | undefined>(() => {
      return resolveCartLineCouponOffer(product.value);
    });
    const offerButtonText = computed<string>(() => {
      return offer.value ? offer.value.buttonText : '';
    });
    const couponCode = computed<string | undefined>(() => {
      return offer.value ? offer.value.couponCode : undefined;
    });
    const couponCodeLabel = computed<string>(() => {
      return couponCode.value || '';
    });
    const {
      applyCoupon,
      isCouponInteractionBlocked,
      state,
      shouldRender
    } = useCouponButton(couponCode, context);
    const offerTitle = computed<string>(() => {
      if (state.value === 'locked') {
        return context.root.$t('Another coupon is already applied.').toString();
      }

      return offerButtonText.value;
    });
    const actionText = computed<string>(() => {
      if (state.value === 'applying') {
        return context.root.$t('Applying').toString();
      }

      if (state.value === 'applied') {
        return context.root.$t('Applied').toString();
      }

      if (state.value === 'locked') {
        return context.root.$t('Locked').toString();
      }

      return context.root.$t('Apply').toString();
    });
    const isActionDisabled = computed<boolean>(() => {
      return isCouponInteractionBlocked.value || state.value !== 'idle';
    });

    const applyCouponOffer = async (): Promise<void> => {
      if (!offer.value) {
        return;
      }

      await applyCoupon();
    };

    return {
      applyCouponOffer,
      actionText,
      couponCodeLabel,
      isActionDisabled,
      offerTitle,
      state,
      shouldRender
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.m-cart-line-coupon-offer {
  --coupon-idle-background: var(--c-secondary-lighten);
  --coupon-idle-text: var(--c-blue);
  --coupon-idle-action-background: var(--c-primary-lighten);
  --coupon-spinner-track: rgba(var(--c-white-base), 0.4);
  --coupon-applied-background: #dff3e9;
  --coupon-applied-text: #0f5c49;
  --coupon-applied-action-background: #20a87c;
  --coupon-locked-background: var(--c-white-darken);
  --coupon-locked-text: var(--c-gray);
  --coupon-locked-action-background: var(--c-gray-light);
  --coupon-locked-action-text: var(--c-dark);

  display: flex;
  align-items: stretch;
  width: 100%;
  margin-top: var(--spacer-sm);
  border-radius: var(--coupon-border-radius, 0.5rem);
  overflow: hidden;
  position: relative;
  background: var(--coupon-idle-background);
  color: var(--coupon-idle-text);

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 0.875rem;
    height: 0.875rem;
    margin-top: -0.4375rem;
    border-radius: 50%;
    background: var(--c-white);
    z-index: 1;
  }

  &::before {
    left: -0.4375rem;
  }

  &::after {
    right: -0.4375rem;
  }

  ._content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    flex: 1;
    padding: var(--spacer-sm) var(--spacer-base) var(--spacer-sm) var(--spacer-sm);
  }

  ._icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    padding: var(--spacer-sm) 0 var(--spacer-sm) var(--spacer-base);
    font-size: 1.25rem;
    line-height: 1;
  }

  ._title {
    font-size: var(--font-sm);
    font-weight: var(--font-semibold);
    line-height: 1.2;
  }

  ._code {
    margin-top: 0.25rem;
    font-size: var(--font-xs);
    line-height: 1.2;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  ._action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    flex: 0 0 6rem;
    padding: var(--spacer-sm);
    border: 0;
    background: var(--coupon-idle-action-background);
    color: var(--c-white);
    font-size: 0.75rem;
    font-weight: var(--font-bold);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }

  ._action:disabled {
    cursor: default;
  }

  ._spinner {
    width: 0.875rem;
    height: 0.875rem;
    border: 2px solid var(--coupon-spinner-track);
    border-top-color: var(--c-white);
    border-radius: 50%;
    animation: coupon-spin 0.8s linear infinite;
  }

  &.-applied {
    background: var(--coupon-applied-background);
    color: var(--coupon-applied-text);

    ._action {
      background: var(--coupon-applied-action-background);
    }
  }

  &.-locked {
    background: var(--coupon-locked-background);
    color: var(--coupon-locked-text);

    ._action {
      background: var(--coupon-locked-action-background);
      color: var(--coupon-locked-action-text);
    }
  }

  @include for-desktop {
    ._icon {
      font-size: 1.5rem;
    }

    ._title {
      font-size: var(--font-base);
    }

    ._action {
      flex-basis: 6.875rem;
      font-size: var(--font-sm);
    }
  }
}

@keyframes coupon-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
