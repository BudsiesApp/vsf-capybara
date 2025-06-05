<template>
  <SfCarousel
    class="m-product-carousel"
    :settings="{
      rewind: false,
      type: 'slider',
      breakpoints: {
        768: {
          perView: 2,
          peek: {
            before: 0,
            after: 50,
          },
        },
        1023: {
          perView: 3,
          peek: {
            before: 0,
            after: 0,
          },
        }
      }
    }"
  >
    <SfCarouselItem v-for="(product, i) in carouselProducts" :key="i">
      <o-product-card
        :product="product"
        :wishlist-icon="false"
        link-tag="router-link"
        :image-height="216"
        :image-width="216"
      />
    </SfCarouselItem>
  </SfCarousel>
</template>
<script>
import { SfCarousel } from '@storefront-ui/vue';

import { PRODUCT_LOCALIZED_PRICE_DICTIONARY } from '@vue-storefront/core/modules/catalog';
import { GET_SELECTED_CURRENCY } from 'src/modules/currency';

import { prepareCategoryProduct } from 'theme/helpers';
import OProductCard from 'theme/components/organisms/o-product-card';

export default {
  name: 'MProductCarousel',
  components: {
    OProductCard,
    SfCarousel
  },
  props: {
    products: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    productPriceDictionary () {
      return this.$store.getters[PRODUCT_LOCALIZED_PRICE_DICTIONARY];
    },
    selectedCurrency () {
      return this.$store.getters[GET_SELECTED_CURRENCY];
    },
    carouselProducts () {
      return this.products.map(
        (product) => prepareCategoryProduct(
          product,
          this.productPriceDictionary,
          this.selectedCurrency.symbol
        )
      );
    }
  }
};
</script>
