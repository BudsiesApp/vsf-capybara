
<template>
  <div id="pillow-quote">
    <o-pillow-quote-order-form
      :artwork-upload-url="artworkUploadUrl"
      :product="getCurrentProduct"
      v-if="getCurrentProduct"
    />
  </div>
</template>

<script lang="ts">
import config from 'config';
import { htmlDecode } from '@vue-storefront/core/filters';
import { isServer } from '@vue-storefront/core/helpers';
import { catalogHooksExecutors } from '@vue-storefront/core/modules/catalog-next/hooks';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';

import Product from 'core/modules/catalog/types/Product';

import OPillowQuoteOrderForm from 'theme/components/organisms/OBulkorders/o-pillow-quote-order-form.vue';

const pillowQuoteProductSku = 'pillowBulkSample_bundle';

export default {
  name: 'KeychainQuote',
  components: {
    OPillowQuoteOrderForm
  },
  data () {
    return {
      isRouterLeaving: false
    };
  },
  computed: {
    getCurrentProduct (): Product | null {
      const product = this.$store.getters['product/getCurrentProduct'];

      if (product?.sku !== pillowQuoteProductSku) {
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
  async mounted (): Promise<void> {
    await this.setCurrentProduct();
  },
  async asyncData ({ store, route, context }): Promise<void> {
    if (context) context.output.cacheTags.add('product')

    const product = await store.dispatch('product/loadProduct',
      {
        parentSku: pillowQuoteProductSku,
        setCurrent: false
      }
    );

    if (isServer) {
      await store.dispatch('product/setCurrent', product);
    }

    catalogHooksExecutors.productPageVisited(product);
  },
  beforeRouteLeave (to, from, next) {
    this.isRouterLeaving = true
    next();
  },
  beforeDestroy () {
    // Hot-reload workaround (old component instance is destroyed after new one has been created)
    // https://github.com/vuejs/vue/issues/6518
    if (this.isRouterLeaving) {
      this.$store.commit(`product/${PRODUCT_UNSET_CURRENT}`);
    }
  },
  methods: {
    async setCurrentProduct (): Promise<void> {
      if (this.getCurrentProduct) {
        return;
      }

      const product = this.getProductBySkuDictionary[pillowQuoteProductSku];
      await this.$store.dispatch('product/setCurrent', product);
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

  #pillow-quote {
    box-sizing: border-box;
    padding: var(--spacer-lg) 1rem 0;

    .o-pillow-quote-order-form {
      max-width: 760px;
      margin: 0 auto;
    }

    @media (min-width: $tablet-min) {
      max-width: 1272px;
      width: 100%;
      margin: 0 auto;
    }
  }
  </style>
