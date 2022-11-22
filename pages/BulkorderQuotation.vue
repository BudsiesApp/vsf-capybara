<template>
  <div id="bulkorder-quotation">
    <o-bulkorder-quotation-form
      :bulkorder-info="bulkorderInfo"
      :sample-product="sampleProduct"
      v-if="isDataLoaded"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Product from '@vue-storefront/core/modules/catalog/types/Product';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';

import { BulkOrderInfo, BulkorderQuoteProductId } from 'src/modules/budsies';
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
      isDataLoaded: false
    };
  },
  computed: {
    sampleProductSku (): string | undefined {
      if (!this.bulkorderInfo) {
        return undefined;
      }

      switch (this.bulkorderInfo.bulkorderProductId) {
        case BulkorderQuoteProductId.PLUSHIE:
          return 'CustomBulkSample_bundle';
        case BulkorderQuoteProductId.PILLOW:
          return 'pillowBulkSample_bundle';
        case BulkorderQuoteProductId.KEYCHAIN:
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
    },
    bulkorderInfo (): BulkOrderInfo | undefined {
      return this.$store.getters['budsies/getBulkorderInfo'];
    }
  },
  async serverPrefetch () {
    await (this as any).loadData();
  },
  async beforeMount () {
    if (!this.bulkorderInfo) {
      await this.loadData();
    } else {
      this.isDataLoaded = true;
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
      await this.$store.dispatch('budsies/loadBulkOrderInfo', this.bulkorderId);

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
