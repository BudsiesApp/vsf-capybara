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

import { CART_ITEM_PRICE_DICTIONARY, GET_CART_ITEM_PRICE } from '@vue-storefront/core/modules/cart';
import CartItem from 'core/modules/cart/types/CartItem';
import getCartItemKey from 'src/modules/budsies/helpers/get-cart-item-key.function';
import { getCustomizationSystemCartItemThumbnail } from 'src/modules/customization-system';
import { PriceHelper } from 'src/modules/shared';

import { getCartItemOptions } from 'theme/helpers/get-cart-item-options.function';
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
    cartItemPriceDictionary (): Record<string, PriceHelper.ProductPrice> {
      return this.$store.getters[CART_ITEM_PRICE_DICTIONARY];
    },
    tableItems (): OrderContentItem[] {
      return this.cartItems.map((cartItem) => {
        const price: PriceHelper.ProductPrice = cartItem.checksum
          ? this.cartItemPriceDictionary[cartItem.checksum]
          : this.$store.getters[GET_CART_ITEM_PRICE](cartItem);
        const formattedPrice = PriceHelper.formatProductPrice(price);

        return {
          key: this.getCartItemKey(cartItem),
          thumbnail: this.getThumbnailForProduct(cartItem),
          name: cartItem.name,
          qty: cartItem.qty,
          customizations: cartItem.customizations,
          customizationState: cartItem.extension_attributes?.customization_state,
          specialPrice: formattedPrice.special,
          regularPrice: formattedPrice.regular,
          customOptions: getCartItemOptions(cartItem)
        }
      });
    }
  },
  methods: {
    getThumbnailForProduct (product: CartItem): string {
      const customizationSystemThumbnail = getCustomizationSystemCartItemThumbnail(product, this.imageHandlerService);

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
