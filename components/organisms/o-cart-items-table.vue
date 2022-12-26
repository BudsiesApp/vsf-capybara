<template>
  <o-products-base-table
    :should-show-header="shouldShowHeader"
    :table-items="tableItems"
  />
</template>

<script lang="ts">
import { PropType } from 'vue';
import { onlineHelper } from '@vue-storefront/core/helpers';
import { getThumbnailForProduct } from '@vue-storefront/core/modules/cart/helpers';

import { getCartItemPrice } from 'src/modules/shared';
import CartItem from 'core/modules/cart/types/CartItem';
import CartItemOption from 'core/modules/cart/types/CartItemOption';
import { ProductId } from 'src/modules/budsies';
import getCartItemKey from 'src/modules/budsies/helpers/get-cart-item-key.function';

import { ProductBaseTableItem } from '../interfaces/product-base-table-item.interface';

import OProductsBaseTable from './o-products-base-table.vue';

export default {
  name: 'OCartItemsTable',
  components: {
    OProductsBaseTable
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
    tableItems (): ProductBaseTableItem[] {
      return this.cartItems.map((cartItem) => {
        return {
          key: this.getCartItemKey(cartItem),
          thumbnail: this.getThumbnailForProduct(cartItem),
          name: cartItem.name,
          plushieName: cartItem.plushieName,
          plushieBreed: cartItem.plushieBreed,
          qty: cartItem.qty,
          customOptions: this.getProductOptions(cartItem),
          specialPrice: this.getProductSpecialPrice(cartItem),
          regularPrice: this.getProductRegularPrice(cartItem),
          bundleOptions: this.getBundleProductOptions(cartItem)
        }
      });
    }
  },
  methods: {
    getBundleProductOptions (product: CartItem) {
      if (!product.bundle_options ||
          product.bundle_options.length < 2 ||
          !product.product_option ||
          !product.product_option.extension_attributes ||
          !product.product_option.extension_attributes.bundle_options
      ) {
        return [];
      }

      let result: string[] = [];
      const productBundleOptions = product.product_option.extension_attributes.bundle_options;

      product.bundle_options.forEach(option => {
        // Hide Forevers simple products
        if (typeof product.id === 'number' &&
         [ProductId.FOREVERS_DOG, ProductId.FOREVERS_CAT, ProductId.FOREVERS_OTHER]
           .includes(product.id) &&
          option.title.toLowerCase() === 'product'
        ) {
          return;
        }

        if (!productBundleOptions.hasOwnProperty(option.option_id)) {
          return
        }

        const selections = productBundleOptions[option.option_id].option_selections;

        if (!selections) {
          return
        }

        selections.forEach(selection => {
          const productLink = option.product_links.find(productLink => +productLink.id === selection);

          if (!productLink || !productLink.product) {
            return;
          }

          result.push(productLink.product.name);
        });
      });

      return result;
    },
    getProductOptions (product: CartItem): CartItemOption[] {
      return onlineHelper.isOnline && product.totals && product.totals.options
        ? product.totals.options
        : product.options || [];
    },
    getProductRegularPrice (product: CartItem): string {
      return getCartItemPrice(product, {}).regular;
    },
    getProductSpecialPrice (product: CartItem): string {
      return getCartItemPrice(product, {}).special;
    },
    getThumbnailForProduct (product: CartItem): string {
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
