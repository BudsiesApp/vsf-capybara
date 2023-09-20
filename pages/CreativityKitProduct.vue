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
          <img src="/assets/images/creativityKit/creativity-kit.png">

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

    <div class="_section">
      <SfHeading
        class="_title"
        :level="2"
        :title="$t('Explore the Magical Contents')"
      />

      <div class="_content">
        <div
          class="_image _book-preview-image"
          @click="showBookPreview"
        >
          <SfHeading
            class="small-mobile-only _content-title"
            :level="3"
            :title="$t('Dongler\'s Dinner Quest: Storybook + Drawing Book')"
          />

          <img src="/assets/images/creativityKit/dinner-quest.png">

          <div class="_book-preview">
            <i class="_ico-magnify" />

            <span class="_preview-text">
              {{ $t('See Preview') }}
            </span>
          </div>
        </div>

        <div class="_description">
          <SfHeading
            class="tablet-up-only _content-title"
            :level="3"
            :title="$t('Dongler\'s Dinner Quest: Storybook + Drawing Book')"
          />

          <ul class="_dot-list">
            <li class="_dot-item">
              {{ $t('Dongler\'s story inspires imagination while the integrated drawing pages provide an outlet for your child\'s artistry') }}
            </li>

            <li class="_dot-item">
              {{ $t('Join Dongler on his journey home from a long day at the Charming Chowmungle Chocolate factory') }}
            </li>

            <li class="_dot-item">
              {{ $t('Overcome 3 challenges along the way by drawing friendly creatures that help Dongler get home to his lovely wife') }}
            </li>

            <li class="_dot-item">
              {{ $t('Share your child\'s drawings and see what other children from around the world have created') }}
            </li>
          </ul>
        </div>

        <div class="_featured-items">
          <div class="_row">
            <a-creativity-kit-item
              class="_item"
              :title="$t('Budsies Crayons')"
              :description="$t('High quality 24 count crayons for making the most magical doodles')"
              image="/assets/images/creativityKit/crayons.png"
            />

            <a-creativity-kit-item
              class="_item"
              :title="$t('Budsies Sketchpad')"
              :description="$t('The perfect canvas for your creativity')"
              image="/assets/images/creativityKit/sketchpad.png"
            />
          </div>

          <div class="_row">
            <a-creativity-kit-item
              class="_item"
              :title="$t('Budsies Colored Pencils')"
              :description="$t('12 colorful ways for more advanced artists to sketch out your new friend')"
              image="/assets/images/creativityKit/pencils.png"
            />

            <a-creativity-kit-item
              class="_item"
              :title="$t('Official Budsies Mascot')"
              :description="$t('Our huggable 6” Dongler keeps you company while you doodle')"
              image="/assets/images/creativityKit/mascot.png"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="_section -without-main-heading">
      <div class="_content">
        <div class="_image">
          <SfHeading
            class="_content-title small-mobile-only"
            :level="3"
            :title="$t('Budsies Voucher')"
          />

          <div class="_subtitle small-mobile-only">
            ({{ $t('recommended') }})
          </div>

          <img src="/assets/images/creativityKit/voucher.png">
        </div>

        <div class="_description">
          <SfHeading
            class="_content-title tablet-up-only"
            :level="3"
            :title="$t('Budsies Voucher')"
          />

          <div class="_subtitle tablet-up-only">
            ({{ $t('recommended') }})
          </div>

          <ul class="_dot-list">
            <li class="_dot-item">
              {{ $t('We bring the lucky child\'s artwork to life!') }}
            </li>

            <li class="_dot-item">
              {{ $t('Voucher available for either a 16″ regular sized or 30″ supersized custom plush Budsie') }}
            </li>

            <li class="_dot-item">
              {{ $t('Includes shipping & handling to US address') }}
            </li>

            <li class="_dot-item">
              {{ $t('The perfect next step for the child\'s drawings') }}
            </li>
          </ul>
        </div>
      </div>

      <m-social-sharing
        class="_social-sharing"
        :sharing-url="sharingData.sharingUrl"
        :sharing-description="sharingData.sharingDescription"
        :e-mail-subject="sharingData.eMailSubject"
        :twitter-description="sharingData.twitterDescription"
        :image="sharingData.image"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { SfHeading } from '@storefront-ui/vue';

import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { htmlDecode } from '@vue-storefront/core/filters';
import { catalogHooksExecutors } from '@vue-storefront/core/modules/catalog-next/hooks';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import Product from 'core/modules/catalog/types/Product';
import { getProductDefaultPrice, ProductEvent } from 'src/modules/shared';

import { ProductStructuredData } from 'src/modules/budsies';

import OCreativityKitProductOrderForm from 'theme/components/organisms/CreativityKitProduct/o-creativity-kit-product-order-form.vue';
import MBlockStory from 'theme/components/molecules/m-block-story.vue';
import MSocialSharing from 'theme/components/molecules/m-social-sharing.vue';
import ACreativityKitItem from 'theme/components/organisms/CreativityKitProduct/a-creativity-kit-item.vue';
import { ModalList } from 'theme/store/ui/modals';

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
    ACreativityKitItem,
    MBlockStory,
    MSocialSharing,
    OCreativityKitProductOrderForm,
    ProductStructuredData,
    SfHeading
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
    getBudsieProduct (): Product | null {
      const productBySku = this.$store.getters['product/getProductBySkuDictionary'];
      return productBySku[budsieProductSku];
    },
    budsieProductPrice (): number {
      const price = getProductDefaultPrice(
        this.getBudsieProduct,
        {},
        false
      );
      const finalPrice = price.special && price.special < price.regular
        ? price.special
        : price.regular;

      return finalPrice + budsieShippingPrice;
    },
    superizedAddonPrice (): number {
      const price = getProductDefaultPrice(
        this.superizedAddonProduct,
        {},
        false
      );

      return price.special && price.special < price.regular
        ? price.special
        : price.regular;
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
        twitterDescription: this.$t('The @BudsiesToys Gift Box lets your kids draw art and turn it into a real stuffed animal!') + ' http://pic.twitter.com/61tLGc5aeB',
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
    if (this.$ssrContext) this.$ssrContext.output.cacheTags.add('product')

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
    },
    showBookPreview (): void {
      this.$store.dispatch('ui/openModal', {
        name: ModalList.ImagesGallery,
        payload: {
          images: [
            '/assets/images/creativityKit/dinner-quest-preview_1.png',
            '/assets/images/creativityKit/dinner-quest-preview_2.png',
            '/assets/images/creativityKit/dinner-quest-preview_3.png',
            '/assets/images/creativityKit/dinner-quest-preview_4.png'
          ]
        }
      })
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
@import "theme/css/mixins/wave.scss";

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

    img {
      max-width: 100%;
      border-radius: 27px;
      object-fit: contain;
    }
  }

  ._book-preview-image {
    overflow: hidden;
    border-radius: 30px;
    cursor: pointer;
  }

  ._book-preview {
    position: absolute;
    box-sizing: border-box;
    bottom: -12px;
    right: -15px;
    width: 116px;
    height: 116px;
    padding-top: 24px;
    border-radius: 50%;
    background: #fbd241;
    line-height: 1.14;
    color: #4d546c;
    font-weight: var(--font-bold);
    text-align: center;

    &:hover {
      opacity: 0.9;
    }

    ._preview-text {
      display: block;
      padding: 4px 15px 0;
    }

    ._ico-magnify {
      display: inline-block;
      width: 25px;
      height: 25px;
      vertical-align: top;
      background: url(/assets/images/ico-magnify.png) no-repeat 0 0;
    }
  }

  ._form {
    margin-top: var(--spacer-xl);
  }

  ._content-title {
    margin-top: var(--spacer-lg);
    flex-basis: 100%;
  }

  ._description {
    margin-top: var(--spacer-lg);
  }

  ._featured-items {
    margin-top: var(--spacer-2xl);
    padding-top: var(--spacer-xl);
    border-top: 1px solid #e9e9e9;

    ._item {
      margin-top: var(--spacer-lg);
      flex-basis: 100%;

      &:first-child {
        margin-top: 0;
      }
    }
  }

  ._row {
    display: flex;
    flex-wrap: wrap;
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

  ._section {
    padding: var(--spacer-2xl) var(--section-side-padding) 0;
    margin-top: var(--spacer-2xl);

    &:nth-child(even) {
      @include wave-section-yellow;

      background: linear-gradient(to bottom,
          #fbf5e7 0%,
          #fcf7ed 47%,
          #ffffff 100%);
    }

    &:nth-child(odd) {
      @include wave-section-blue;

      background: linear-gradient(to bottom,
          #e4f5f1 0%,
          #e9f9f2 47%,
          #e9f9f2 47%,
          #fcfefd 87%,
          #ffffff 100%);
    }

    ._title {
      --heading-title-font-weight: var(--font-bold);
    }

    ._image {
      img {
        margin-top: var(--spacer-base);
      }
    }

    ._content {
      box-sizing: border-box;
      max-width: calc(#{$max-section-width} - 2 * var(--section-side-padding));
      width: 100%;
      margin: 0 auto;
    }
  }

  ._dot-item {
    margin-top: var(--spacer-sm);

    &:first-child {
      margin-top: 0;
    }
  }

  ._subtitle {
    color: var(--c-danger);
    width: 100%;
    text-align: center;
    font-size: var(--font-lg);
    font-weight: var(--font-bold);
  }

  ._social-sharing {
    margin-top: var(--spacer-2xl);
    text-align: center;
  }

  @media (min-width: $tablet-min) {
    --section-side-padding: var(--spacer-base);

    .o-creativity-kit-product-order-form {
      margin-top: var(--spacer-lg);

      ::v-deep {
        .sf-heading {
          --heading-text-align: start;
        }
      }
    }

    ._section {

      &.-without-main-heading {
        ._content {
          margin-top: 0;
        }
      }

      &:nth-child(odd) {
        ._content {
          flex-direction: row-reverse;
        }
      }

      ._content {
        display: flex;
        flex-wrap: wrap;
        margin-top: var(--spacer-2xl);

        .sf-heading {
          --heading-text-align: start;
        }

        ._image {
          flex-basis: 40%;
        }

        ._subtitle {
          text-align: start;
        }

        ._description {
          margin: 0 0 0 var(--spacer-lg);
          flex-grow: 1;
          flex-basis: 50%;
        }

        ._image {
          img {
            margin-top: 0;
          }
        }

        ._content-title {
          margin-top: 0;
        }

        ._dot-list {
          margin-top: var(--spacer-base);
        }
      }
    }

    ._featured-items {
      border-top: none;
      padding-top: 0;

      ._row {
        flex-wrap: nowrap;
        align-items: flex-start;
        margin-top: var(--spacer-base);
        padding-top: var(--spacer-base);
        border-top: 1px solid #e9e9e9;

        &:first-child {
          margin-top: 0;
        }

        ._item {
          margin-top: 0;
          margin-left: var(--spacer-lg);

          &:first-child {
            margin-left: 0;
          }
        }
      }
    }
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
