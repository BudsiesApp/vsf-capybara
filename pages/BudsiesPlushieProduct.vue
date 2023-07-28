<template>
  <div id="budsies-plushie-product" itemscope itemtype="http://schema.org/Product">
    <o-budsies-plushie-product-order-form
      :artwork-upload-url="artworkUploadUrl"
      :artwork-upload-top-helper-text="artworkUploadTopHelperText"
      :customize-step-subtitle="customizeStepSubtitle"
      :email-upload-images-count-text="emailUploadImagesCountText"
      :page-title="pageTitle"
      :top-story-slug="topStorySlug"
      :upgrades-subtitle="upgradesSubtitle"
      :upgrades-text="upgradesText"
      :product="getCurrentProduct"
      :existing-plushie-id="existingPlushieId"
      v-if="showForm"
    >
      <template #artwork-upload-bottom-block>
        <p v-if="isBudsieProduct">
          {{ $t('Don\'t have a good character? Get inspired by our') }}

          <router-link target="_blank" :to="{name: 'inspiration-machine'}">
            {{ $t('Inspiration Machine') }}!
          </router-link>
        </p>
      </template>
    </o-budsies-plushie-product-order-form>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import config from 'config';
import { htmlDecode } from '@vue-storefront/core/filters';
import { catalogHooksExecutors } from '@vue-storefront/core/modules/catalog-next/hooks';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';

import Product from 'core/modules/catalog/types/Product';

import OBudsiesPlushieProductOrderForm from 'theme/components/organisms/o-budsies-plushie-product-order-form.vue';

const budsieProductSku = 'CustomBudsie1_bundle';
const budsiesPuppetsProductSku = 'budsiesPuppet_bundle';

export default Vue.extend({
  name: 'BudsiesPlushieProduct',
  components: {
    OBudsiesPlushieProductOrderForm
  },
  props: {
    sku: {
      type: String,
      required: true
    },
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
      if (!product?.sku || product.sku !== this.sku) {
        return null;
      }

      return product;
    },
    artworkUploadUrl () {
      return config.images.fileuploaderUploadUrl;
    },
    artworkUploadTopHelperText (): string {
      return this.$t(
        'Please order each unique design as a separate {product}',
        {
          product: this.productName
        }
      ).toString();
    },
    customizeStepSubtitle (): string {
      return this.$t(
        'Describe Your {product}',
        { product: this.productName }
      ).toString();
    },
    emailUploadImagesCountText (): string {
      return this.$t(
        'You may include up to 3 images per {product} to help us understand it.',
        {
          product: this.productName
        }
      ).toString();
    },
    isBudsieProduct (): boolean {
      return this.sku === budsieProductSku;
    },
    pageTitle (): string {
      return this.$t(
        '{product} Order Form',
        { product: this.productName }
      ).toString();
    },
    productName (): string {
      switch (this.sku) {
        case budsieProductSku:
          return 'Budsies';
        case budsiesPuppetsProductSku:
          return 'Budsies Puppets';
        default:
          throw new Error('Unexpected product sku');
      }
    },
    topStorySlug (): string {
      switch (this.sku) {
        case budsieProductSku:
          return 'budsies-creation-page-top-block';
        case budsiesPuppetsProductSku:
          return 'budsies-puppet-creation-page-top-block';
        default:
          throw new Error('Unexpected product sku');
      }
    },
    upgradesSubtitle (): string {
      return this.$t(
        'Upgrade Your {product} (optional)',
        { product: this.productName }
      ).toString();
    },
    upgradesText (): string {
      return this.$t(
        'Make your {product} even more special with these common add-ons',
        { product: this.productName }
      ).toString();
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
    async loadData (): Promise<void> {
      this.isDataLoaded = false;

      const product = await this.$store.dispatch('product/loadProduct', {
        parentSku: this.sku,
        setCurrent: true
      });

      catalogHooksExecutors.productPageVisited(product);

      await this.$store.dispatch('budsies/loadProductRushAddons', { productId: product.id });
      await this.$store.dispatch('budsies/loadProductBodyparts', { productId: product.id })

      this.isDataLoaded = true;
    }
  },
  watch: {
    sku: async function () {
      await this.loadData();
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

#budsies-plushie-product {
  box-sizing: border-box;
  padding: var(--spacer-lg) 1rem 0;

  @media (min-width: $tablet-min) {
    max-width: 1272px;
    width: 100%;
    margin: 0 auto;
  }
}
</style>
