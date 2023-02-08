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

import { isServer } from '@vue-storefront/core/helpers';
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
      const info = this.$store.getters['budsies/getBulkorderInfo'];

      if (!info || info.id !== this.bulkorderId) {
        return undefined;
      }

      return info;
    }
  },
  async mounted (): Promise<void> {
    await this.setCurrentProduct();
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
  beforeRouteLeave (to, from, next) {
    this.$store.commit(`product/${PRODUCT_UNSET_CURRENT}`);
    next();
  },
  methods: {
    async loadData (): Promise<void> {
      await this.$store.dispatch('budsies/loadBulkOrderInfo', this.bulkorderId);

      const product = await this.$store.dispatch('product/loadProduct', {
        parentSku: this.sampleProductSku,
        setCurrent: false
      });

      if (isServer) {
        await this.$store.dispatch('product/setCurrent', product);
      }

      this.isDataLoaded = true;
    },
    async setCurrentProduct (): Promise<void> {
      if (this.sampleProduct) {
        return;
      }

      const product = this.$store.getters['product/getProductBySkuDictionary'][this.sampleProductSku];

      await this.$store.dispatch('product/setCurrent', product);
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
