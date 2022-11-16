<template>
  <div id="bulkorder-quotation">
    <o-bulkorder-quotation-form
      :quotes="quotes"
      :size="size"
      :sample-product-name="sampleProductName"
      :sample-product-price="sampleProductPrice"
      :show-compare-to="showCompareTo"
      :production-time-story-slug="productionTimeStorySlug"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import Product from '@vue-storefront/core/modules/catalog/types/Product';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';

import BulksampleProduct from 'theme/interfaces/bulksample-product.type';
import { BulkorderQuote } from 'src/modules/budsies';
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
    },
    size: {
      type: Number,
      required: true
    },
    sampleType: {
      type: String as PropType<BulksampleProduct>,
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
    quotes (): BulkorderQuote[] {
      return this.$store.getters['budsies/getBulkorderQuotes'](this.bulkorderId);
    },
    sampleProductName (): string {
      switch (this.sampleType) {
        case BulksampleProduct.PLUSH:
          return 'Plush';
        case BulksampleProduct.PILLOW:
          return 'Pillow';
        case BulksampleProduct.KEYCHAIN:
          return 'Keychain';
        default:
          return '';
      }
    },
    sampleProductPrice (): string {
      let price = 0;

      if (this.sampleProduct && this.sampleProduct.final_price) {
        price = this.sampleProduct.final_price;
      }

      return '$' + price.toString();
    },
    productionTimeStorySlug (): string {
      let sampleProductPart = '_';

      if (this.sampleType === BulksampleProduct.PILLOW) {
        sampleProductPart = '_pillow_';
      }

      if (this.sampleType === BulksampleProduct.KEYCHAIN) {
        sampleProductPart = '_keychain_';
      }

      return `info/bulk${sampleProductPart}quote_production_time_text`;
    },
    showCompareTo (): boolean {
      switch (this.sampleType) {
        case BulksampleProduct.PLUSH:
        case BulksampleProduct.KEYCHAIN:
          return true;
        default:
          return false;
      }
    },
    sampleProductSku (): string | undefined {
      switch (this.sampleType) {
        case BulksampleProduct.PLUSH:
          return 'CustomBulkSample_bundle';
        case BulksampleProduct.PILLOW:
          return 'pillowBulkSample_bundle';
        case BulksampleProduct.KEYCHAIN:
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
      await Promise.all([
        this.$store.dispatch('budsies/loadBulkorderQuotes', {
          bulkorderId: this.bulkorderId
        }),
        this.$store.dispatch('product/loadProduct', {
          parentSku: this.sampleProductSku,
          setCurrent: true
        })
      ]);

      this.isDataLoaded = true;
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

#bulkorder-quotation {
  // styles
}
</style>
