<template>
  <div
    class="product-grid-renderer grid"
    :class="cssClasses"
  >
    <div
      v-for="product in preparedProducts"
      :key="product.id"
      class="_item"
    >
      <o-product-card
        :product="product"
        :link="product.link"
        link-tag="router-link"
        :wishlist-icon="false"
        class="_component"
        :image-height="352"
        :image-width="352"
        @click.native.capture="() => onProductCardClick(product.sku)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from '@vue/composition-api';

import Product from 'core/modules/catalog/types/Product';
import { PRODUCT_LOCALIZED_PRICE_DICTIONARY } from '@vue-storefront/core/modules/catalog'
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { Currency, GET_ACTIVE_CURRENCY } from 'src/modules/currency'
import { ProductEvent, PriceHelper } from 'src/modules/shared';
import { ColumnsCountField, SizeValue } from 'src/modules/vsf-storyblok-module';

import { prepareCategoryProduct } from 'theme/helpers'

import OProductCard from 'theme/components/organisms/o-product-card.vue';

export default defineComponent({
  name: 'ProductGridRenderer',
  components: {
    OProductCard
  },
  props: {
    products: {
      type: Array as PropType<Product[]>,
      required: true
    },
    columnsCount: {
      type: Object as PropType<ColumnsCountField>,
      required: true
    },
    contextName: {
      type: String,
      default: ''
    }
  },
  setup (props, { root }) {
    const productBySkuDictionary = computed<Record<string, Product>>(() => {
      return root.$store.getters['product/getProductBySkuDictionary'];
    });

    const productPriceDictionary = computed<Record<string, PriceHelper.ProductPrice>>(() => {
      return root.$store.getters[PRODUCT_LOCALIZED_PRICE_DICTIONARY];
    });
    const selectedCurrency = computed<Currency>(() => {
      return root.$store.getters[GET_ACTIVE_CURRENCY];
    });

    const preparedProducts = computed<ReturnType<typeof prepareCategoryProduct>[]>(() => {
      const products: ReturnType<typeof prepareCategoryProduct>[] = [];

      const _productPriceDictionary = productPriceDictionary.value;
      const _selectedCurrency = selectedCurrency.value;

      for (const product of props.products) {
        if (
          !product.landing_page_url &&
          !['simple', 'configurable'].includes(product.type_id)
        ) {
          continue;
        }

        const preparedProduct = prepareCategoryProduct(
          product,
          _productPriceDictionary,
          _selectedCurrency
        );

        if (product.landing_page_url) {
          preparedProduct.link = product.landing_page_url;
        } else if (typeof preparedProduct.link === 'object') {
          preparedProduct.link = preparedProduct.link.fullPath || root.$router.resolve(preparedProduct.link).href;
        }

        products.push(preparedProduct);
      }

      return products;
    });

    const contextName = computed(() => {
      if (props.contextName) {
        return props.contextName;
      }

      return root.$route.path;
    });

    function onProductCardClick (productSku: string): void {
      const product = productBySkuDictionary.value[productSku];

      EventBus.$emit(
        ProductEvent.PRODUCT_CARD_CLICK,
        {
          product,
          categoryName: contextName.value,
          categoryId: contextName.value
        }
      );
    }

    const cssClasses = computed<string[]>(() => {
      const result: string [] = [];
      const classPrefix = '-columns-';
      const sizes: Record<SizeValue, string> = {
        [SizeValue.xsmall]: '',
        [SizeValue.small]: 'sm-',
        [SizeValue.medium]: 'md-',
        [SizeValue.large]: 'lg-',
        [SizeValue.xlarge]: 'xlg-'
      }

      for (const field in sizes) {
        const sizeKey = field as SizeValue;
        const prefix = sizes[sizeKey];
        const value = props.columnsCount[sizeKey];

        if (!value) {
          continue;
        }

        result.push(classPrefix + prefix + value);
      }

      return result;
    });

    return {
      cssClasses,
      preparedProducts,
      onProductCardClick
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "src/modules/vsf-storyblok-module/components/defaults/mixins";

.grid {
  $sizes: (
    '': 0px,
    '-sm': 480px,
    '-md': $tablet-min,
    '-lg': $desktop-min,
    '-xlg': $desktop-l-min,
  );

  $default-grid-gap: 0.7rem;
  $default-grid-gap-tablet: 1.3rem;

  display: grid;
  grid-gap: $default-grid-gap;

  ._item {
    @include storyblok-reset-margins-for-transparent-containers();
    @include display-property-handling;

    display: flex;
    justify-content: center;
  }

  ._component {
    margin-bottom: 0;
    margin-top: 0;
    max-width: 100%;
  }

  @each $size, $breakpoint in $sizes {
    @media (min-width: $breakpoint) {
      @for $i from 1 through 12 {
        &.-columns#{$size}-#{$i} {
          grid-template-columns: repeat($i, minmax(0, 1fr));

          @if ($i > 1) {
            grid-gap: if($breakpoint < $tablet-min, $default-grid-gap, $default-grid-gap-tablet);
          } @else {
            grid-gap: 2em;
          }
        }

        ._item.-span#{$size}-#{$i} {
          grid-column: span $i;
        }
      }
    }
  }

  @media (min-width: $tablet-min) {
    @for $i from 2 through 12 {
      &.-columns-#{$i} {
        grid-gap: $default-grid-gap-tablet;
      }

      &.-columns-sm-#{$i} {
        grid-gap: $default-grid-gap-tablet;
      }
    }
  }

  &.-cards-mode {
    grid-gap: $default-grid-gap;

    > ._item {
      padding: 15px;
    }
  }

  @media (min-width: $tablet-min) {
    grid-gap: $default-grid-gap-tablet;

    &.-cards-mode {
      grid-gap: $default-grid-gap;
    }
  }
}
</style>
