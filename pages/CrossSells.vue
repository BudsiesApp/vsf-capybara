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
import { computed, defineComponent } from '@vue/composition-api';
import { SfButton } from '@storefront-ui/vue';

import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'
import { localizedRoute } from '@vue-storefront/core/lib/multistore';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import rootStore from '@vue-storefront/core/store';
import Product from 'core/modules/catalog/types/Product';

import { ProductEvent } from 'src/modules/shared';

import { CROSS_SELL, UP_SELL, useRelatedProducts } from 'theme/helpers/use-related-products';

import OProductCard from 'theme/components/organisms/o-product-card.vue';
import getCurrentThemeClass from 'theme/helpers/get-current-theme-class';

const selfiesSkus = [
  'CustomSelfie_bundle',
  'selfiesPuppet_bundle'
]

export default defineComponent({
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
  setup (props) {
    const skinClass = computed(() => {
      return getCurrentThemeClass();
    });

    const productBySkuDictionary = computed<Record<string, Product>>(() => {
      return rootStore.getters['product/getProductBySkuDictionary'];
    });
    const currentProduct = computed(() => {
      return productBySkuDictionary.value[props.parentSku];
    });

    const {
      relatedProducts: crossSellsProducts,
      preparedRelatedProducts: preparedCrossSellsProducts,
      loadList: loadCrossSellsProductsList
    } = useRelatedProducts(currentProduct, CROSS_SELL);
    const {
      relatedProducts: upSellsProducts,
      preparedRelatedProducts: preparedUpSellsProducts,
      loadList: loadUpSellsProductsList
    } = useRelatedProducts(currentProduct, UP_SELL);

    return {
      skinClass,
      crossSellsProducts,
      preparedCrossSellsProducts,
      upSellsProducts,
      preparedUpSellsProducts,
      loadCrossSellsProductsList,
      loadUpSellsProductsList,
      productBySkuDictionary,
      currentProduct
    }
  },
  computed: {
    upSellsTitle (): string {
      if (!this.currentProduct) {
        return '';
      }

      return (
        selfiesSkus.includes(this.currentProduct.sku)
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
      const product = this.productBySkuDictionary[productSku];

      EventBus.$emit(
        ProductEvent.PRODUCT_CARD_CLICK,
        {
          product,
          categoryName: listName,
          categoryId: this.parentSku
        }
      )
    },
    async loadData (): Promise<void> {
      await this.loadProduct();
      await Promise.all([
        this.loadCrossSellsProductsList(),
        this.loadUpSellsProductsList()
      ]);
    },
    async loadProduct (): Promise<void> {
      if (
        !this.currentProduct ||
        this.currentProduct.parentSku !== this.parentSku
      ) {
        await this.$store.dispatch(
          'product/loadProduct',
          {
            parentSku: this.parentSku,
            setCurrent: false
          }
        );
      }
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
