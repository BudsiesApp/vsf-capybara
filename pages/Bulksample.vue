<template>
  <div id="bulksample-page">
    <product-structured-data
      v-if="getCurrentProduct"
      :product="getCurrentProduct"
    />

    <o-bulksample-creation-form
      :artwork-upload-url="artworkUploadUrl"
      :product="getCurrentProduct"
      :existing-plushie-id="existingPlushieId"
      :type="type"
      v-if="showCreationForm"
    />
  </div>
</template>

<script lang="ts">
import config from 'config';
import Vue, { PropType } from 'vue'
import Product from '@vue-storefront/core/modules/catalog/types/Product';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import { catalogHooksExecutors } from '@vue-storefront/core/modules/catalog-next/hooks';

import BulksampleProduct from 'theme/interfaces/bulksample-product.type';

import { ProductStructuredData } from 'src/modules/budsies';

import OBulksampleCreationForm from 'theme/components/organisms/o-bulksample-creation-form.vue';

export default Vue.extend({
  props: {
    sku: {
      type: String,
      required: true
    },
    existingPlushieId: {
      type: String,
      default: undefined
    },
    type: {
      type: String as PropType<BulksampleProduct>,
      required: true
    }
  },
  components: {
    OBulksampleCreationForm,
    ProductStructuredData
  },
  computed: {
    artworkUploadUrl () {
      return config.images.fileuploaderUploadUrl;
    },
    getCurrentProduct (): Product | null {
      const product = this.$store.getters['product/getCurrentProduct'];
      if (!product?.sku || product.sku !== this.sku) {
        return null;
      }

      return product;
    },
    showCreationForm (): boolean {
      return !!this.getCurrentProduct && this.isProductDataLoaded;
    }
  },
  data () {
    return {
      isProductDataLoaded: false
    };
  },
  async serverPrefetch () {
    if (this.$ssrContext) this.$ssrContext.output.cacheTags.add('product')

    await (this as any).loadData();
  },
  async beforeMount () {
    if (!this.getCurrentProduct) {
      await this.loadData();
    } else {
      this.isProductDataLoaded = true;
    }
  },
  beforeRouteLeave (to, from, next) {
    this.$store.commit(`product/${PRODUCT_UNSET_CURRENT}`);
    next();
  },
  methods: {
    async loadData (): Promise<void> {
      const product = await this.$store.dispatch('product/loadProduct', {
        parentSku: this.sku,
        setCurrent: true
      });

      await Promise.all([
        this.$store.dispatch('budsies/loadProductBodyparts', { productId: product.id }),
        this.$store.dispatch('budsies/fetchCustomerTypes')
      ]);

      catalogHooksExecutors.productPageVisited(product);

      this.isProductDataLoaded = true;
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

#bulksample-page {
  box-sizing: border-box;
  padding: 0 1rem;

  ::v-deep {
    .product__colors button {
        border: 1px solid var(--c-light);
    }
  }

  @media (min-width: $tablet-min) {
    max-width: 1272px;
    width: 100%;
    margin: 0 auto;

    .o-bulksample-creation-form {
      margin-top: var(--spacer-lg);
    }
  }
}
</style>
