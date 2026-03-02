<template>
  <div class="orders-history-suggested-items" v-if="showSuggestedItems">
    <div class="_heading-container">
      <SfHeading :level="4" :title="$t('Enjoy a little something while perfection is crafted')" class="_heading" />

      <SfButton
        v-if="showToggleMoreButton"
        class="sf-button--text"
        @click="onToggleMoreButtonClicked"
      >
        {{ toggleMoreButtonText }}
      </SfButton>
    </div>

    <div
      class="_products"
      :class="{'-minimized': !isListExpanded}"
    >
      <o-product-card
        v-for="product in products"
        :key="product.id"
        :product="product"
        :link="product.landing_page_url"
        link-tag="router-link"
        :wishlist-icon="false"
        :image-width="144"
        :image-height="144"
        :turnaround-time="product.turnaroundTime"
        class="products__product-card _product"
        @click.native.capture="() => onProductCardClicked(product)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onBeforeMount } from '@vue/composition-api';
import { SfButton, SfHeading } from '@storefront-ui/vue';
import { SearchQuery } from 'storefront-query-builder';

import config from 'config';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'
import { PriceHelper } from '@vue-storefront/core/helpers';
import { PRODUCT_LOCALIZED_PRICE_DICTIONARY } from '@vue-storefront/core/modules/catalog/types/ProductGetters';
import Product from '@vue-storefront/core/modules/catalog/types/Product';
import { Currency, GET_ACTIVE_CURRENCY } from 'src/modules/currency';
import { FETCH_SUGGESTED_PRODUCTS_ACTION, SUGGESTED_PRODUCTS_IDS_GETTER } from 'src/modules/orders-history';
import { isCustomProduct, ProductEvent, useMobileObserver } from 'src/modules/shared';

import { prepareCategoryProduct } from 'theme/helpers';

import OProductCard from 'theme/components/organisms/o-product-card.vue';

function getSearchQuery (ids: number[]) {
  let productsQuery = new SearchQuery()
  productsQuery = productsQuery
    .applyFilter({ key: 'id', value: { 'in': ids } })
    .applyFilter({ key: 'status', value: { 'in': [1] } });

  if (!config.products.listOutOfStockProducts) {
    productsQuery = productsQuery.applyFilter({ key: 'stock.is_in_stock', value: { 'eq': true } });
  }

  return productsQuery;
}

const CATEGORY_ID = 'Related Products';

const SUGGESTED_PRODUCTS_TO_FETCH_COUNT = 20;

const MOBILE_PRODUCTS_COUNT = 4;
const DESKTOP_PRODUCTS_COUNT = 5;

export default defineComponent({
  name: 'OrdersHistorySuggestedItems',
  components: {
    OProductCard,
    SfButton,
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
      return root.$store.getters[PRODUCT_LOCALIZED_PRICE_DICTIONARY]
    });
    const selectedCurrency = computed<Currency>(() => {
      return root.$store.getters[GET_ACTIVE_CURRENCY];
    });

    const products = computed<any[]>(() => {
      const list: any[] = [];
      const _productPriceDictionary = productPriceDictionary.value;
      const _selectedCurrency = selectedCurrency.value;

      for (const id of suggestedProductsIds.value) {
        const product = Object.values(productBySkuDictionary.value).find((product) => product.id === id);

        if (!product) {
          continue;
        }

        const hasLandingPage = !!product.landing_page_url || !isCustomProduct(+product.id);

        if (!hasLandingPage) {
          continue;
        }

        const preparedProduct = {
          ...prepareCategoryProduct(product, _productPriceDictionary, _selectedCurrency),
          landing_page_url: product.landing_page_url,
          turnaroundTime: product.turnaround_time
        }

        list.push(preparedProduct);
      }

      return list;
    });

    async function loadData (): Promise<void> {
      isDataLoading.value = true;

      const productsIds: number[] = await root.$store.dispatch(
        FETCH_SUGGESTED_PRODUCTS_ACTION,
        { pageSize: SUGGESTED_PRODUCTS_TO_FETCH_COUNT }
      );

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

    const { isMobile } = useMobileObserver();

    const showSuggestedItems = computed<boolean>(() => {
      return !isDataLoading.value && products.value.length > 0;
    });

    const showExpandedView = ref<boolean>(false);
    const showToggleMoreButton = computed<boolean>(() => {
      const maxProductsCount = isMobile.value ? MOBILE_PRODUCTS_COUNT : DESKTOP_PRODUCTS_COUNT

      return products.value.length > maxProductsCount;
    });

    const isListExpanded = computed<boolean>(() => {
      return showToggleMoreButton.value && showExpandedView.value;
    });

    const toggleMoreButtonText = computed<string>(() => {
      return isListExpanded.value
        ? root.$t('Show less').toString()
        : root.$t('Show more').toString();
    });

    function onToggleMoreButtonClicked () {
      showExpandedView.value = !showExpandedView.value;
    }

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
      isListExpanded,
      onProductCardClicked,
      onToggleMoreButtonClicked,
      products,
      showSuggestedItems,
      showToggleMoreButton,
      toggleMoreButtonText
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
    margin-top: var(--spacer-lg);
    column-gap: var(--spacer-sm);

    &.-minimized {
      ._product {
        &:nth-child(n+#{$desktop-max-products-count + 1}) {
          display: none;
        }
      }
    }
  }

  ._heading-container {
    display: flex;
    justify-content: space-between;
    column-gap: var(--spacer-sm);
  }

  ._heading {
    --heading-title-font-weight: bold;

    text-align: start;
  }

  ._product {
    --o-product-card-badge-size: 48px;
    --product-card-title-font-size: var(--font-size-base);
    --price-regular-font-size: var(--font-size-base);
    --price-special-font-size: var(--font-size-base);
    --price-old-font-size: var(--font-size-base);
    --product-card-title-font-line-height: 1.2;
    --product-card-height: 100%;

    ::v-deep {
      .sf-product-card {
        --product-card-padding: var(--spacer-xs);
      }

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

      &.-minimized {
        ._product {
          &:nth-child(n+#{$mobile-max-products-count + 1}) {
            display: none;
          }
        }
      }
    }
  }

  @media (max-width: 512px) {
    ._products {
      grid-template-columns: repeat($mobile-max-products-count - 1, 1fr);
      column-gap: var(--spacer-xs);
      margin-top: var(--spacer-sm);

      &.-minimized {
        ._product {
          &:nth-child(n+#{$mobile-max-products-count}) {
            display: none;
          }
        }
      }

      ::v-deep {
        .base-image {
          margin: 0 auto;
          display: block;
        }
      }
    }
  }

  @media (max-width: 400px) {
    ._products {
      grid-template-columns: repeat($mobile-max-products-count - 2, 1fr);

      &.-minimized {
        ._product {
          &:nth-child(n+#{$mobile-max-products-count - 1}) {
            display: none;
          }
        }
      }
    }
  }
}

</style>
