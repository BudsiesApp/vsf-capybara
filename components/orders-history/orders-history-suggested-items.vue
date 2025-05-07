<template>
  <div class="orders-history-suggested-items" v-if="showSuggestedItems">
    <SfHeading :level="4" :title="$t('Related products')" class="_heading" />

    <div class="_products">
      <o-product-card
        v-for="product in products"
        :key="product.id"
        :product="product"
        :link="product.landing_page_url ? product.landing_page_url : undefined"
        link-tag="router-link"
        :wishlist-icon="false"
        :image-width="128"
        :image-height="128"
        class="products__product-card _product"
        @click.native.capture="() => onProductCardClicked(product)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onBeforeMount } from '@vue/composition-api';
import { SfHeading } from '@storefront-ui/vue';
import { SearchQuery } from 'storefront-query-builder';

import config from 'config';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'
import { PriceHelper } from '@vue-storefront/core/helpers';
import { PRODUCT_PRICE_DICTIONARY } from '@vue-storefront/core/modules/catalog/types/ProductGetters';
import Product from '@vue-storefront/core/modules/catalog/types/Product';
import { FETCH_SUGGESTED_PRODUCTS_ACTION, SUGGESTED_PRODUCTS_IDS_GETTER } from 'src/modules/orders-history';
import { ProductEvent } from 'src/modules/shared';

import { prepareCategoryProduct } from 'theme/helpers';

import OProductCard from 'theme/components/organisms/o-product-card.vue';

function getSearchQuery (ids: number[]) {
  let productsQuery = new SearchQuery()
  productsQuery = productsQuery
    .applyFilter({ key: 'id', value: { 'in': ids } })
    .applyFilter({ key: 'status', value: { 'in': [1] } });

  if (config.products.listOutOfStockProducts === false) {
    productsQuery = productsQuery.applyFilter({ key: 'stock.is_in_stock', value: { 'eq': true } });
  }

  return productsQuery;
}

const CATEGORY_ID = 'Related Products';

export default defineComponent({
  name: 'OrdersHistorySuggestedItems',
  components: {
    OProductCard,
    SfHeading
  },
  setup (_, { root }) {
    const isDataLoading = ref<boolean>(false);
    const productBySkuDictionary = computed<Record<string, Product>>(() => {
      return root.$store.getters['product/getProductBySkuDictionary'];
    });
    const suggestedProductsIds = computed<number[]>(() => {
      return root.$store.getters[SUGGESTED_PRODUCTS_IDS_GETTER];
    });
    const productPriceDictionary = computed<Record<string, PriceHelper.ProductPrice>>(() => {
      return root.$store.getters[PRODUCT_PRICE_DICTIONARY]
    });

    const products = computed<any[]>(() => {
      const list: any[] = [];
      const _productPriceDictionary = productPriceDictionary.value;

      for (const id of suggestedProductsIds.value) {
        const product = Object.values(productBySkuDictionary.value).find((product) => product.id === id);

        if (!product) {
          continue;
        }

        const preparedProduct = {
          ...prepareCategoryProduct(product, _productPriceDictionary),
          landing_page_url: product.landing_page_url
        }

        list.push(preparedProduct);
      }

      return list;
    });

    async function loadData (): Promise<void> {
      isDataLoading.value = true;

      const productsIds: number[] = await root.$store.dispatch(FETCH_SUGGESTED_PRODUCTS_ACTION);
      let notExistingProductsIds: number[] = [];

      for (const id of productsIds) {
        const loadedProduct = Object.values(productBySkuDictionary.value).find((product) => product.id === id);

        if (loadedProduct) {
          continue;
        }

        notExistingProductsIds.push(id);
      }

      if (notExistingProductsIds.length > 0) {
        await root.$store.dispatch('product/findProducts', {
          query: getSearchQuery(notExistingProductsIds),
          options: {
            prefetchGroupProducts: false
          }
        });
      }

      isDataLoading.value = false;
    }

    const showSuggestedItems = computed<boolean>(() => {
      return !isDataLoading.value && products.value.length > 0;
    });

    function onProductCardClicked (
      product: Product
    ) {
      EventBus.$emit(
        ProductEvent.PRODUCT_CARD_CLICK,
        {
          product,
          categoryName: CATEGORY_ID,
          categoryId: CATEGORY_ID
        }
      )
    }

    onBeforeMount(() => {
      void loadData();
    });

    return {
      isDataLoading,
      onProductCardClicked,
      products,
      showSuggestedItems
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

$mobile-max-products-count: 4;
$desktop-max-products-count: 5;

.orders-history-suggested-items {
  ._products {
    display: grid;
    grid-template-columns: repeat($desktop-max-products-count, 1fr);
    margin-top: var(--spacer-sm);
  }

  ._heading {
    --heading-title-font-weight: bold;

    text-align: start;
  }

  ._product {
    --o-product-card-badge-size: 48px;

    max-width: 160px;

    &:nth-child(n+#{$desktop-max-products-count + 1}) {
      display: none;
    }

    ::v-deep {
      .sf-badge {
        z-index: 2;
      }

      .base-image {
        width: 100%;
      }

      .sf-price {
        flex-wrap: wrap;
      }
    }
  }

  @media (max-width: $mobile-max) {
    ._products {
      grid-template-columns: repeat($mobile-max-products-count, 1fr);
    }

    ._product {
      &:nth-child(n+#{$mobile-max-products-count + 1}) {
        display: none;
      }
    }
  }
}

</style>
