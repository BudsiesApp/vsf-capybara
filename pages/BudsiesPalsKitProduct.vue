<template>
  <div id="budsies-pals-kit-product">
    <product-structured-data
      v-if="getCurrentProduct"
      :product="getCurrentProduct"
    />

    <SfHeading
      :title="$t('Budsies Pals Kit')"
      :level="1"
    />

    <m-block-story
      story-slug="budsies_pals_kit_page_top"
      class="_story"
    />

    <div class="_form-wrapper">
      <div class="_image">
        <div class="_image-container">
          <img src="/assets/images/kit-product.jpg">
        </div>
      </div>

      <div class="_form-container">
        <SfHeading
          :title="$t('Purchase a Budsies Pals Kit')"
          :level="3"
        />
        <div
          class="_description"
          v-if="getCurrentProduct"
          v-html="getCurrentProduct.short_description"
        />

        <o-budsies-pals-kit-product-order-form
          class="_form"
          :product="getCurrentProduct"
          :hospitals-list="hospitalsList"
          v-if="showForm"
        />
      </div>
    </div>

    <m-block-story
      story-slug="budsies_pals_kit_page_bottom"
      class="_story"
    />
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { SfHeading } from '@storefront-ui/vue';

import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { htmlDecode } from '@vue-storefront/core/filters';
import { catalogHooksExecutors } from '@vue-storefront/core/modules/catalog-next/hooks';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import Product from 'core/modules/catalog/types/Product';

import { Hospital, ProductStructuredData } from 'src/modules/budsies';
import { ProductEvent } from 'src/modules/shared';

import OBudsiesPalsKitProductOrderForm from 'theme/components/organisms/o-budsies-pals-kit-product-order-form.vue';
import MBlockStory from 'theme/components/molecules/m-block-story.vue';
import { SearchQuery } from 'storefront-query-builder';

interface InjectedServices {
  window: Window
}

const budsiesPalsKitSku = 'palsKit';
const budsiesPalsSku = 'customPals_bundle';

const HOSPITAL_CUSTOMIZATION_NAME = 'hospital';

export default (Vue as VueConstructor<Vue & InjectedServices>).extend({
  name: 'BudsiesPalsKitProduct',
  components: {
    MBlockStory,
    OBudsiesPalsKitProductOrderForm,
    ProductStructuredData,
    SfHeading
  },
  inject: {
    window: { from: 'WindowObject' }
  },
  data () {
    return {
      isDataLoaded: false
    }
  },
  computed: {
    getCurrentProduct (): Product | null {
      const product = this.$store.getters['product/getCurrentProduct'];

      if (product?.sku !== budsiesPalsKitSku) {
        return null;
      }

      return product;
    },
    hospitalsList (): Hospital[] {
      if (!this.palsKitProduct) {
        return [];
      }

      const hospitalCustomization = this.palsKitProduct.customizations?.find((customization) => {
        return customization.name.toLowerCase() === HOSPITAL_CUSTOMIZATION_NAME;
      });

      if (!hospitalCustomization) {
        return [];
      }

      const availableOptionValues = hospitalCustomization.optionData?.values?.filter((value) => {
        return value.isEnabled && value.name;
      });

      if (!availableOptionValues) {
        return [];
      }

      availableOptionValues.sort((a, b) => {
        return a.sn < b.sn ? -1 : 1
      });

      return availableOptionValues.map((value) => {
        return {
          id: value.id,
          name: value.name || ''
        }
      })
    },
    palsKitProduct (): Product | undefined {
      return this.$store.getters['product/getProductBySkuDictionary'][budsiesPalsSku];
    },
    showForm (): boolean {
      return this.isDataLoaded && !!this.getCurrentProduct;
    }
  },
  async serverPrefetch () {
    if (this.$ssrContext) this.$ssrContext.output.cacheTags.add('product')

    await (this as any).loadData();
  },
  async beforeMount () {
    if (!this.getCurrentProduct) {
      await this.loadData();
    }

    this.isDataLoaded = true;
    EventBus.$emit(ProductEvent.PRODUCT_PAGE_SHOW, this.getCurrentProduct);
  },
  beforeRouteLeave (to, from, next) {
    this.$store.commit(`product/${PRODUCT_UNSET_CURRENT}`);
    next();
  },
  methods: {
    async loadData (): Promise<void> {
      this.isDataLoaded = false;
      let searchQuery = new SearchQuery();
      searchQuery = searchQuery.applyFilter({
        key: 'sku',
        value: {
          'in': [budsiesPalsKitSku, budsiesPalsSku]
        }
      });

      await this.$store.dispatch('product/findProducts', {
        query: searchQuery,
        size: 2
      });

      const palsKitProduct = this.$store.getters['product/getProductBySkuDictionary'][budsiesPalsKitSku];

      if (!palsKitProduct) {
        throw new Error(`Product with "${budsiesPalsKitSku}" sku not found`);
      }

      await this.$store.dispatch('product/setCurrent', palsKitProduct);

      this.isDataLoaded = true;
      catalogHooksExecutors.productPageVisited(palsKitProduct);
    }
  },
  metaInfo () {
    const description = this.getCurrentProduct?.meta_description || this.getCurrentProduct?.short_description;

    return {
      title: htmlDecode(
        this.getCurrentProduct?.meta_title || this.getCurrentProduct?.name
      ),
      meta: description
        ? [
          {
            vmid: 'description',
            name: 'description',
            content: htmlDecode(description)
          }
        ]
        : []
    };
  }
})
</script>

<style lang="scss" scoped>
@import "theme/css/base/_breakpoints.scss";
@import "theme/css/mixins/wave.scss";

#budsies-pals-kit-product {
  box-sizing: border-box;
  padding: var(--spacer-lg) var(--spacer-sm) 0;

  ._story {
    width: 100%;
    max-width: 960px;
    margin-left: auto;
    margin-right: auto;
    margin-top: var(--spacer-lg);

    &:last-child {
      margin-top: var(--spacer-2xl);
    }
  }

  ._image,
  ._form-container {
    flex-basis: 100%;
  }

  ._image-container {
    position: relative;
    display: flex;
  }

  ._image {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-start;

    img {
      max-width: 100%;
      border-radius: 27px;
      object-fit: contain;
    }
  }

  ._form {
    margin-top: var(--spacer-lg);
  }

  ._form-wrapper {
    margin: var(--spacer-2xl) auto 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    box-sizing: border-box;

    ._form-container {
      margin-top: var(--spacer-xl);
    }
  }

  ._description {
    margin-top: var(--spacer-lg);
  }

  @include for-desktop {
    max-width: 1140px;
    width: 100%;
    margin: 0 auto;
    padding: var(--spacer-2xl) var(--spacer-lg) 0;

    ._image {
      justify-content: flex-start;
    }

    ._form-wrapper {
      flex-wrap: nowrap;
      column-gap: var(--spacer-xl);

      ._form-container {
        margin-top: var(--spacer-lg);
      }
    }
  }
}
</style>
