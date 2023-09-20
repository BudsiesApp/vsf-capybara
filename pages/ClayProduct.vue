<template>
  <div id="clay-product">
    <product-structured-data
      v-if="getCurrentProduct"
      :product="getCurrentProduct"
    />

    <o-clay-product-order-form
      v-if="showForm"
      :artwork-upload-url="artworkUploadUrl"
      :product="getCurrentProduct"
      :customize-step-subtitle="customizeStepSubtitle"
      :page-title="pageTitle"
      :top-story-slug="topStorySlug"
      :bottom-story-slug="bottomStorySlug"
      :upgrades-subtitle="upgradesSubtitle"
      :upgrades-text="upgradesText"
      :existing-plushie-id="existingPlushieId"
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
import { TranslateResult } from 'vue-i18n';

import Product from 'core/modules/catalog/types/Product';

import { ProductStructuredData } from 'src/modules/budsies';
import { ProductEvent } from 'src/modules/shared';

import OClayProductOrderForm from 'theme/components/organisms/o-clay-product-order-form.vue';

const figurinesSku = 'petsiesFigurines_bundle';

export default Vue.extend({
  name: 'ClayProduct',
  components: {
    OClayProductOrderForm,
    ProductStructuredData
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
      plushieId: undefined as number | undefined,
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
    customizeStepSubtitle (): TranslateResult {
      return this.$t(
        'Customize Your Petsies {product}',
        {
          product: this.isFigurines ? 'Figurines' : 'Bobbleheads'
        }
      );
    },
    pageTitle (): TranslateResult {
      return this.$t(
        'Petsies {product} Order Form',
        {
          product: this.isFigurines ? 'Figurines' : 'Bobbleheads'
        }
      );
    },
    upgradesSubtitle (): TranslateResult {
      return this.$t(
        'Upgrade Your Petsies {product} (optional)',
        {
          product: this.isFigurines ? 'Figurines' : 'Bobbleheads'
        }
      );
    },
    upgradesText (): TranslateResult {
      return this.$t(
        'Make your Petsies {product} even more special with these common add-ons',
        {
          product: this.isFigurines ? 'Figurines' : 'Bobbleheads'
        }
      );
    },
    topStorySlug (): string {
      return this.isFigurines
        ? 'petsies_figurines_creation_page_top'
        : 'petsies_bobbleheads_creation_page_top';
    },
    bottomStorySlug (): string {
      return this.isFigurines
        ? 'petsies_figurines_creation_page_bottom'
        : 'petsies_bobbleheads_creation_page_bottom';
    },
    isFigurines (): boolean {
      return this.sku === figurinesSku;
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
    EventBus.$emit(ProductEvent.PRODUCT_PAGE_SHOW, this.getCurrentProduct);
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

      await Promise.all([
        this.$store.dispatch('budsies/loadProductBodyparts', { productId: product.id }),
        this.$store.dispatch('budsies/loadProductRushAddons', {
          productId: product.id
        })
      ])

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

  #clay-product {
    box-sizing: border-box;
    padding: 0 1rem;

    @media (min-width: $tablet-min) {
      max-width: 1272px;
      width: 100%;
      margin: 0 auto;

      .o-clay-product-order-form {
        margin-top: var(--spacer-lg);
      }
    }
  }
  </style>
