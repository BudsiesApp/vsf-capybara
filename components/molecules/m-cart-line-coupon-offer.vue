<template>
  <m-coupon-item
    v-if="shouldRender"
    class="m-cart-line-coupon-offer"
    :action-text="actionText"
    :coupon-code="couponCodeLabel"
    :is-action-disabled="isActionDisabled"
    :state="state"
    :title="offerTitle"
    @coupon-action="applyCouponOffer"
  />
</template>

<script lang="ts">
import { computed, defineComponent, watch } from '@vue/composition-api';
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';

import MCouponItem from 'theme/components/molecules/m-coupon-item.vue';

import {
  CartLineCouponOffer,
  resolveCartLineCouponOffer
} from 'theme/helpers/cart-line-coupon-offer';
import { useCouponButton } from 'theme/helpers/use-coupon-button';

export default defineComponent({
  name: 'MCartLineCouponOffer',
  components: {
    MCouponItem
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

    watch(
      shouldRender,
      (newValue, oldValue) => {
        if (newValue === oldValue) {
          return;
        }

        context.emit('should-render-changed', newValue);
      },
      { immediate: true }
    );

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
