<template>
  <div class="o-bulkorder-quotation-form">
    <SfHeading
      :level="1"
      :title="formTitle"
      class="_title"
    />

    <p class="_subtitle">
      {{ $t('Excellent news! Based on your requirements, we are able to calculate your hassle-free custom ' + subtitleProductName + ' quote.') }}
    </p>

    <div class="_quotation-container">
      <div class="_bulkorder-description">
        <div class="_artwork">
          <img :src="bulkorderInfo.mainImage">
        </div>
        <div class="_description">
          {{ bulkorderInfo.description }}
        </div>
      </div>
      <div class="_quotes-selector" v-if="!isQuoteSelectionDisabled">
        <SfHeading
          :level="2"
          :title="$t('Select Your Preferred Quantity')"
        />

        <p class="_production-time">
          <Blok :item="productionTimeStoryContent" v-if="productionTimeStoryContent" />
        </p>

        <ul class="_quotes-list">
          <li v-for="quote in quotes" :key="quote.id">
            <SfRadio
              class="_quote-input"
              :value="quote.id + ''"
              v-model="quoteId"
            >
              <template #label>
                <div class="_quote-title">
                  {{ $t('Quantity') }} {{ quote.qty }}, {{ $t('Size') }} {{ bulkorderInfo.size }}"
                </div>
              </template>
              <template #description>
                <div class="_quote-description">
                  <div class="_quote-description-row">
                    <div>
                      {{ $t('Plush production') }}:
                    </div>
                    <div class="_price">
                      {{ getPrice(quote.productionPrice) }}
                    </div>
                  </div>
                  <div class="_quote-description-row">
                    <div>
                      {{ $t('Shipping/Delivery') }}:
                    </div>
                    <div class="_price">
                      {{ getPrice(quote.shippingPrice) }}
                    </div>
                  </div>
                  <div class="_quote-description-row -marked">
                    <div>
                      {{ $t('Total') }}:
                    </div>
                    <div class="_price">
                      {{ getPrice(quote.shippingPrice + quote.productionPrice) }}/pc
                    </div>
                  </div>
                  <div class="_quote-description-row" v-if="getSavingsForQuote(quote)">
                    <div class="_prompt">
                      {{ getSavingsForQuote(quote) }}
                    </div>
                  </div>
                </div>
              </template>
            </SfRadio>
          </li>
        </ul>
      </div>
    </div>

    <div class="_order-bulk-sample-action" v-if="!isQuoteSelectionDisabled">
      <SfHeading
        :title="orderBulkSampleTitle"
        :level="2"
      />

      <p class="_compare-to _prompt" v-if="showCompareTo">
        {{ $t('Compare to') }} $750!
      </p>

      <p class="_order-notices">
        <Blok :item="orderNoticesStoryContent" v-if="orderNoticesStoryContent" />
      </p>

      <m-addons-selector
        v-model="selectedAddons"
        :addons="addons"
        :disabled="isDisabled"
      />

      <div class="_submit-button-container">
        <SfButton class="_quote-submit-button" :disabled="isDisabled" @click="submit">
          {{ orderBulkSampleButtonTitle }}
        </SfButton>
      </div>
    </div>

    <div class="_send-message-to-manager" v-if="!isQuoteSelectionDisabled">
      <SfHeading
        title="Still have questions?"
        :level="4"
      />
      <SfButton
        class="_send-message-to-manager-btn"
        v-if="!isShowSendMessageToManagerForm"
        @click="isShowSendMessageToManagerForm = !isShowSendMessageToManagerForm"
      >
        {{ orderBulkSampleButtonTitle }}
      </SfButton>
    </div>

    <SfHeading
      class="_notification-title"
      v-if="isQuoteSelectionDisabled"
      :title="notificationTitle"
      :level="2"
    />

    <p class="_more-info" v-if="moreInfoStoryContent">
      <Blok :item="moreInfoStoryContent" />
    </p>
  </div>
</template>

<script lang="ts">
import Vue, { PropType, VueConstructor } from 'vue'
import { SfButton, SfHeading, SfRadio } from '@storefront-ui/vue'
import { getProductGallery as getGalleryByProduct } from '@vue-storefront/core/modules/catalog/helpers';
import { getProductDefaultPrice } from 'src/modules/shared';
import { components } from 'src/modules/vsf-storyblok-module/components';

import MAddonsSelector from 'theme/components/molecules/m-addons-selector.vue';
import BulkorderProduct from 'theme/interfaces/bulkorder-product.type';
import { BulkorderQuote, BulkOrderInfo, BulkOrderStatus } from 'src/modules/budsies';
import Product from '@vue-storefront/core/modules/catalog/types/Product';
import AddonOption from '../interfaces/addon-option.interface';
import { BundleOption } from '@vue-storefront/core/modules/catalog/types/BundleOption';
import { ItemData } from '../../../../modules/vsf-storyblok-module';
import { StoryblokStories } from '../../../../modules/vsf-storyblok-module/types/State';

export default (Vue as VueConstructor<Vue>).extend({
  props: {
    bulkorderInfo: {
      type: Object as PropType<BulkOrderInfo>,
      required: true
    },
    sampleProduct: {
      type: Object as PropType<Product>,
      required: true
    }
  },
  data () {
    return {
      quoteId: undefined,
      selectedAddons: [] as number [],
      isDataLoaded: false,
      isSubmitting: false,
      isShowSendMessageToManagerForm: false
    }
  },
  components: {
    MAddonsSelector,
    SfButton,
    SfHeading,
    SfRadio,
    Blok: components.block
  },
  computed: {
    quotes (): BulkorderQuote[] {
      return this.$store.getters['budsies/getBulkorderQuotes'](this.bulkorderInfo.id);
    },
    isDisabled (): boolean {
      return this.isSubmitting;
    },
    isQuoteSelectionDisabled (): boolean {
      return this.bulkorderInfo.statusId !== 1;
    },
    notificationTitle (): string {
      switch (this.bulkorderInfo.statusId) {
        case 2:
          return 'Our manager will contact you soon!';
        case 3:
          return 'Your order is in progress.';
        default:
          return '';
      }
    },
    productionTimeStorySlug (): string {
      let sampleProductPart = '_';

      if (this.bulkorderInfo.bulkorderProductId === BulkorderProduct.PILLOW) {
        sampleProductPart = '_pillow_';
      }

      if (this.bulkorderInfo.bulkorderProductId === BulkorderProduct.KEYCHAIN) {
        sampleProductPart = '_keychain_';
      }

      return `info/bulk${sampleProductPart}quote_production_time_text`;
    },
    productionTimeStoryContent (): ItemData | undefined {
      return this.getStoryContent(this.productionTimeStorySlug);
    },
    moreInfoStorySlug (): string {
      return 'blocks/bulk_order_quotation_page_more_info';
    },
    moreInfoStoryContent (): ItemData | undefined {
      return this.getStoryContent(this.moreInfoStorySlug);
    },
    orderNoticesStorySlug (): string {
      return 'blocks/bulk_order_quotation_page_order_notices';
    },
    orderNoticesStoryContent (): ItemData | undefined {
      return this.getStoryContent(this.orderNoticesStorySlug);
    },
    formTitle (): string {
      if (this.bulkorderInfo.bulkorderProductId === BulkorderProduct.PLUSHIE) {
        return this.$t('Bulk Quote');
      }

      return this.$t(`Bulk ${this.sampleProductName} Quote`);
    },
    subtitleProductName (): string {
      switch (this.bulkorderInfo.bulkorderProductId) {
        case BulkorderProduct.PLUSHIE:
        case BulkorderProduct.KEYCHAIN:
          return 'stuffed animal';
        case BulkorderProduct.PILLOW:
          return 'pillow';
        default:
          return '';
      }
    },
    showCompareTo (): boolean {
      switch (this.bulkorderInfo.bulkorderProductId) {
        case BulkorderProduct.PLUSHIE:
        case BulkorderProduct.KEYCHAIN:
          return true;
        default:
          return false;
      }
    },
    orderBulkSampleTitle (): string {
      return this.$t('Next Step: Get your sample - just') + ` ${this.sampleProductPrice}`;
    },
    orderBulkSampleButtonTitle (): string {
      return this.$t(`Get Your Custom ${this.sampleProductName} Sample`);
    },
    sampleProductName (): string {
      switch (this.bulkorderInfo.bulkorderProductId) {
        case BulkorderProduct.PLUSHIE:
          return 'Plush';
        case BulkorderProduct.PILLOW:
          return 'Pillow';
        case BulkorderProduct.KEYCHAIN:
          return 'Keychain';
        default:
          return '';
      }
    },
    sampleProductPrice (): string {
      let price = 0;

      if (this.sampleProduct) {
        price = getProductDefaultPrice(this.sampleProduct, {}, false).regular;
      }

      return '$' + price.toString();
    },
    addons (): AddonOption[] {
      if (!this.addonsBundleOption) {
        return []
      }

      let result: AddonOption[] = [];
      for (const productLink of this.addonsBundleOption.product_links) {
        if (!productLink.product) {
          continue;
        }

        if (productLink.sku.indexOf('sneak_peek') > -1) {
          continue;
        }

        const images: string[] = getGalleryByProduct(productLink.product).map((i: any) => i.src);
        const price = getProductDefaultPrice(productLink.product, {}, false);

        result.push({
          id: Number(productLink.product.id),
          sku: productLink.product.sku,
          name: productLink.product.name,
          description: productLink.product.short_description || '',
          price: price.special ? price.special : price.regular,
          images: images,
          optionId: this.addonsBundleOption.option_id,
          optionValueId: ((typeof productLink.id === 'number') ? productLink.id : Number.parseInt(productLink.id, 10) as number),
          videoUrl: (productLink.product as any).video_url
        });
      }

      return result;
    },
    addonsBundleOption (): BundleOption | undefined {
      if (!this.sampleProduct || !this.sampleProduct.bundle_options) {
        return;
      }

      return this.sampleProduct.bundle_options.find(
        (option: BundleOption) => option.title.toLowerCase() === 'addons'
      );
    }
  },
  async beforeMount () {
    if (!this.isDataLoaded) {
      await this.loadData();
    }
  },
  methods: {
    getPrice (price: number): string {
      return '$' + price.toFixed(2);
    },
    getSavingsForQuote (quote: BulkorderQuote): string {
      const quoteIndex = this.quotes.indexOf(quote);

      if (quoteIndex < 1 || !this.quotes.hasOwnProperty(quoteIndex - 1)) {
        return '';
      }

      const previousQuote = this.quotes[quoteIndex - 1];
      const savings = quote.qty * previousQuote.getFinalPrice() - quote.getTotalPrice();

      return `Save $${savings.toFixed(2)}!`;
    },
    getStoryContent (slug: string): ItemData | undefined {
      const story = this.$store.state.storyblok.stories[slug] ? this.$store.state.storyblok.stories[slug] : undefined;

      if (!story?.story?.content) {
        return undefined;
      }

      return story.story.content;
    },
    async loadData (): Promise<void> {
      await Promise.all([
        this.$store.dispatch('storyblok/loadStory', { fullSlug: this.productionTimeStorySlug }),
        this.$store.dispatch('storyblok/loadStory', { fullSlug: this.moreInfoStorySlug }),
        this.$store.dispatch('storyblok/loadStory', { fullSlug: this.orderNoticesStorySlug }),
        this.$store.dispatch('budsies/loadBulkorderQuotes', {
          bulkorderId: this.bulkorderInfo.id
        })
      ]);

      this.quoteId = this.quotes[0] ? this.quotes[0].id + '' : undefined;

      this.isDataLoaded = true;
    },
    async submit (): Promise<void> {
      if (this.isDisabled || !this.quoteId) {
        return;
      }

      if (!this.$store.getters['cart/getCartToken']) {
        await this.$store.dispatch('cart/connect', { guestCart: true });
      }

      const include3dRendering = false;

      this.isSubmitting = true;

      try {
        await this.$store.dispatch(
          'budsies/chooseQuote',
          {
            quoteId: this.quoteId,
            include3dRendering
          }
        );

        await this.$store.dispatch('cart/synchronizeCart', { forceClientState: false, forceSync: true });

        this.$router.push({ name: 'detailed-cart' });
      } finally {
        this.isSubmitting = false;
      }
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

$quote-background-color: #e9f0d8;
$sample-background-color: #e4f5f1;
$promt-color: #8eba4c;

.o-bulkorder-quotation-form{
  ._subtitle {
    text-align: center;
  }

  ._notification-title {
    margin: var(--spacer-lg) 0;
  }

  ._quotation-container {
    margin-top: var(--spacer-lg);
    display: flex;
    column-gap: var(--spacer-lg);
    flex-direction: column;
    justify-content: center;

    @media (min-width: $tablet-min) {
      flex-direction: row;
    }
  }

  ._prompt {
    text-align: right;
    color: $promt-color;
    font-style: italic;
    font-weight: var(--font-bold);
  }

  ._compare-to {
    margin-top: var(--spacer-sm);
    margin-right: var(--spacer-xl);

    @media (min-width: $tablet-min) {
      margin-right: var(--spacer-3xl);
    }
  }

  ._quotes-selector {
    ._quotes-list {
      list-style: none;
    }

    ._quote-title {
      font-weight: var(--font-bold);
    }

    ._quote-description {
      margin-top: var(--spacer-xs);
      font-size: var(--font-xs);
    }

    ._quote-description-row {
      margin-top: var(--spacer-2xs);
      width: 100%;
      display: flex;
      justify-content: space-between;

      &.-marked {
        font-weight: var(--font-bold);
      }

      &.-marked > ._price {
        border-top: solid 1px var(--c-text);
      }

      @media (min-width: $desktop-min) {
        width: 50%;
      }
    }

    ._quote-description-row > ._prompt {
      text-align: right;
      width: 100%;
    }
  }

  ._bulkorder-description {
    width: 100%;
    text-align: center;

    ._description {
      text-align: center;
      margin-top: var(--spacer-sm);
    }

    ._artwork > img {
      max-width: 100%;
    }

    @media (min-width: $tablet-min) {
      width: 45%;
    }
  }

  ._order-bulk-sample-action {
    margin-top: var(--spacer-lg);
    padding: var(--spacer-lg);
    background-color: $sample-background-color;
  }

  ._submit-button-container {
    display: flex;
    justify-content: center;

    ._quote-submit-button {
      margin-top: var(--spacer-2xl);
      margin-bottom: var(--spacer-xl);
    }
  }

  .sf-radio {
    --radio-background: #{$quote-background-color};
  }

  ::v-deep{
    .m-addons-selector {
      ._addon-input {
        &.sf-checkbox--is-active {
          background-color: var(--c-blue);
        }
      }
    }
  }
}
</style>
