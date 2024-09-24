<template>
  <SfCollectedProduct
    :image="thumbnail"
    image-width="140"
    image-height="140"
    :title="cartItem.name"
    class="sf-collected-product--detailed collected-product"
  >
    <template #configuration>
      <cart-item-configuration
        :customizations="cartItem.customizations"
        :customization-state="
          (cartItem.extension_attributes || {}).customization_state
        "
        :product-options="cartItemOptions"
      />
    </template>

    <template #input>
      <SfQuantitySelector
        :qty="cartItem.qty"
        :disabled="disabled"
        @input="$emit('update-quantity', { cartItem, qty: $event })"
        v-if="showQuantitySelector"
      />

      <div class="_quantity" v-else>
        {{ cartItem.qty }}
      </div>
    </template>

    <template #price>
      <div />
    </template>

    <template #actions>
      <SfButton
        v-if="showEditButton"
        class="sf-button--text actions__button"
        @click="$emit('edit', cartItem)"
      >
        Edit
      </SfButton>

      <SfButton
        class="sf-button--text sf-collected-product__remove sf-collected-product__remove--text actions__button"
        @click="$emit('remove', cartItem)"
      >
        Remove
      </SfButton>
    </template>

    <template #remove>
      <SfPrice :regular="price.regular" :special="price.special" />
    </template>

    <template #more-actions>
      <div />
    </template>
  </SfCollectedProduct>
</template>

<script lang="ts">
import { SfButton, SfCollectedProduct, SfPrice, SfQuantitySelector } from '@storefront-ui/vue';
import {
  computed,
  defineComponent,
  inject,
  PropType,
  toRefs
} from '@vue/composition-api';

import { getThumbnailForProduct } from '@vue-storefront/core/modules/cart/helpers';
import CartItem from 'core/modules/cart/types/CartItem';
import { getCustomizationSystemCartItemThumbnail } from 'src/modules/customization-system';
import { ImageHandlerService } from 'src/modules/file-storage';
import {
  getCartItemPrice,
  ProductPrice
} from 'src/modules/shared/helpers/price';

import CartItemConfiguration from 'theme/components/customization-system/cart-item-configuration.vue';
import { getCartItemOptions } from 'theme/helpers/get-cart-item-options.function';
import { getProductMaxSaleQuantity } from 'theme/helpers/get-product-max-sale-quantity.function';

export default defineComponent({
  props: {
    cartItem: {
      type: Object as PropType<CartItem>,
      required: true
    },
    showEditButton: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  components: {
    CartItemConfiguration,
    SfButton,
    SfPrice,
    SfCollectedProduct,
    SfQuantitySelector
  },
  setup (props, { root }) {
    const { cartItem } = toRefs(props);
    const imageHandlerService = inject<ImageHandlerService>(
      'ImageHandlerService'
    );

    const price = computed<ProductPrice>(() => {
      // TODO: quick fix, need to refactor
      const _ = root.$store.getters['promotionPlatform/campaignContent'];

      return getCartItemPrice(cartItem.value, {});
    });

    const cartItemOptions = computed(() => {
      return getCartItemOptions(cartItem.value);
    });

    const thumbnail = computed<string>(() => {
      if (!imageHandlerService) {
        throw new Error('Image Handler Service is not defined');
      }

      const customizationSystemThumbnail =
        getCustomizationSystemCartItemThumbnail(
          cartItem.value,
          imageHandlerService
        );

      if (customizationSystemThumbnail) {
        return customizationSystemThumbnail;
      }

      if (
        cartItem.value.thumbnail &&
        cartItem.value.thumbnail.includes('://')
      ) {
        return cartItem.value.thumbnail;
      }

      return getThumbnailForProduct(cartItem.value);
    });

    const showQuantitySelector = computed<boolean>(() => {
      return getProductMaxSaleQuantity(cartItem.value) > 1;
    });

    return {
      cartItemOptions,
      price,
      showQuantitySelector,
      thumbnail
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/vue/styles";

.sf-collected-product {
  --collected-product-image-background: none;
  --collected-product-main-margin: 0 var(--spacer-sm);
  --collected-product-padding: var(--spacer-sm) 0;
  --collected-product-title-font-size: var(--font-sm);
  --collected-product-title-font-weight: var(--font-semibold);

  border: 1px solid var(--c-light);
  border-width: 1px 0 0 0;

  ::v-deep {
    .sf-link {
      pointer-events: none;
      cursor: default;
    }
  }

  .sf-price {
    align-items: flex-start;
    flex-direction: column;
  }

  &__remove {
    position: static;
  }

  @include for-desktop {
    --collected-product-padding: var(--spacer-lg) 0;
    --collected-product-title-font-size: var(--font-base);

    .sf-price {
      flex-direction: row;
    }

    ::v-deep &__details {
      flex-grow: 3;
    }

    ::v-deep &__actions {
      flex-grow: 1;
    }

  }

  @include for-mobile {
    --collected-product-remove-bottom: var(--spacer-sm);
  }
}
</style>
