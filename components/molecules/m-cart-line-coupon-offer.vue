<template>
  <div v-if="shouldRender" class="m-cart-line-coupon-offer">
    <template v-if="shouldShowConflictMessage">
      <div class="_button-container">
        <ACopyToClipboardButton
          class="_copy-button color-secondary"
          :value="copyValue"
          :idle-text="$t('Copy code').toString()"
          :success-text="$t('Copied').toString()"
          :error-text="$t('Retry copy').toString()"
        />

        <div class="_message">
          {{ $t('Another coupon is already applied.') }}
        </div>
      </div>
    </template>

    <MSpinnerButton
      v-else
      :show-spinner="isCouponProcessing"
      :disabled="isCartSyncing"
      :title="offerButtonText"
      button-class="_button color-secondary"
      @click="applyCouponOffer"
    >
      {{ offerButtonText }}
    </MSpinnerButton>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api';
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';
import ACopyToClipboardButton from 'theme/components/atoms/a-copy-to-clipboard-button.vue';
import MSpinnerButton from 'theme/components/molecules/m-spinner-button.vue';

import {
  CartLineCouponOffer,
  resolveCartLineCouponOffer
} from 'theme/helpers/cart-line-coupon-offer';
import { useCouponButton } from 'theme/helpers/use-coupon-button';

export default defineComponent({
  name: 'MCartLineCouponOffer',
  components: {
    ACopyToClipboardButton,
    MSpinnerButton
  },
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
    const copyValue = computed<string>(() => {
      return couponCode.value || '';
    });
    const {
      applyCoupon,
      isCartSyncing,
      isCouponProcessing,
      shouldRender,
      shouldShowConflictMessage,
      state
    } = useCouponButton(couponCode, context);

    const applyCouponOffer = async (): Promise<void> => {
      if (!offer.value) {
        return;
      }

      await applyCoupon();
    };

    return {
      applyCouponOffer,
      copyValue,
      isCartSyncing,
      isCouponProcessing,
      offerButtonText,
      shouldShowConflictMessage,
      shouldRender,
      state
    };
  }
});
</script>

<style lang="scss" scoped>
.m-cart-line-coupon-offer {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacer-xs);
  margin-top: var(--spacer-xs);

  ._button-container {
    display: flex;
    flex-direction: column;
  }

  ._message {
    margin-top: var(--spacer-xs);
    color: var(--c-text-muted, var(--c-text));
    font-size: var(--font-xs);
    line-height: 1.4;
    text-align: left;
  }

  ._copy-button {
    --button-font-size: var(--font-xs);
    --button-padding: var(--spacer-xs) var(--spacer-sm);
    --button-min-height: 2rem;
  }

  ::v-deep ._button {
    --button-font-size: var(--font-xs);
    --button-padding: var(--spacer-xs) var(--spacer-sm);
    --button-min-height: 2rem;
  }
}
</style>
