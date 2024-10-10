<template>
  <div
    class="storyblok-product layout-regular-component"
    :class="cssClasses"
    v-if="product"
  >
    <editor-block-icons :item="itemData" />

    <router-link
      class=""
      :to="link"
    >
      <div
        class="_product-image"
      >
        <product-image
          :image="thumbnailObj"
          :alt="name | htmlDecode"
          :calc-ratio="false"
        />
      </div>

      <p class="">
        {{ name | htmlDecode }}
      </p>

      <span class="">{{ formattedPrice }}</span>
    </router-link>
  </div>
</template>

<script lang="ts">
import { productThumbnailPath } from '@vue-storefront/core/helpers';
import { currentStoreView } from '@vue-storefront/core/lib/multistore';
import { formatProductLink } from '@vue-storefront/core/modules/url/helpers';
import ProductImage from '../core/ProductImage.vue';
import { LocalizedRoute, StoreView } from 'core/lib/types';
import config from 'config';
import Product from 'core/modules/catalog/types/Product';
import { Blok } from 'src/modules/vsf-storyblok-module/components';
import { PriceHelper } from 'src/modules/shared';

import ProductData from './interfaces/product-data.interface';
import getProductImagePlaceholder from '@vue-storefront/core/modules/cart/helpers/getProductImagePlaceholder';
import { formatPrice, getFinalPrice } from 'src/modules/shared/helpers/price';

export default Blok.extend({
  name: 'StoryblokProductBlock',
  components: {
    ProductImage
  },
  data: function () {
    return {
      placeholder: getProductImagePlaceholder(),
      product: undefined as Product | undefined
    }
  },
  computed: {
    productPriceDictionary (): Record<string, PriceHelper.ProductPrice> {
      return this.$store.getters['product/productPriceDictionary'];
    },
    itemData (): ProductData {
      return this.item as ProductData;
    },
    currentStoreView (): () => StoreView {
      return currentStoreView;
    },
    price (): number | undefined {
      if (!this.product) {
        return undefined;
      }

      const price = this.productPriceDictionary[this.product.id];

      return getFinalPrice(price);
    },
    formattedPrice (): string {
      if (!this.price) {
        return '';
      }

      return formatPrice(this.price);
    },
    name (): string {
      if (!this.product) {
        return ''
      }
      return this.product.name
    },
    link (): string | LocalizedRoute {
      if (!this.product) {
        return ''
      }

      if (!this.product.slug) {
        return '';
      }

      return formatProductLink(this.product, currentStoreView().storeCode)
    },
    thumbnail (): string {
      if (!this.product) {
        return ''
      }
      let thumbnail = productThumbnailPath(this.product)

      // TODO: Figure out correct type definition
      return (this as any).getThumbnail(thumbnail, config.products.thumbnails.width, config.products.thumbnails.height)
    },
    thumbnailObj (): {src: string, loading: string, error: string} {
      return {
        src: this.thumbnail,
        loading: this.placeholder,
        error: this.placeholder
      }
    }
  },
  created: async function (): Promise<void> {
    if (this.product) {
      return
    }

    await this.loadData()
  },
  methods: {
    async loadData () {
      this.product = await this.$store.dispatch(
        'product/single',
        {
          options: {
            id: this.itemData.product_id
          },
          key: 'id',
          skipCache: true
        }
      )
    }
  },
  watch: {
    item: async function () {
      await this.loadData()
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "src/modules/vsf-storyblok-module/components/defaults/mixins";

.storyblok-product {
  display: flex;
  justify-content: center;

  ._product-image {
    background-color: #f2f2f2;

    img {
      position: relative;
      top: 0;
      left: 0;
      transform: none;
    }

    .product-image {
      width: auto;
      height: auto;
    }
  }

  @include display-property-handling;
}
</style>
