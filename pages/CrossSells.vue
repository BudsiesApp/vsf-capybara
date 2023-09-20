<template>
  <div id="cross-sells" :class="skinClass">
    <div class="_actions-container">
      <header class="sf-heading">
        <h2 class="sf-heading__title">
          {{ $t('Other custom gifts you might like') }}
        </h2>
      </header>
      <SfButton class="sf-button actions__button" @click="goToCart">
        {{ $t('Continue to cart') }}
      </SfButton>
    </div>

    <div class="_cross-sells-list" v-if="crossSellsProducts.length">
      <div class="products">
        <transition-group
          appear
          name="products__slide"
          tag="div"
          class="products__grid"
        >
          <o-product-card
            v-for="crossSellsProduct in preparedCrossSellsProducts"
            :key="crossSellsProduct.id"
            :product="crossSellsProduct"
            :link="crossSellsProduct.landing_page_url ? crossSellsProduct.landing_page_url : undefined"
            link-tag="router-link"
            :wishlist-icon="false"
            class="products__product-card"
            :image-height="352"
            :image-width="352"
            @click.native="() => onProductCardClick(crossSellsProduct.sku, 'Cross Sells')"
          />
        </transition-group>
      </div>
    </div>

    <div class="_up-sells-list" v-if="preparedUpSellsProducts.length">
      <header class="sf-heading">
        <h2 class="sf-heading__title">
          {{ upSellsTitle }}
        </h2>
      </header>
      <div class="products">
        <transition-group
          appear
          name="products__slide"
          tag="div"
          class="products__grid"
        >
          <o-product-card
            v-for="upSellsProduct in preparedUpSellsProducts"
            :key="upSellsProduct.id"
            :product="upSellsProduct"
            :link="upSellsProduct.landing_page_url ? upSellsProduct.landing_page_url : undefined"
            link-tag="router-link"
            :wishlist-icon="false"
            class="products__product-card"
            :image-height="352"
            :image-width="352"
            @click.native="() => onProductCardClick(upSellsProduct.sku, 'Up Sells')"
          />
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import config from 'config';
import { SearchQuery } from 'storefront-query-builder';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'
import { localizedRoute } from '@vue-storefront/core/lib/multistore';
import Product from 'core/modules/catalog/types/Product';
import { SfButton } from '@storefront-ui/vue';
import OProductCard from 'theme/components/organisms/o-product-card.vue';
import { prepareCategoryProduct } from 'theme/helpers';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import getCurrentThemeClass from 'theme/helpers/get-current-theme-class';
import isCustomProduct from 'src/modules/shared/helpers/is-custom-product.function';
import { ProductEvent } from 'src/modules/shared';

const selfiesSkus = [
  'CustomSelfie_bundle',
  'selfiesPuppet_bundle'
]

export default Vue.extend({
  name: 'CrossSells',
  props: {
    parentSku: {
      type: String,
      required: true
    }
  },
  components: {
    SfButton,
    OProductCard
  },
  computed: {
    crossSellsProducts (): any[] {
      if (!this.getCurrentProduct) {
        return [];
      }

      const skus = this.getProductLinkSkusByType('crosssell');

      return this.getSellsProductsBySkus(skus);
    },
    preparedCrossSellsProducts (): any[] {
      return this.crossSellsProducts.map(
        (item: Product) => (
          {
            ...prepareCategoryProduct(item),
            landing_page_url: item.landing_page_url
          }
        )
      )
    },
    upSellsProducts (): any[] {
      if (!this.getCurrentProduct) {
        return [];
      }

      const skus = this.getProductLinkSkusByType('upsell');

      return this.getSellsProductsBySkus(skus);
    },
    preparedUpSellsProducts (): any[] {
      return this.upSellsProducts.map(
        (item: Product) => (
          {
            ...prepareCategoryProduct(item),
            landing_page_url: item.landing_page_url
          }
        )
      )
    },
    getCurrentProduct (): Product | null {
      return this.getProductBySkuDictionary[this.parentSku];
    },
    getProductBySkuDictionary (): Record<string, Product> {
      return this.$store.getters['product/getProductBySkuDictionary'];
    },
    skinClass (): string {
      return getCurrentThemeClass();
    },
    upSellsTitle (): string {
      if (!this.getCurrentProduct) {
        return '';
      }

      return (
        selfiesSkus.includes(this.getCurrentProduct.sku)
          ? this.$t('Selfies Accessories')
          : this.$t('Budsies Accessories')
      ).toString();
    }
  },
  async serverPrefetch (): Promise<void> {
    return (this as any).loadData();
  },
  async beforeMount (): Promise<void> {
    await this.loadData();

    if (!this.crossSellsProducts.length && !this.upSellsProducts.length) {
      this.redirectToCart();
      return;
    }

    this.onAfterListsShow();
  },
  beforeRouteLeave (to, from, next) {
    this.$store.commit(`product/${PRODUCT_UNSET_CURRENT}`);
    next();
  },
  methods: {
    onAfterListsShow (): void {
      if (this.crossSellsProducts.length) {
        EventBus.$emit(
          ProductEvent.PRODUCT_LIST_SHOW,
          {
            products: this.crossSellsProducts,
            categoryName: 'Cross Sells',
            categoryId: this.parentSku
          }
        );
      }

      if (this.upSellsProducts.length) {
        EventBus.$emit(
          ProductEvent.PRODUCT_LIST_SHOW,
          {
            products: this.upSellsProducts,
            categoryName: 'Up Sells',
            categoryId: this.parentSku
          }
        );
      }
    },
    getProductLinkSkusByType (type: string): string[] {
      if (!this.getCurrentProduct) {
        return [];
      }

      if (!this.getCurrentProduct.product_links) {
        return [];
      }

      const productLinks = this.getCurrentProduct.product_links;

      if (productLinks.length === 0) {
        return [];
      }

      const skus = productLinks
        .filter(productLink => productLink.link_type === type)
        .map(productLink => productLink.linked_product_sku);

      return skus;
    },
    getSellsProductsBySkus (skus: string[]): any[] {
      let products: Product[] = [];

      for (const sku of skus) {
        for (const key in this.getProductBySkuDictionary) {
          const product = this.getProductBySkuDictionary[key];

          if (!product.id) {
            continue;
          }

          // VSF replace sku with it's default variant SKU for configurable and bundle products
          // So as workaround better to use parentSku instead sku to compare
          const isSkusListIncludesProduct = product.parentSku === sku;
          const hasLandingPage = !!product.landing_page_url || !isCustomProduct(+product.id);

          if (
            isSkusListIncludesProduct &&
            hasLandingPage
          ) {
            products.push(this.getProductBySkuDictionary[key]);
            break;
          }
        }
      }

      return products;
    },
    getSearchQuery (skus: string[]) {
      let productsQuery = new SearchQuery()
      productsQuery = productsQuery
        .applyFilter({ key: 'sku', value: { 'in': skus } })
        .applyFilter({ key: 'status', value: { 'in': [1] } });

      if (config.products.listOutOfStockProducts === false) {
        productsQuery = productsQuery.applyFilter({ key: 'stock.is_in_stock', value: { 'eq': true } });
      }

      return productsQuery;
    },
    async loadProductsList (type: string): Promise<void> {
      if (!this.getCurrentProduct) {
        return;
      }

      const skus = this.getProductLinkSkusByType(type);

      let notExistingProductsSkus: string[] = [];

      for (const sku of skus) {
        let productFound = false;

        for (const key in this.getProductBySkuDictionary) {
          if (this.getProductBySkuDictionary[key].parentSku === sku) {
            productFound = true;

            break;
          }
        }

        if (productFound) {
          continue;
        }

        notExistingProductsSkus.push(sku);
      }

      if (notExistingProductsSkus.length === 0) {
        return;
      }

      await this.$store.dispatch('product/findProducts', {
        query: this.getSearchQuery(notExistingProductsSkus),
        options: {
          prefetchGroupProducts: false
        }
      });
    },
    async loadCrossSellsProducts () {
      await this.loadProductsList('crosssell');
    },
    async loadUpSellsProducts () {
      await this.loadProductsList('upsell');
    },
    async loadData (): Promise<void> {
      if (!this.getCurrentProduct) {
        await this.$store.dispatch(
          'product/loadProduct',
          {
            parentSku: (this as any).parentSku,
            setCurrent: false
          }
        );
      }

      await Promise.all([
        (this as any).loadCrossSellsProducts(),
        (this as any).loadUpSellsProducts()
      ]);
    },
    goToCart (): void {
      this.$router.push(localizedRoute({ name: 'detailed-cart' }));
    },
    redirectToCart (): void {
      this.$router.replace(localizedRoute({ name: 'detailed-cart' }));
    },
    onProductCardClick (
      productSku: string,
      listName: 'Cross Sells' | 'Up Sells'
    ): void {
      const product = this.getProductBySkuDictionary[productSku];

      EventBus.$emit(
        ProductEvent.PRODUCT_CARD_CLICK,
        {
          product,
          categoryName: listName,
          categoryId: this.parentSku
        }
      )
    }
  },
  watch: {
    async parentSku (): Promise<void> {
      await this.loadData();

      if (!this.crossSellsProducts.length && !this.upSellsProducts.length) {
        this.redirectToCart();
        return;
      }

      this.onAfterListsShow();
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "theme/css/mixins/wave.scss";

#cross-sells {
  box-sizing: border-box;

  .sf-heading {
    margin: 2em 0;
  }

  ._actions-container {
    text-align: center;
    margin-top: 1em;

    .sf-button {
      display: inline-block;
    }
  }

  ._cross-sells-list,
  ._up-sells-list {
    margin: var(--spacer-xl) 0;
  }

  .products {
    box-sizing: border-box;
    flex: 1;
    margin: 0;
    max-width: 100%;

    &::v-deep {
      .sf-product-card {
        --image-width: 100%;

        margin: 0 auto;
        height: 100%;
      }
    }

    &__grid,
    &__list {
      display: flex;
      flex-wrap: wrap;
    }
    &__grid {
      justify-content: space-between;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(46%, 1fr));
      row-gap: calc(var(--spacer-sm) + var(--spacer-xs));
      column-gap: calc(var(--spacer-sm) + var(--spacer-xs));
      padding: 0 calc(var(--spacer-sm) + var(--spacer-xs));
    }
    &__product-card {
      --product-card-max-width: 15rem;
      flex: 1 1 50%;
    }
    &__product-card-horizontal {
      flex: 0 0 100%;
    }
    &__slide-enter {
      opacity: 0;
      transform: scale(0.5);
    }
    &__slide-enter-active {
      transition: all 0.2s ease;
      transition-delay: calc(0.1s * var(--index));
    }
  }

  &.-skin-budsies {
    ._cross-sells-list {
      padding: var(--spacer-lg) 0;
      background-color: #f5f6de;

      @include wave-section;
    }
  }

  @media (min-width: $tablet-min) {
    .products {
      &__grid {
        grid-template-columns: repeat(auto-fit, minmax(31%, 1fr));
      }

      &__product-card {
        flex: 1 1 33%;
      }
    }
  }

  @include for-desktop {
    .products {
      max-width: 1272px;
      margin: var(--spacer-sm) auto;
      padding: 2em 0;

      &__grid {
        grid-template-columns: repeat(auto-fit, minmax(23%, 1fr));
      }

      &__pagination {
        display: flex;
        justify-content: center;
        margin: var(--spacer-xl) 0 0 0;
      }
      &__product-card-horizontal {
        margin: var(--spacer-lg) 0;
      }
      &__product-card {
        flex: 1 1 25%;
      }
      &__list {
        margin: 0 0 0 var(--spacer-sm);
      }
    }

    ._cross-sells-list {
      background: #e3f9ff;
    }

    &.-skin-budsies {
      ._cross-sells-list {
        padding: 0;
      }
    }
  }

  @media (min-width: $desktop-l-min) {
    .products {
      &__grid {
        grid-template-columns: repeat(auto-fit, minmax(18%, 1fr));
      }

      &__product-card {
        flex: 1 1 20%;
      }
    }
  }
}
</style>
