<template>
  <div id="bulkorder-quotation">
    <o-bulkorder-quotation-form
      :bulkorder-info="bulkorderInfo"
      :sample-product="sampleProduct"
      :production-time-story-slug="productionTimeStorySlug"
      v-if="isDataLoaded"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Product from '@vue-storefront/core/modules/catalog/types/Product';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';

import BulkorderProduct from 'theme/interfaces/bulkorder-product.type';
import { BulkOrderInfo } from 'src/modules/budsies';
import OBulkorderQuotationForm from 'theme/components/organisms/o-bulkorder-quotation-form.vue';

export default Vue.extend({
  name: 'BulkorderQuotation',
  components: {
    OBulkorderQuotationForm
  },
  props: {
    bulkorderId: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      isRouterLeaving: false,
      isDataLoaded: false,
      bulkorderInfo: undefined as BulkOrderInfo | undefined
    };
  },
  computed: {
    productionTimeStorySlug (): string | undefined {
      if (!this.bulkorderInfo) {
        return undefined;
      }

      let sampleProductPart = '_';

      if (this.bulkorderInfo.bulkorderProductId === BulkorderProduct.PILLOW) {
        sampleProductPart = '_pillow_';
      }

      if (this.bulkorderInfo.bulkorderProductId === BulkorderProduct.KEYCHAIN) {
        sampleProductPart = '_keychain_';
      }

      return `info/bulk${sampleProductPart}quote_production_time_text`;
    },
    sampleProductSku (): string | undefined {
      if (!this.bulkorderInfo) {
        return undefined;
      }

      switch (this.bulkorderInfo.bulkorderProductId) {
        case BulkorderProduct.PLUSHIE:
          return 'CustomBulkSample_bundle';
        case BulkorderProduct.PILLOW:
          return 'pillowBulkSample_bundle';
        case BulkorderProduct.KEYCHAIN:
          return 'keychainBulkSample_bundle';
        default:
          return undefined;
      }
    },
    sampleProduct (): Product | undefined {
      const product = this.$store.getters['product/getCurrentProduct'];

      if (!product || product.sku !== this.sampleProductSku) {
        return undefined;
      }

      return product;
    }
  },
  async beforeMount () {
    if (!this.isDataLoaded) {
      await this.loadData();
    }
  },
  beforeDestroy () {
    // Hot-reload workaround (old component instance is destroyed after new one has been created)
    // https://github.com/vuejs/vue/issues/6518
    if (this.isRouterLeaving) {
      this.$store.commit(`product/${PRODUCT_UNSET_CURRENT}`);
    }
  },
  beforeRouteLeave (to, from, next) {
    this.isRouterLeaving = true
    next();
  },
  methods: {
    async loadData (): Promise<void> {
      this.bulkorderInfo = await this.$store.dispatch('budsies/getBulkOrderInfo', this.bulkorderId);

      await this.$store.dispatch('product/loadProduct', {
        parentSku: this.sampleProductSku,
        setCurrent: true
      });

      this.isDataLoaded = true;
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

#bulkorder-quotation {
  box-sizing: border-box;
  padding: var(--spacer-lg) 1rem 0;

  @media (min-width: $tablet-min) {
    max-width: 1272px;
    width: 100%;
    margin: 0 auto;
  }
}
</style>
