<template>
  <div id="creativity-kit-product">
    <product-structured-data
      v-if="getCurrentProduct"
      :product="getCurrentProduct"
    />

    <m-block-story
      story-slug="budsies-gift-box-page-top"
      class="_story"
    />

    <div class="_form-wrapper">
      <div class="_image">
        <div class="_image-container">
          <BaseImage
            :alt="getCurrentProduct ? getCurrentProduct.name : ''"
            :lazy="false"
            width="457px"
            :aspect-ratio="1"
            :src="productImageSrc"
          />

          <div class="_image-caption">
            {{ $t('Recommended for ages 4+') }}
          </div>
        </div>
      </div>

      <div class="_form-container">
        <ul class="_dot-list">
          <li class="_dot-item">
            {{ $t('The perfect holiday gift (even last minute!)') }}
          </li>

          <li class="_dot-item">
            {{ $t('Encourages children to express their creativity') }}
          </li>

          <li class="_dot-item">
            {{ $t('Contains everything to draw creatures and turn them into Budsies') }}
          </li>
        </ul>

        <o-creativity-kit-product-order-form
          class="_form"
          :budsie-product-price="budsieProductPrice"
          :superized-addon-price="superizedAddonPrice"
          :product="getCurrentProduct"
          v-if="showForm"
        />
      </div>
    </div>

    <m-block-story
      story-slug="budsies-gift-box-page-bottom"
      class="_bottom-story"
    />

    <m-social-sharing
      class="_social-sharing"
      :sharing-url="sharingData.sharingUrl"
      :sharing-description="sharingData.sharingDescription"
      :e-mail-subject="sharingData.eMailSubject"
      :twitter-description="sharingData.twitterDescription"
      :image="sharingData.image"
    />
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';

import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { htmlDecode } from '@vue-storefront/core/filters';
import { PRODUCT_PRICE_DICTIONARY } from '@vue-storefront/core/modules/catalog';
import { catalogHooksExecutors } from '@vue-storefront/core/modules/catalog-next/hooks';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import Product from '@vue-storefront/core/modules/catalog/types/Product';

import { PriceHelper, ProductEvent } from 'src/modules/shared';
import { BaseImage, ProductStructuredData } from 'src/modules/budsies';

import OCreativityKitProductOrderForm from 'theme/components/organisms/CreativityKitProduct/o-creativity-kit-product-order-form.vue';
import MBlockStory from 'theme/components/molecules/m-block-story.vue';
import MSocialSharing from 'theme/components/molecules/m-social-sharing.vue';

const giftBoxSku = 'CreativityKit_bundle';
const budsieShippingPrice = 9.95;
const budsieProductSku = 'CustomBudsie1_bundle';
const superizeAddonSku = 'supersize';

interface InjectedServices {
  window: Window
}

export default (Vue as VueConstructor<Vue & InjectedServices>).extend({
  name: 'CreativityKitProduct',
  components: {
    BaseImage,
    MBlockStory,
    MSocialSharing,
    OCreativityKitProductOrderForm,
    ProductStructuredData
  },
  inject: {
    window: { from: 'WindowObject' }
  },
  data () {
    return {
      isDataLoaded: false
    }
  },
  computed: {
    getCurrentProduct (): Product | null {
      const product = this.$store.getters['product/getCurrentProduct'];

      if (product?.sku !== giftBoxSku) {
        return null;
      }

      return product;
    },
    productImageSrc (): string {
      const productGallery = this.$store.getters['product/getProductGallery'];

      return productGallery[0]?.src || '';
    },
    getBudsieProduct (): Product | null {
      const productBySku = this.$store.getters['product/getProductBySkuDictionary'];
      return productBySku[budsieProductSku];
    },
    productPriceDictionary (): Record<string, PriceHelper.ProductPrice> {
      return this.$store.getters[PRODUCT_PRICE_DICTIONARY];
    },
    budsieProductPrice (): number {
      if (!this.getBudsieProduct) {
        return budsieShippingPrice;
      }

      const price = this.productPriceDictionary[this.getBudsieProduct.id];
      const finalPrice = PriceHelper.getFinalPrice(price);

      return finalPrice + budsieShippingPrice;
    },
    superizedAddonPrice (): number {
      if (!this.superizedAddonProduct) {
        return 0;
      }

      const price = this.productPriceDictionary[this.superizedAddonProduct.id];

      return PriceHelper.getFinalPrice(price);
    },
    sharingData (): {
      sharingUrl: string,
      sharingDescription: string,
      eMailSubject: string,
      twitterDescription: string,
      image: string
    } {
      return {
        sharingUrl: this.window.location ? this.window.location.href : '',
        sharingDescription: this.$t('Budsies Gift Box is the perfect gift and includes everything to unlock a child\'s creativity and turn their drawings into custom stuffed animals').toString(),
        eMailSubject: this.$t('Check out Budsies!').toString(),
        twitterDescription: this.$t('The @BudsiesToys Gift Box lets your kids draw art and turn it into a real stuffed animal!') + ' https://pic.twitter.com/61tLGc5aeB',
        image: '/assets/images/creativityKit/creativity-kit.png'
      }
    },
    showForm (): boolean {
      return this.isDataLoaded && !!this.getCurrentProduct;
    },
    superizedAddonProduct (): Product | undefined {
      if (!this.getBudsieProduct) {
        return;
      }

      const addonsBundleOption = this.getBudsieProduct.bundle_options?.find(
        (option) => option.title.toLowerCase() === 'addons'
      )

      if (!addonsBundleOption) {
        return;
      }

      const productLink = addonsBundleOption.product_links.find((productLink) => {
        return productLink.product &&
          productLink.product.sku === superizeAddonSku;
      });

      return productLink?.product;
    }
  },
  async serverPrefetch () {
    await (this as any).loadData();
  },
  async beforeMount () {
    if (!this.getCurrentProduct || !this.getBudsieProduct) {
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
          parentSku: giftBoxSku,
          setCurrent: true
        }),
        this.$store.dispatch('product/loadProduct', {
          parentSku: budsieProductSku,
          setCurrent: false
        })
      ]);

      this.isDataLoaded = true;
      catalogHooksExecutors.productPageVisited(product);
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
})
</script>

<style lang="scss" scoped>
@import "theme/css/base/_breakpoints.scss";

#creativity-kit-product {
  $max-section-width: 1272px;
  --section-side-padding: var(--spacer-sm);

  box-sizing: border-box;

  ._story {
    max-width: $max-section-width;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
  }

  ._image-container {
    position: relative;
    display: flex;
  }

  ._image {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-start;

    .base-image {
      border-radius: 27px;
    }
  }

  ._form {
    margin-top: var(--spacer-xl);
  }

  ._description {
    margin-top: var(--spacer-lg);
  }

  ._form-wrapper {
    margin: var(--spacer-xl) auto 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding: 0 var(--section-side-padding);
    max-width: $max-section-width;
    box-sizing: border-box;

    ._image {
      ._image-caption {
        position: absolute;
        left: 30px;
        right: 30px;
        top: 100%;
        padding: var(--spacer-xs) var(--spacer-lg);
        border-radius: 25px;
        background: #fbd241;
        line-height: 1;
        transform: translateY(-50%);
        text-align: center;
      }
    }

    ._form-container {
      margin-top: var(--spacer-xl);
      flex-grow: 1;
    }
  }

  ._dot-item {
    margin-top: var(--spacer-sm);

    &:first-child {
      margin-top: 0;
    }
  }

  ._social-sharing {
    margin-top: var(--spacer-2xl);
    text-align: center;
  }

  @media (min-width: $tablet-min) {
    --section-side-padding: var(--spacer-base);

    .o-creativity-kit-product-order-form {
      margin-top: var(--spacer-lg);
    }
  }

  ._bottom-story {
    margin-top: var(--spacer-lg);
  }

  @include for-desktop {
    ._image {
      justify-content: flex-start;
    }

    ._form-wrapper {
      flex-wrap: nowrap;
      column-gap: var(--spacer-xl);

      ._form-container {
        margin-top: var(--spacer-lg);
      }
    }
  }
}
</style>
