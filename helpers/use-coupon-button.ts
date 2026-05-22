import { ComputedRef, SetupContext, computed, ref, watch } from '@vue/composition-api';

import { notifications } from '@vue-storefront/core/modules/cart/helpers';
import { IS_CART_SYNCING, IS_COUPON_PROCESSING } from '@vue-storefront/core/modules/cart';
import AppliedCoupon from '@vue-storefront/core/modules/cart/types/AppliedCoupon';

export type CouponButtonState = 'conflict' | 'hidden' | 'ready' | 'unavailable'

export function useCouponButton (
  couponCode: ComputedRef<string | undefined>,
  { root }: SetupContext
) {
  const appliedCoupon = computed<AppliedCoupon | false>(() => {
    return root.$store.getters['cart/getCoupon'];
  });
  const state = computed<CouponButtonState>(() => {
    if (!couponCode.value) {
      return 'unavailable';
    }

    if (!appliedCoupon.value) {
      return 'ready';
    }

    if (appliedCoupon.value.code === couponCode.value) {
      return 'hidden';
    }

    return 'conflict';
  });
  const isConflictMessageVisible = ref<boolean>(false);
  const shouldRender = computed<boolean>(() => {
    return state.value !== 'hidden' && state.value !== 'unavailable';
  });
  const shouldShowConflictMessage = computed<boolean>(() => {
    return state.value === 'conflict' && isConflictMessageVisible.value;
  });
  const isCartSyncing = computed<boolean>(() => {
    return root.$store.getters[IS_CART_SYNCING];
  });
  const isCouponProcessing = computed<boolean>(() => {
    return root.$store.getters[IS_COUPON_PROCESSING];
  });

  watch(state, (value: CouponButtonState) => {
    if (value !== 'conflict') {
      isConflictMessageVisible.value = false;
    }
  });

  const createNotification = (type: string, message: string): void => {
    root.$store.dispatch(
      'notification/spawnNotification',
      notifications.createNotification({
        type,
        message,
        timeToLive: 5 * 1000
      }),
      { root: true }
    );
  };

  const applyCoupon = async (): Promise<boolean> => {
    if (!couponCode.value || isCartSyncing.value || isCouponProcessing.value) {
      return false;
    }

    if (state.value === 'conflict') {
      isConflictMessageVisible.value = true;
      return false;
    }

    if (state.value !== 'ready') {
      return false;
    }

    try {
      const result = await root.$store.dispatch('cart/applyCoupon', couponCode.value);

      if (!result?.code || result.code !== 200) {
        return false;
      }

      createNotification('success', root.$t('Coupon applied.').toString());
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    applyCoupon,
    appliedCoupon,
    isCartSyncing,
    isCouponProcessing,
    shouldRender,
    shouldShowConflictMessage
  };
}
