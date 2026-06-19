<template>
  <o-order-content
    :should-show-header="shouldShowHeader"
    :table-items="tableItems"
    class="desktop-only"
  />
</template>

<script lang="ts">
import { PropType } from 'vue';
import { getThumbnailForProduct } from '@vue-storefront/core/modules/cart/helpers';

import { CART_ITEM_LOCALIZED_PRICE_DICTIONARY } from '@vue-storefront/core/modules/cart';
import CartItem from 'core/modules/cart/types/CartItem';
import getCartItemKey from '@vue-storefront/core/modules/cart/helpers/get-cart-item-key.function';
import { Currency, GET_ACTIVE_CURRENCY } from 'src/modules/currency';
import { getCustomizationSystemThumbnail } from 'src/modules/customization-system';
import { PriceHelper } from 'src/modules/shared';

import { getCartItemOptions } from 'theme/helpers/get-cart-item-options.function';
import { getCartItemTitle } from 'theme/helpers/get-cart-item-title.function';
import { OrderContentItem } from '../interfaces/order-content-item.interface';

import OOrderContent from './o-order-content.vue';

export default {
  name: 'OCartItemsTable',
  inject: {
    imageHandlerService: { from: 'ImageHandlerService' }
  },
  components: {
    OOrderContent
  },
  props: {
    shouldShowHeader: {
      type: Boolean,
      default: true
    },
    cartItems: {
      type: Array as PropType<CartItem[]>,
      default: () => []
    }
  },
  data () {
    return {
      tableHeaders: [
        this.$t('Description'),
        this.$t('Quantity'),
        this.$t('Price')
      ]
    }
  },
  computed: {
    selectedCurrency (): Currency {
      return this.$store.getters[GET_ACTIVE_CURRENCY];
    },
    tableItems (): OrderContentItem[] {
      return this.cartItems.map((cartItem) => {
        const cartItemKey = this.getCartItemKey(cartItem);
        const price: PriceHelper.ProductPrice = this.$store.getters[CART_ITEM_LOCALIZED_PRICE_DICTIONARY][cartItemKey];
        const formattedPrice = PriceHelper.formatProductPrice(price, this.selectedCurrency.symbol);

        return {
          key: cartItemKey,
          thumbnail: this.getThumbnailForProduct(cartItem),
          name: getCartItemTitle(cartItem),
          qty: cartItem.qty,
          customizations: cartItem.customizations,
          customizationState: cartItem.extension_attributes?.customization_state,
          specialPrice: formattedPrice.special,
          regularPrice: formattedPrice.regular,
          customOptions: getCartItemOptions(cartItem),
          estimatedShipment: cartItem.extension_attributes?.estimated_shipment
        }
      });
    }
  },
  methods: {
    getThumbnailForProduct (product: CartItem): string {
      const customizationSystemThumbnail = getCustomizationSystemThumbnail(
        product.customizations,
        product.extension_attributes?.customization_state,
        this.imageHandlerService
      );

      if (customizationSystemThumbnail) {
        return customizationSystemThumbnail;
      }

      if (product.thumbnail && product.thumbnail.includes('://')) {
        return product.thumbnail;
      }

      return getThumbnailForProduct(product);
    },
    getCartItemKey (cartItem: CartItem): string {
      return getCartItemKey(cartItem);
    }
  }
}
</script>
