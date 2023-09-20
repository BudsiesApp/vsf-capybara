<template>
  <div id="budsies-pals-product">
    <product-structured-data
      v-if="getCurrentProduct"
      :product="getCurrentProduct"
    />

    <o-budsies-pals-product-order-form
      :artwork-upload-url="artworkUploadUrl"
      :product="getCurrentProduct"
      :existing-plushie-id="existingPlushieId"
      v-if="showForm"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import config from 'config';

import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { htmlDecode } from '@vue-storefront/core/filters';
import { catalogHooksExecutors } from '@vue-storefront/core/modules/catalog-next/hooks';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';

import Product from 'core/modules/catalog/types/Product';

import { ProductStructuredData } from 'src/modules/budsies';
import { ProductEvent } from 'src/modules/shared';

import OBudsiesPalsProductOrderForm from 'theme/components/organisms/o-budsies-pals-product-order-form.vue';

const budsiesPalsSku = 'customPals_bundle';

export default Vue.extend({
  name: 'BudsiesPalsProduct',
  components: {
    OBudsiesPalsProductOrderForm,
    ProductStructuredData
  },
  props: {
    existingPlushieId: {
      type: String as PropType<string | undefined>,
      default: undefined
    }
  },
  data () {
    return {
      isDataLoaded: false
    };
  },
  computed: {
    getCurrentProduct (): Product | null {
      const product = this.$store.getters['product/getCurrentProduct'];
      if (!product?.sku || product.sku !== budsiesPalsSku) {
        return null;
      }

      return product;
    },
    artworkUploadUrl () {
      return config.images.fileuploaderUploadUrl;
    },
    showForm (): boolean {
      return this.isDataLoaded && !!this.getCurrentProduct;
    }
  },
  async serverPrefetch (): Promise<void> {
    if (this.$ssrContext) this.$ssrContext.output.cacheTags.add('product')

    await (this as any).loadData();
  },
  async beforeMount (): Promise<void> {
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

      const [product] = await Promise.all([
        this.$store.dispatch('product/loadProduct', {
          parentSku: budsiesPalsSku,
          setCurrent: true
        }),
        this.$store.dispatch('budsies/fetchHospitalsList')
      ]);

      catalogHooksExecutors.productPageVisited(product);

      this.isDataLoaded = true;
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
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

#budsies-pals-product {
  box-sizing: border-box;
  padding: var(--spacer-lg) 1rem 0;

  @media (min-width: $tablet-min) {
    max-width: 1272px;
    width: 100%;
    margin: 0 auto;
  }
}
</style>
