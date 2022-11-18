<template>
  <div
    class="o-bulkorder-quotation-form"
  >
    <SfHeading
      :level="1"
      :title="formTitle"
      class="_main-heading"
    />

    <p>
      {{ $t('Excellent news! Based on your requirements, we are able to calculate your hassle-free custom ' + subtitleProductName + ' quote.') }}
    </p>

    <SfHeading
      :level="2"
      :title="$t('Select Your Preferred Quantity')"
    />

    <p class="_production-time">
      <slot name="productionTime" />
    </p>

    <ul class="_quotes-list">
      <li v-for="quote in quotes" :key="quote.id">
        <SfRadio
          class="_quote-input"
          :value="quote.id + ''"
          v-model="quoteId"
        >
          <template #label>
            {{ $t('Quantity') }} {{ quote.qty }}, {{ $t('Size') }} {{ size }}
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
            </div>
          </template>
        </SfRadio>
      </li>
    </ul>

    <div class="_order-bulk-sample-action">
      <SfHeading
        :title="orderBulkSampleTitle"
        :level="2"
      />
      <p class="_compare-to _prompt" v-if="showCompareTo">
        {{ $t('Compare to') }} $750!
      </p>

      <m-addons-selector
        v-model="selectedAddons"
        :addons="addons"
        :disabled="isDisabled"
      />

      <SfButton>
        {{ orderBulkSampleButtonTitle }}
      </SfButton>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType, VueConstructor } from 'vue'
import { SfButton, SfHeading, SfRadio } from '@storefront-ui/vue'
import { getProductGallery as getGalleryByProduct } from '@vue-storefront/core/modules/catalog/helpers';
import { getProductDefaultPrice } from 'src/modules/shared';

import MAddonsSelector from 'theme/components/molecules/m-addons-selector.vue';
import BulksampleProduct from 'theme/interfaces/bulksample-product.type';
import { BulkorderQuote } from 'src/modules/budsies';
import Product from '@vue-storefront/core/modules/catalog/types/Product';
import AddonOption from '../interfaces/addon-option.interface';
import { BundleOption } from '@vue-storefront/core/modules/catalog/types/BundleOption';

export default (Vue as VueConstructor<Vue>).extend({
  props: {
    quotes: {
      type: Array as PropType<BulkorderQuote[]>,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    sampleType: {
      type: String as PropType<BulksampleProduct>,
      required: true
    },
    sampleProduct: {
      type: Object as PropType<Product>,
      required: true
    },
    productionTimeStorySlug: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      quoteId: undefined,
      selectedAddons: [] as number [],
      isSubmitting: false
    }
  },
  components: {
    MAddonsSelector,
    SfButton,
    SfHeading,
    SfRadio
  },
  computed: {
    isDisabled (): boolean {
      return this.isSubmitting;
    },
    formTitle (): string {
      if (this.sampleType === BulksampleProduct.PLUSH) {
        return this.$t('Bulk Quote');
      }

      return this.$t(`Bulk ${this.sampleProductName} Quote`);
    },
    subtitleProductName (): string {
      switch (this.sampleType) {
        case BulksampleProduct.PLUSH:
        case BulksampleProduct.KEYCHAIN:
          return 'stuffed animal';
        case BulksampleProduct.PILLOW:
          return 'pillow';
        default:
          return '';
      }
    },
    showCompareTo (): boolean {
      switch (this.sampleType) {
        case BulksampleProduct.PLUSH:
        case BulksampleProduct.KEYCHAIN:
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
      switch (this.sampleType) {
        case BulksampleProduct.PLUSH:
          return 'Plush';
        case BulksampleProduct.PILLOW:
          return 'Pillow';
        case BulksampleProduct.KEYCHAIN:
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
    this.loadStories();
  },
  methods: {
    getPrice (price: number): string {
      return '$' + price.toFixed(2);
    },
    loadStories (): void {
      this.$store.dispatch(`storyblok/loadStory`, { fullSlug: this.productionTimeStorySlug });
    }
  },
  created (): void {
    // this.quoteId = this.quotes[0] ?? this.quotes[0].id;
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.o-bulkorder-quotation-form{
    ._quotes-list {
      list-style: none;
    }
}
</style>
