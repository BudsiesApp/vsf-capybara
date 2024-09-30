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

import { getCartItemPrice } from 'src/modules/shared';
import CartItem from 'core/modules/cart/types/CartItem';
import getCartItemKey from 'src/modules/budsies/helpers/get-cart-item-key.function';
import { getCustomizationSystemCartItemThumbnail } from 'src/modules/customization-system';
import CampaignContent from 'src/modules/promotion-platform/types/CampaignContent.model';

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
    campaignContent (): CampaignContent | undefined {
      return this.$store.getters['promotionPlatform/campaignContent'];
    },
    tableItems (): OrderContentItem[] {
      const _ = this.campaignContent;
      return this.cartItems.map((cartItem) => {
        return {
          key: this.getCartItemKey(cartItem),
          thumbnail: this.getThumbnailForProduct(cartItem),
          name: cartItem.name,
          qty: cartItem.qty,
          customizations: cartItem.customizations,
          customizationState: cartItem.extension_attributes?.customization_state,
          specialPrice: this.getProductSpecialPrice(cartItem),
          regularPrice: this.getProductRegularPrice(cartItem),
          customOptions: getCartItemOptions(cartItem)
        }
      });
    }
  },
  methods: {
    getProductRegularPrice (product: CartItem): string {
      return getCartItemPrice(product, {}).regular;
    },
    getProductSpecialPrice (product: CartItem): string {
      return getCartItemPrice(product, {}).special;
    },
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
