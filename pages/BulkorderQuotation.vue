<template>
  <div id="bulkorder-quotation">
    <o-bulkorder-quotation-form />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import Product from '@vue-storefront/core/modules/catalog/types/Product';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';

import BulksampleProduct from 'theme/interfaces/bulksample-product.type';
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
    sampleSku: {
      type: String,
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
    getCurrentProduct (): Product | null {
      const product = this.$store.getters['product/getCurrentProduct'];

      if (!product?.sku || product.sku !== this.sku) {
        return null;
      }

      return product;
    }
  },
  async beforeMount () {
    if (!this.getCurrentProduct) {
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
      await Promise.all([
        this.$store.dispatch('budsies/loadBulkorderQuotes', {
          bulkorderId: this.bulkorderId
        }),
        this.$store.dispatch('product/loadProduct', {
          parentSku: this.sampleSku,
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
