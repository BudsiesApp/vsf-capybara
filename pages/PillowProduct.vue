<template>
  <div id="pillow-product">
    <product-structured-data
      v-if="getCurrentProduct"
      :product="getCurrentProduct"
    />

    <o-pillow-product-order-form
      :artwork-upload-url="artworkUploadUrl"
      :product="getCurrentProduct"
      :plushie-id="plushieId"
      :existing-plushie-id="existingPlushieId"
      @make-another="onMakeAnother"
      v-if="showForm"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import config from 'config';
import { htmlDecode } from '@vue-storefront/core/filters';
import { catalogHooksExecutors } from '@vue-storefront/core/modules/catalog-next/hooks';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';

import Product from 'core/modules/catalog/types/Product';

import { ProductStructuredData } from 'src/modules/budsies';

import OPillowProductOrderForm from '../components/organisms/o-pillow-product-order-form.vue';

const pillowSku = 'customPillow_bundle';

export default Vue.extend({
  name: 'PillowProduct',
  props: {
    existingPlushieId: {
      type: String as PropType<string | undefined>,
      default: undefined
    }
  },
  components: {
    OPillowProductOrderForm,
    ProductStructuredData
  },
  data () {
    return {
      plushieId: undefined as number | undefined,
      isDataLoaded: false
    };
  },
  computed: {
    getCurrentProduct (): Product | null {
      const product = this.$store.getters['product/getCurrentProduct'];

      if (product?.sku !== pillowSku) {
        return null;
      }

      return product;
    },
    artworkUploadUrl (): string {
      return config.images.fileuploaderUploadUrl;
    },
    getProductBySkuDictionary (): Record<string, Product> {
      return this.$store.getters['product/getProductBySkuDictionary'];
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
  },
  beforeRouteLeave (to, from, next) {
    this.$store.commit(`product/${PRODUCT_UNSET_CURRENT}`);
    next();
  },
  methods: {
    async onMakeAnother (): Promise<void> {
      this.plushieId = await this.createPlushie();
    },
    async createPlushie (): Promise<number> {
      if (!this.getCurrentProduct) {
        throw new Error('Current product is not set!');
      }

      const task = await this.$store.dispatch('budsies/createNewPlushie', { productId: this.getCurrentProduct.id });
      return task.result;
    },
    async setCurrentProduct (): Promise<void> {
      if (this.getCurrentProduct) {
        return;
      }

      const product = this.getProductBySkuDictionary[pillowSku];
      await this.$store.dispatch('product/setCurrent', product);
    },
    async loadData (): Promise<void> {
      this.isDataLoaded = false;

      const product = await this.$store.dispatch('product/loadProduct',
        {
          parentSku: pillowSku,
          setCurrent: true
        }
      );

      await Promise.all([
        this.$store.dispatch('budsies/loadProductBodyparts', { productId: product.id }),
        this.$store.dispatch('budsies/loadProductRushAddons', { productId: product.id })
      ]);

      catalogHooksExecutors.productPageVisited(product);

      this.isDataLoaded = true;
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
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

#pillow-product {
  box-sizing: border-box;
  padding: var(--spacer-lg) 1rem 0;

  @media (min-width: $tablet-min) {
    max-width: 1272px;
    width: 100%;
    margin: 0 auto;
  }
}

</style>
