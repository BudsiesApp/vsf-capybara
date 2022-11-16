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
      <slot name="intro" />
    </p>

    <SfHeading
      :level="2"
      :title="$t('Select Your Preferred Quantity')"
    />

    <p class="_production-time">
      <slot name="productionTime" />
    </p>

    <ul>
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

      <SfButton>
        {{ orderBulkSampleButtonTitle }}
      </SfButton>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType, VueConstructor } from 'vue'
import { SfButton, SfHeading, SfRadio } from '@storefront-ui/vue'

import { BulkorderQuote } from 'src/modules/budsies';

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
    sampleProductPrice: {
      type: String,
      required: true
    },
    sampleProductName: {
      type: String,
      required: true
    },
    productionTimeStorySlug: {
      type: String,
      required: true
    },
    showCompareTo: {
      type: Boolean
    }
  },
  data () {
    return {
      quoteId: undefined
    }
  },
  components: {
    SfButton,
    SfHeading,
    SfRadio
  },
  computed: {
    formTitle (): string {
      return this.$t(`Bulk ${this.sampleProductName} Quote`);
    },
    orderBulkSampleTitle (): string {
      return this.$t('Next Step: Get your sample - just') + ` ${this.sampleProductPrice}`;
    },
    orderBulkSampleButtonTitle (): string {
      return this.$t(`Get Your Custom ${this.sampleProductName} Sample`);
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
    // styles
}
</style>
