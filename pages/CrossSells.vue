<template>
  <div id="cross-sells" itemscope>
    <div class="_actions-container">
      <header class="sf-heading">
        <h2 class="sf-heading__title">
          Other pet gifts you might like
        </h2>
      </header>
      <SfButton class="sf-button actions__button" @click="goToCart">
        {{ $t("Continue to cart") }}
      </SfButton>
    </div>

    <div class="_cross-sells-list" v-if="showCrossSellsSection">
      <div class="products">
        <transition-group
          appear
          name="products__slide"
          tag="div"
          class="products__grid"
        >
          <o-product-card
            v-for="crossSellsProduct in crossSellsProducts"
            :key="crossSellsProduct.id"
            :product="crossSellsProduct"
            :link="crossSellsProduct.landing_page_url ? crossSellsProduct.landing_page_url : undefined"
            link-tag="router-link"
            :wishlist-icon="false"
            class="products__product-card"
            :image-height="352"
            :image-width="352"
          />
        </transition-group>
      </div>
    </div>

    <div class="_up-sells-list" v-if="showUpSellsSection">
      <header class="sf-heading">
        <h2 class="sf-heading__title">
          Accessorize Your Pet(sies)
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
            v-for="upSellsProduct in upSellsProducts"
            :key="upSellsProduct.id"
            :product="upSellsProduct"
            :link="upSellsProduct.landing_page_url ? upSellsProduct.landing_page_url : undefined"
            link-tag="router-link"
            :wishlist-icon="false"
            class="products__product-card"
            :image-height="352"
            :image-width="352"
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
import { localizedRoute } from '@vue-storefront/core/lib/multistore';
import Product, { ProductLink } from 'core/modules/catalog/types/Product';
import { SfButton } from '@storefront-ui/vue';
import { isServer } from '@vue-storefront/core/helpers'
import store from '@vue-storefront/core/store'

import { prepareCategoryProduct } from 'theme/helpers';

import OProductCard from 'theme/components/organisms/o-product-card.vue';

const getSearchQuery = (skus: string[]) => {
  let productsQuery = new SearchQuery()
  productsQuery = productsQuery
    .applyFilter({ key: 'sku', value: { 'in': skus } })
    .applyFilter({ key: 'status', value: { 'in': [1] } });
  if (config.products.listOutOfStockProducts === false) {
    productsQuery = productsQuery.applyFilter({ key: 'stock.is_in_stock', value: { 'eq': true } });
  }
  return productsQuery;
}

const getProductSkuFromProductLinks = (productLinks: ProductLink[], type: 'crosssell' | 'upsell'): string[] => {
  if (productLinks.length === 0) {
    return [];
  }

  let skus = productLinks
    .filter(productLink => productLink.link_type === type)
    .map(productLink => productLink.linked_product_sku)

  if (skus === null || (skus.length === 0)) {
    return [];
  }

  return skus;
}

const fetchProductsList = async (type: 'crosssell' | 'upsell'): Promise<Product[]> => {
  const currentProduct = store.getters['product/getCurrentProduct'];

  if (!currentProduct) {
    return [];
  }
  const productLinks = currentProduct && currentProduct.product_links ? currentProduct.product_links : [];

  const skus = getProductSkuFromProductLinks(productLinks, type);

  const { items } = await store.dispatch('product/findProducts', {
    query: getSearchQuery(skus)
  });

  return items.map((item: Product) => ({ ...prepareCategoryProduct(item), landing_page_url: item.landing_page_url }));
}

export default Vue.extend({
  name: 'CrossSells',
  components: {
    SfButton,
    OProductCard
  },
  data: function () {
    return {
      crossSellsProducts: [] as Product[],
      upSellsProducts: [] as Product[]
    }
  },
  computed: {
    getCurrentProduct (): Product | null {
      return this.$store.getters['product/getCurrentProduct']
    },
    showCrossSellsSection (): boolean {
      return this.crossSellsProducts.length > 0
    },
    showUpSellsSection (): boolean {
      return this.upSellsProducts.length > 0;
    }
  },
  async serverPrefetch () {
    await this.$store.dispatch('product/loadProduct', { parentSku: this.$route.params.parentSku });
    const [crossSellsProducts, upSellsProducts] = await Promise.all([
      fetchProductsList('crosssell'),
      fetchProductsList('upsell')
    ]);
    (this as any).crossSellsProducts = crossSellsProducts;
    (this as any).upSellsProducts = upSellsProducts;
  },
  async created () {
    if (isServer) {
      return;
    }

    this.crossSellsProducts = this.getProductsList('crosssell');
    this.upSellsProducts = this.getProductsList('upsell');
  },
  async beforeRouteEnter (to, from, next) {
    if (isServer) {
      next();
      return;
    }

    if (from && from.name && from.name !== to.name) {
      await store.dispatch('product/loadProduct', { parentSku: to.params.parentSku });
      await Promise.all([
        fetchProductsList('crosssell'),
        fetchProductsList('upsell')
      ]);
    }

    next();
  },
  methods: {
    productLinks (): ProductLink[] {
      if (!this.getCurrentProduct) {
        return [];
      }

      if (!this.getCurrentProduct.product_links) {
        return [];
      }

      return this.getCurrentProduct.product_links;
    },
    getProductsList (type: 'crosssell' | 'upsell'): any[] {
      if (!this.getCurrentProduct) {
        return [];
      }

      const productLinks = this.getCurrentProduct && this.getCurrentProduct.product_links ? this.getCurrentProduct.product_links : [];
      const skus = getProductSkuFromProductLinks(productLinks, type).sort((a, b) => a.toLowerCase() > b.toLowerCase() ? 1 : -1);
      const productsList: Product[] = Object.values(this.$store.getters['product/getProductBySkuDictionary']);

      const products: any = skus.map((sku) => {
        return productsList.find((product) => [product.sku, product.parentSku].includes(sku));
      }).filter((product) => !!product)

      return products.map((product: Product) => (
        {
          ...prepareCategoryProduct(product),
          landing_page_url: product.landing_page_url
        }
      ));
    },
    goToCart (): void {
      this.$router.push(localizedRoute('/cart'));
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

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
    margin: 2em 0;
  }

  .products {
    box-sizing: border-box;
    flex: 1;
    margin: 0;

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
      grid-template-columns: repeat(auto-fit, minmax(50%, 1fr));
    }
    &__product-card {
      --product-card-max-width: none;
      margin: 0 var(--spacer-xs);
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

  @media (min-width: $tablet-min) {
    .products {
      &__grid {
        grid-template-columns: repeat(auto-fit, minmax(33%, 1fr));
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
        grid-template-columns: repeat(auto-fit, minmax(25%, 1fr));
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
  }

  @media (min-width: $desktop-l-min) {
    .products {
      &__grid {
        grid-template-columns: repeat(auto-fit, minmax(20%, 1fr));
      }

      &__product-card {
        flex: 1 1 20%;
      }
    }
  }
}
</style>
