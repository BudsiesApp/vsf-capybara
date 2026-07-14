<template>
  <div
    class="storyblok-coupon-offer layout-regular-component"
    :class="cssClasses"
    :style="styles"
  >
    <editor-block-icons :item="itemData" />

    <m-coupon-item
      class="_coupon"
      :action-text="actionText"
      :coupon-code="couponCodeLabel"
      :is-action-disabled="isActionDisabled"
      :state="displayState"
      :title="offerTitle"
      @coupon-action="applyCouponOffer"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from '@vue/composition-api';

import { notifications } from '@vue-storefront/core/modules/cart/helpers';
import { CART_SET_PENDING_COUPON } from '@vue-storefront/core/modules/cart/store/mutation-types';
import { isStoryblokPreview } from 'src/modules/vsf-storyblok-module';
import { Blok } from 'src/modules/vsf-storyblok-module/components';

import MCouponItem from 'theme/components/molecules/m-coupon-item.vue';
import { CouponButtonState, useCouponButton } from 'theme/helpers/use-coupon-button';

import CouponOfferData from './interfaces/coupon-offer-data.interface';

export default defineComponent({
  name: 'StoryblokCouponOffer',
  extends: Blok,
  components: {
    MCouponItem
  },
  props: {
    item: {
      type: Object as PropType<CouponOfferData>,
      required: true
    }
  },
  setup (props, context) {
    const itemData = computed<CouponOfferData>(() => {
      return props.item;
    });
    const couponCode = computed<string | undefined>(() => itemData.value.coupon_code);
    const couponCodeLabel = computed<string>(() => couponCode.value || '');
    const isSavingPendingCoupon = ref<boolean>(false);
    const isEditorPreview = computed<boolean>(() => {
      return isStoryblokPreview();
    });
    const hasServerCart = computed<boolean>(() => {
      return Boolean(context.root.$store.getters['cart/getCartToken']);
    });
    const {
      applyCoupon,
      isCouponInteractionBlocked,
      state
    } = useCouponButton(couponCode, context);
    const displayState = computed<CouponButtonState>(() => {
      return isSavingPendingCoupon.value ? 'applying' : state.value;
    });
    const offerTitle = computed<string>(() => {
      if (displayState.value === 'locked') {
        return context.root.$t('Another coupon is already applied.').toString();
      }

      return itemData.value.title || '';
    });
    const actionText = computed<string>(() => {
      if (displayState.value === 'applying') {
        return context.root.$t('Applying').toString();
      }

      if (displayState.value === 'applied') {
        return context.root.$t('Applied').toString();
      }

      if (displayState.value === 'locked') {
        return context.root.$t('Locked').toString();
      }

      return context.root.$t('Apply').toString();
    });
    const isActionDisabled = computed<boolean>(() => {
      return isEditorPreview.value ||
        isCouponInteractionBlocked.value ||
        displayState.value !== 'idle';
    });

    const notifyPendingCouponSaved = (): void => {
      context.root.$store.dispatch(
        'notification/spawnNotification',
        notifications.createNotification({
          type: 'success',
          message: context.root.$t('Coupon saved. It will be applied automatically when you add items to your cart.').toString(),
          timeToLive: 5 * 1000
        }),
        { root: true }
      );
    };
    const savePendingCoupon = async (): Promise<void> => {
      if (!couponCode.value || isActionDisabled.value) {
        return;
      }

      isSavingPendingCoupon.value = true;

      try {
        context.root.$store.commit(
          `cart/${CART_SET_PENDING_COUPON}`,
          couponCode.value
        );
        notifyPendingCouponSaved();
      } finally {
        isSavingPendingCoupon.value = false;
      }
    };
    const applyCouponOffer = async (): Promise<void> => {
      if (isEditorPreview.value || !couponCode.value) {
        return;
      }

      if (!hasServerCart.value) {
        await savePendingCoupon();
        return;
      }

      await applyCoupon();
    };

    return {
      actionText,
      applyCouponOffer,
      couponCodeLabel,
      displayState,
      isActionDisabled,
      itemData,
      offerTitle
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "src/modules/vsf-storyblok-module/components/defaults/mixins";

.storyblok-coupon-offer {
  @include display-property-handling;

  display: flex;

  &.-align-left {
    justify-content: start;
  }

  &.-align-center {
    justify-content: center;
  }

  &.-align-right {
    justify-content: end;
  }

  ._coupon {
    margin-top: 0;
  }

  &.-editor-preview-mode {
    ._coupon {
      pointer-events: none;
    }
  }

  @media (min-width: $tablet-min) {
    ._coupon {
      max-width: 26rem;
    }
  }
}
</style>
