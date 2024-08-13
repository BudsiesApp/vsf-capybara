
<template>
  <div id="bulk-quote">
    <o-bulk-quote-order-form
      :artwork-upload-url="artworkUploadUrl"
      :product="getCurrentProduct"
      v-if="getCurrentProduct && !isDataLoading"
    />

    <a-loading-spinner v-else />
  </div>
</template>

<script lang="ts">
import config from 'config';
import { htmlDecode } from '@vue-storefront/core/filters';
import { catalogHooksExecutors } from '@vue-storefront/core/modules/catalog-next/hooks';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';

import Product from 'core/modules/catalog/types/Product';

import ALoadingSpinner from 'theme/components/atoms/a-loading-spinner.vue';
import OBulkQuoteOrderForm from 'theme/components/organisms/OBulkorders/o-bulk-quote-order-form.vue';

const bulkQuoteProductSku = 'CustomBulkSample_bundle';

export default {
  name: 'BulkQuote',
  components: {
    ALoadingSpinner,
    OBulkQuoteOrderForm
  },
  data () {
    return {
      isDataLoading: false
    };
  },
  computed: {
    getCurrentProduct (): Product | null {
      const product = this.$store.getters['product/getCurrentProduct'];

      if (product?.sku !== bulkQuoteProductSku) {
        return null;
      }

      return product;
    },
    artworkUploadUrl (): string {
      return config.images.fileuploaderUploadUrl;
    },
    getProductBySkuDictionary (): Record<string, Product> {
      return this.$store.getters['product/getProductBySkuDictionary'];
    }
  },
  beforeMount (): void {
    if (this.getCurrentProduct) {
      return;
    }

    void this.loadData();
  },
  serverPrefetch (): Promise<void> {
    if (this.$ssrContext) this.$ssrContext.output.cacheTags.add('product')

    return (this as any).loadData();
  },
  beforeRouteLeave (to, from, next) {
    this.$store.commit(`product/${PRODUCT_UNSET_CURRENT}`);
    next();
  },
  methods: {
    async loadData (): Promise<void> {
      this.isDataLoading = true;
      const [product] = await Promise.all([
        this.$store.dispatch('product/loadProduct',
          {
            parentSku: bulkQuoteProductSku,
            setCurrent: true
          }
        ),
        this.$store.dispatch('budsies/fetchCustomerTypes')
      ]);

      this.isDataLoading = false;
      catalogHooksExecutors.productPageVisited(product);
    }
  },
  metaInfo () {
    return {
      title: htmlDecode(
        this.getCurrentProduct?.meta_title || this.getCurrentProduct?.name
      ),
      meta: this.getCurrentProduct?.meta_description
        ? [
          {
            vmid: 'description',
            name: 'description',
            content: htmlDecode(this.getCurrentProduct?.meta_description)
          }
        ]
        : []
    };
  }
};
</script>

<style lang="scss" scoped>
    @import "~@storefront-ui/shared/styles/helpers/breakpoints";

    #bulk-quote {
      box-sizing: border-box;
      padding: var(--spacer-lg) 1rem 0;

      .o-bulk-quote-order-form {
        max-width: 760px;
        margin: 0 auto;
      }

      .a-loading-spinner {
        height: 50vh;
      }

      @media (min-width: $tablet-min) {
        max-width: 1272px;
        width: 100%;
        margin: 0 auto;
      }
    }
</style>
