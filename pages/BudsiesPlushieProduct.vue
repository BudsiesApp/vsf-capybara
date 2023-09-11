<template>
  <div id="budsies-plushie-product">
    <product-structured-data
      v-if="getCurrentProduct"
      :product="getCurrentProduct"
    />

    <o-budsies-plushie-product-order-form
      :artwork-upload-url="artworkUploadUrl"
      :artwork-upload-top-helper-text="artworkUploadTopHelperText"
      :bottom-story-slug="bottomStorySlug"
      :customize-step-subtitle="customizeStepSubtitle"
      :description-placeholder-text="descriptionPlaceholderText"
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
        <p
          v-if="isBudsieProduct || isNftBudsieProduct"
          class="_inspiration-machine"
        >
          {{ $t('Don\'t have a good character? Get inspired by our') }}

          <router-link target="_blank" :to="{name: 'inspiration-machine'}">
            {{ $t('Inspiration Machine') }}!
          </router-link>
        </p>

        <div class="_helper-text" v-if="isSelfiesProduct">
          {{ $t('You may provide up to 3 photos for each person.') }}

          <br>

          {{ $t('Read our') }} <a
            class="_popup-link"
            href="javascript:void(0)"
            @click.stop.prevent="showPhotoTips = true"
          >{{ $t('photo tips!') }}</a>
        </div>
      </template>

      <template #description-helper-text>
        <template v-if="showBudsiesDescriptionHelperText">
          {{ $t('Please provide as much direction as possible to help us understand the artwork.') }}
          <br>
          {{ $t('Features, colors, & even mood are all helpful') }}
        </template>

        <template v-if="showSelfiesDescriptionHelperText">
          {{
            $t(
              'Please provide a description of the photo to help us most accurately create the {product}. Features, colors, clothing, accessories, and even mood are all helpful',
              {
                product: productName
              }
            )
          }}
        </template>
      </template>

      <template #actions-helper-text v-if="showSelfiesActionsHelperText">
        <span class="_actions-helper-text">
          {{ $t('Please order') }}
          <b>{{ $t('two') }}</b>
          {{ $t('Selfies if you have') }}
          <b>{{ $t('two') }}</b>
          {{ $t('people in your photo') }}
        </span>
      </template>
    </o-budsies-plushie-product-order-form>

    <SfModal
      :visible="showPhotoTips"
      @close="showPhotoTips = false"
    >
      <div class="_popup-content">
        <SfHeading :title="$t('Photo Tips')" :level="3" />

        <ul class="_photo-tips">
          <li>
            {{ $t('Most customers just upload one photo') }}
          </li>

          <li>
            {{ $t('Some customers use multiple photos to mix and match outfits or accessories') }}
          </li>
        </ul>
      </div>
    </SfModal>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import config from 'config';
import { htmlDecode } from '@vue-storefront/core/filters';
import { catalogHooksExecutors } from '@vue-storefront/core/modules/catalog-next/hooks';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import { SfHeading, SfModal } from '@storefront-ui/vue';

import Product from 'core/modules/catalog/types/Product';

import { ProductStructuredData } from 'src/modules/budsies';

import OBudsiesPlushieProductOrderForm from 'theme/components/organisms/o-budsies-plushie-product-order-form.vue';

const budsieProductSku = 'CustomBudsie1_bundle';
const budsiesPuppetsProductSku = 'budsiesPuppet_bundle';

const budsiesProductSkus = [
  budsieProductSku,
  budsiesPuppetsProductSku
];

const selfieProductSku = 'CustomSelfie_bundle';
const selfiesPuppetsProductSku = 'selfiesPuppet_bundle';

const selfiesProductSkus = [
  selfieProductSku,
  selfiesPuppetsProductSku
];

const nftBudsieProductSku = 'budsieNft_bundle';

export default Vue.extend({
  name: 'BudsiesPlushieProduct',
  components: {
    OBudsiesPlushieProductOrderForm,
    SfHeading,
    SfModal,
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
      isDataLoaded: false,
      showPhotoTips: false
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
      if (this.isSelfiesProduct) {
        return this.$t(
          'Please order each person in the photo as a separate {product}',
          {
            product: this.productName
          }
        ).toString();
      }

      return this.$t(
        'Please order each unique design as a separate {product}',
        {
          product: this.productName
        }
      ).toString();
    },
    customizeStepSubtitle (): string {
      if (this.isSelfiesProduct) {
        return this.$t(
          'Customize Your {product}',
          {
            product: this.productName
          }
        ).toString();
      }

      return this.$t(
        'Describe Your {product}',
        { product: this.productName }
      ).toString();
    },
    descriptionPlaceholderText (): string {
      if (this.isSelfiesProduct) {
        return this.$t(
          'Grandpa is a happy man with a big bushy white beard. He\'s wearing a red baseball cap, green short sleeved shirt, and jeans. He\'s wearing white sneakers.'
        ).toString();
      }

      return this.$t('Oinker is a pig that\'s purple with green spots. Has a ball-shaped nose, really big toes, one green eye and one red eye, and a green curly tail.').toString();
    },
    emailUploadImagesCountText (): string {
      if (this.isSelfiesProduct) {
        return this.$t(
          'You may include up to 3 photos in your email (all of the same person)'
        ).toString();
      }

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
    isNftBudsieProduct (): boolean {
      return this.sku === nftBudsieProductSku;
    },
    isSelfiesProduct (): boolean {
      return selfiesProductSkus.includes(this.sku);
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
        case selfieProductSku:
          return 'Budsies Selfies';
        case selfiesPuppetsProductSku:
          return 'Selfies Puppets'
        case nftBudsieProductSku:
          return 'Budsies NFT';
        default:
          throw new Error('Unexpected product sku');
      }
    },
    topStorySlug (): string {
      switch (this.sku) {
        case budsieProductSku:
        case nftBudsieProductSku:
          return 'budsies_creation_page_top';
        case budsiesPuppetsProductSku:
          return 'budsies_puppet_creation_page_top';
        case selfieProductSku:
          return 'selfies_creation_page_top';
        case selfiesPuppetsProductSku:
          return 'selfies_puppet_creation_page_top';
        default:
          throw new Error('Unexpected product sku');
      }
    },
    bottomStorySlug (): string {
      switch (this.sku) {
        case budsieProductSku:
        case nftBudsieProductSku:
          return 'budsies_creation_page_bottom';
        case budsiesPuppetsProductSku:
          return 'budsies_puppet_creation_page_bottom';
        case selfieProductSku:
          return 'selfies_creation_page_bottom';
        case selfiesPuppetsProductSku:
          return 'selfies_puppet_creation_page_bottom';
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
    showBudsiesDescriptionHelperText (): boolean {
      return budsiesProductSkus.includes(this.sku);
    },
    showSelfiesDescriptionHelperText (): boolean {
      return selfiesProductSkus.includes(this.sku);
    },
    showSelfiesActionsHelperText (): boolean {
      return this.sku === selfieProductSku;
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

      await Promise.all([
        this.$store.dispatch('budsies/loadProductRushAddons', { productId: product.id }),
        this.$store.dispatch('budsies/loadProductBodyparts', { productId: product.id })
      ]);

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
  $inspirationMachineBackground: #f5ebb7;

  box-sizing: border-box;
  padding: var(--spacer-lg) 1rem 0;

  ._popup-content {
    --modal-content-padding: var(--spacer-sm);

    text-align: left;

    ._photo-tips {
      margin-top: var(--spacer-base);
      padding: 0;
    }
  }

  ._actions-helper-text {
    font-size: var(--font-sm);
    margin-top: var(--spacer-sm);
  }

  ._inspiration-machine {
    background: $inspirationMachineBackground;
    border-radius: var(--spacer-lg);
    display: inline-block;
    padding: var(--spacer-xs) var(--spacer-lg);
  }

  @media (min-width: $tablet-min) {
    max-width: 1272px;
    width: 100%;
    margin: 0 auto;
  }
}
</style>
