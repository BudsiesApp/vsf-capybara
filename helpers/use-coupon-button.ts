import { ComputedRef, SetupContext, computed, ref, watch } from '@vue/composition-api';

import { notifications } from '@vue-storefront/core/modules/cart/helpers';
import { IS_CART_SYNCING, IS_COUPON_INTERACTION_BLOCKED, IS_COUPON_PROCESSING } from '@vue-storefront/core/modules/cart';
import AppliedCoupon from '@vue-storefront/core/modules/cart/types/AppliedCoupon';

export type CouponButtonState = 'applied' | 'applying' | 'hidden' | 'idle' | 'locked'

export interface CouponButtonResult {
  applyCoupon: () => Promise<boolean>,
  appliedCoupon: ComputedRef<AppliedCoupon | false>,
  isCartSyncing: ComputedRef<boolean>,
  isCouponInteractionBlocked: ComputedRef<boolean>,
  isCouponProcessing: ComputedRef<boolean>,
  state: ComputedRef<CouponButtonState>,
  shouldRender: ComputedRef<boolean>
}

export function useCouponButton (
  couponCode: ComputedRef<string | undefined>,
  { root }: SetupContext
): CouponButtonResult {
  const isApplyingCoupon = ref<boolean>(false);
  const appliedCoupon = computed<AppliedCoupon | false>(() => {
    return root.$store.getters['cart/getCoupon'];
  });
  const isCartSyncing = computed<boolean>(() => {
    return root.$store.getters[IS_CART_SYNCING];
  });
  const isCouponInteractionBlocked = computed<boolean>(() => {
    return root.$store.getters[IS_COUPON_INTERACTION_BLOCKED];
  });
  const isCouponProcessing = computed<boolean>(() => {
    return root.$store.getters[IS_COUPON_PROCESSING];
  });
  const state = computed<CouponButtonState>(() => {
    if (!couponCode.value) {
      return 'hidden';
    }

    if (appliedCoupon.value && appliedCoupon.value.code === couponCode.value) {
      return 'applied';
    }

    if (appliedCoupon.value) {
      return 'locked';
    }

    if (isCouponProcessing.value && isApplyingCoupon.value) {
      return 'applying';
    }

    return 'idle';
  });
  const shouldRender = computed<boolean>(() => {
    return state.value !== 'hidden';
  });

  watch(isCouponProcessing, (value: boolean) => {
    if (!value) {
      isApplyingCoupon.value = false;
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
    if (!couponCode.value || isCouponInteractionBlocked.value) {
      return false;
    }

    if (state.value === 'applied' || state.value === 'hidden' || state.value === 'locked') {
      return false;
    }

    if (state.value !== 'idle') {
      return false;
    }

    isApplyingCoupon.value = true;

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
    isCouponInteractionBlocked,
    isCouponProcessing,
    state,
    shouldRender
  };
}
