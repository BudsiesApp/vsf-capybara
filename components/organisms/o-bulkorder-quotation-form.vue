<template>
  <div class="o-bulkorder-quotation-form">
    <SfHeading
      :level="1"
      :title="formTitle"
      class="_title"
    />

    <p class="_subtitle">
      {{ $t('Excellent news! Based on your requirements, we are able to calculate your hassle-free custom {subtitleProductName} quote.', {subtitleProductName}) }}
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
      <div class="_quotes-selector">
        <SfHeading
          v-if="!isQuoteSelectionDisabled"
          :level="2"
          :title="$t('Select Your Preferred Quantity')"
        />

        <div class="_production-time" v-if="!isQuoteSelectionDisabled">
          <Blok :item="productionTimeStoryContent" v-if="productionTimeStoryContent" />
        </div>

        <ul class="_quotes-list">
          <li v-for="quote in quotes" :key="quote.id">
            <SfRadio
              class="_quote-input"
              :value="quote.id + ''"
              v-model="quoteId"
              :disabled="isBulkOrderInProgress"
            >
              <template #label>
                <div class="_quote-title">
                  {{ $t('Quantity') }} {{ quote.qty }}{{ sizeLabel }}
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
                  <div class="_quote-description-row" v-if="quote.shippingPrice">
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

    <validation-observer
      tag="div"
      class="_order-bulk-sample-action"
      ref="validationObserver"
      v-slot="{ errors: formErrors }"
      v-if="!isQuoteSelectionDisabled"
    >
      <SfHeading
        :title="orderBulkSampleTitle"
        :level="2"
      />

      <p class="_compare-to _prompt" v-if="showCompareTo">
        {{ $t('Compare to') }} $750!
      </p>

      <div class="_order-notices">
        <Blok :item="orderNoticesStoryContent" v-if="orderNoticesStoryContent" />
      </div>

      <m-addons-selector
        v-model="selectedAddons"
        ref="addons-selector"
        :wide-image="true"
        :addons="addons"
        :disabled="isDisabled"
        :get-field-anchor-name="getFieldAnchorName"
      />

      <m-form-errors
        class="_form-errors"
        :form-errors="formErrors"
        @item-click="goToFieldByName"
      />

      <div class="_submit-button-container">
        <SfButton class="_quote-submit-button" :disabled="isDisabled" @click="submitQuote">
          {{ orderBulkSampleButtonTitle }}
        </SfButton>
      </div>
    </validation-observer>

    <div class="_send-message-to-manager" v-if="!isQuoteSelectionDisabled">
      <SfHeading
        class="_send-message-to-manager-title"
        title="Still have questions?"
        :level="4"
      />
      <SfButton
        class="_message-submit-button sf-button sf-button--outline"
        v-if="!isShowSendMessageToManagerForm"
        @click="isShowSendMessageToManagerForm = !isShowSendMessageToManagerForm"
      >
        {{ $t('Speak with Sales Representative') }}
      </SfButton>
      <div v-if="isShowSendMessageToManagerForm && !isQuestionSubmitted">
        <p>{{ $t('Your dedicated bulk concierge is happy to help answer any final questions or concerns about your order.') }}</p>
        <textarea
          class="_send-message-to-manager-textarea"
          v-model="question"
          :placeholder="$t('Please type your question here or confirm your phone number (and best time to reach you) for your salesperson to call you back!')"
          rows="2"
        />
        <div
          class="_error-text"
          v-if="$v.question && $v.question.$error"
        >
          {{ $t('Please enter a message') }}
        </div>
        <SfButton
          class="sf-button sf-button--outline _send-message-to-manager-submit"
          :disabled="isDisabled"
          @click="submitQuestion"
        >
          {{ $t('Submit') }}
        </SfButton>
      </div>
      <p v-if="isQuestionSubmitted">
        {{ $t('Thanks! Please allow 1-2 business days for a response.') }}
      </p>
    </div>

    <SfHeading
      class="_notification-title"
      v-if="isQuoteSelectionDisabled"
      :title="notificationTitle"
      :level="2"
    />

    <div class="_more-info" v-if="moreInfoStoryContent">
      <Blok :item="moreInfoStoryContent" />
    </div>
  </div>
</template>

<script lang="ts">
import { PropType, Ref, defineComponent, ref } from '@vue/composition-api';
import { SfButton, SfHeading, SfRadio } from '@storefront-ui/vue'
import { getProductGallery as getGalleryByProduct } from '@vue-storefront/core/modules/catalog/helpers';
import Product from '@vue-storefront/core/modules/catalog/types/Product';
import { BundleOption } from '@vue-storefront/core/modules/catalog/types/BundleOption';
import { required } from 'vuelidate/lib/validators';
import { ValidationObserver } from 'vee-validate';
import { TranslateResult } from 'vue-i18n';

import { getProductDefaultPrice } from 'src/modules/shared';
import { components } from 'src/modules/vsf-storyblok-module/components';
import { ItemData } from 'src/modules/vsf-storyblok-module';
import { getFinalPrice } from 'src/modules/shared/helpers/price';
import { BulkorderQuote, BulkOrderInfo, BulkOrderStatus, BulkorderQuoteProductId } from 'src/modules/budsies';
import { useFormValidation } from 'theme/helpers/use-form-validation';
import MAddonsSelector from 'theme/components/molecules/m-addons-selector.vue';
import MFormErrors from 'theme/components/molecules/m-form-errors.vue';

import AddonOption from '../interfaces/addon-option.interface';
import SelectedAddon from '../interfaces/selected-addon.interface';

function getAllFormRefs (
  refs: Record<string, Vue | Element | Vue[] | Element[]>
): Record<string, Vue | Element | Vue[] | Element[]> {
  const addonsSelector = refs['addons-selector'] as InstanceType<typeof MAddonsSelector> | undefined;

  let refsDictionary: Record<string, Vue | Element | Vue[] | Element[]> = { ...refs };

  if (addonsSelector) {
    refsDictionary = { ...refsDictionary, ...addonsSelector.$refs };
  }

  return refsDictionary;
}

export default defineComponent({
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
  setup (_, setupContext) {
    const validationObserver: Ref<InstanceType<typeof ValidationObserver> | null> = ref(null);

    return {
      validationObserver,
      ...useFormValidation(
        validationObserver,
        () => getAllFormRefs(setupContext.refs)
      )
    }
  },
  data () {
    return {
      quoteId: undefined as string | undefined,
      selectedAddons: [] as SelectedAddon[],
      question: undefined as string | undefined,
      isDataLoaded: false,
      isSubmitting: false,
      isShowSendMessageToManagerForm: false,
      isQuestionSubmitted: false
    }
  },
  components: {
    MAddonsSelector,
    SfButton,
    SfHeading,
    SfRadio,
    Blok: components.block,
    ValidationObserver,
    MFormErrors
  },
  computed: {
    quotes (): BulkorderQuote[] | undefined {
      return this.$store.getters['budsies/getBulkorderQuotes'](this.bulkorderInfo.id);
    },
    isDisabled (): boolean {
      return this.isSubmitting;
    },
    isQuoteSelectionDisabled (): boolean {
      return this.bulkorderInfo.statusId !== BulkOrderStatus.DRAFT;
    },
    isBulkOrderInProgress (): boolean {
      return this.bulkorderInfo.statusId === BulkOrderStatus.IN_PROGRESS;
    },
    sizeLabel (): string {
      if (!this.bulkorderInfo.size) {
        return '';
      }

      return ', ' + this.$t('Size') + ': ' + this.bulkorderInfo.size + '"';
    },
    notificationTitle (): string {
      switch (this.bulkorderInfo.statusId) {
        case BulkOrderStatus.WAITING_FOR_QUOTE:
          return 'Our manager will contact you soon!';
        case BulkOrderStatus.IN_PROGRESS:
          return 'Your order is in progress.';
        default:
          return '';
      }
    },
    productionTimeStorySlug (): string {
      let sampleProductPart = '_';

      if (this.bulkorderInfo.bulkorderProductId === BulkorderQuoteProductId.PILLOW) {
        sampleProductPart = '_pillow_';
      }

      if (this.bulkorderInfo.bulkorderProductId === BulkorderQuoteProductId.KEYCHAIN) {
        sampleProductPart = '_keychain_';
      }

      return `blocks/bulk${sampleProductPart}quote_production_time_text`;
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
    formTitle (): TranslateResult {
      if (this.bulkorderInfo.bulkorderProductId === BulkorderQuoteProductId.PLUSHIE) {
        return this.$t('Bulk Quote');
      }

      return this.$t(`Bulk ${this.sampleProductName} Quote`);
    },
    subtitleProductName (): string {
      switch (this.bulkorderInfo.bulkorderProductId) {
        case BulkorderQuoteProductId.PLUSHIE:
        case BulkorderQuoteProductId.KEYCHAIN:
          return 'stuffed animal';
        case BulkorderQuoteProductId.PILLOW:
          return 'pillow';
        default:
          return '';
      }
    },
    showCompareTo (): boolean {
      switch (this.bulkorderInfo.bulkorderProductId) {
        case BulkorderQuoteProductId.PLUSHIE:
        case BulkorderQuoteProductId.KEYCHAIN:
          return true;
        default:
          return false;
      }
    },
    orderBulkSampleTitle (): string {
      return this.$t('Next Step: Get your sample - just') + ` ${this.sampleProductPrice}`;
    },
    orderBulkSampleButtonTitle (): TranslateResult {
      return this.$t(`Get Your Custom ${this.sampleProductName} Sample`);
    },
    sampleProductName (): string {
      switch (this.bulkorderInfo.bulkorderProductId) {
        case BulkorderQuoteProductId.PLUSHIE:
          return 'Plush';
        case BulkorderQuoteProductId.PILLOW:
          return 'Pillow';
        case BulkorderQuoteProductId.KEYCHAIN:
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
          price: getFinalPrice(price),
          specialPrice: price.special,
          regularPrice: price.regular,
          images: images,
          optionId: this.addonsBundleOption.option_id,
          optionValueId: ((typeof productLink.id === 'number') ? productLink.id : Number.parseInt(productLink.id, 10) as number),
          videoUrl: (productLink.product as any).video_url,
          customOptions: productLink.product?.custom_options
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
  validations (): any {
    return {
      question: {
        required
      }
    }
  },
  async serverPrefetch () {
    await (this as any).loadData();
  },
  async beforeMount () {
    if (this.quotes === undefined) {
      await this.loadData();
    } else {
      this.isDataLoaded = true;
    }

    if (this.quotes && this.quotes.length && !this.isBulkOrderInProgress) {
      this.quoteId = this.quotes[0].id.toString();
    }
  },
  methods: {
    getPrice (price: number): string {
      return '$' + price.toFixed(2);
    },
    getSavingsForQuote (quote: BulkorderQuote): string {
      if (!this.quotes) {
        return '';
      }

      const quoteIndex = this.quotes.indexOf(quote);

      if (quoteIndex < 1 || !this.quotes.hasOwnProperty(quoteIndex - 1)) {
        return '';
      }

      const previousQuote = this.quotes[quoteIndex - 1];
      const previousQuoteFinalPrice = previousQuote.productionPrice + previousQuote.shippingPrice;
      const quoteFinalPrice = quote.productionPrice + quote.shippingPrice;

      const savings = quote.qty * previousQuoteFinalPrice - quote.qty * quoteFinalPrice;

      return `Save $${savings.toFixed(2)}!`;
    },
    getStoryContent (slug: string): ItemData | undefined {
      const story = this.$store.state.storyblok.stories[slug] ? this.$store.state.storyblok.stories[slug] : undefined;

      if (!story?.story?.content) {
        return undefined;
      }

      return story.story.content;
    },
    get3dRenderingAddonOptionValueId (): number | undefined {
      const renderingAddon: AddonOption | undefined =
       this.addons.find((addon: AddonOption) => addon.sku.indexOf('3d_rendering') > -1);

      return renderingAddon ? renderingAddon.optionValueId : undefined;
    },
    async loadData (): Promise<void> {
      await Promise.all([
        this.$store.dispatch('storyblok/loadStory', { fullSlug: this.productionTimeStorySlug }),
        this.$store.dispatch('storyblok/loadStory', { fullSlug: this.moreInfoStorySlug }),
        this.$store.dispatch('storyblok/loadStory', { fullSlug: this.orderNoticesStorySlug })
      ]);

      await this.$store.dispatch('budsies/loadBulkorderQuotes', {
        bulkorderId: this.bulkorderInfo.id
      });

      this.isDataLoaded = true;
    },
    async submitQuote (): Promise<void> {
      if (this.isSubmitting || !this.quoteId) {
        return;
      }

      const isFormValid = await this.validateAndGoToFirstError();

      if (!isFormValid) {
        return;
      }

      this.isSubmitting = true;

      if (!this.$store.getters['cart/getCartToken']) {
        await this.$store.dispatch('cart/connect', { guestCart: true });
      }

      const include3dRendering = !!this.selectedAddons.find(
        (selectedAddon) => selectedAddon.addonOptionValueId === this.get3dRenderingAddonOptionValueId()
      );

      try {
        await this.$store.dispatch(
          'budsies/chooseBulkOrderQuote',
          {
            quoteId: Number.parseInt(this.quoteId, 10),
            include3dRendering
          }
        );

        await this.$store.dispatch('cart/synchronizeCart', { forceClientState: false, forceSync: true });

        this.$router.push({ name: 'detailed-cart' });
      } finally {
        this.isSubmitting = false;
      }
    },
    async submitQuestion (): Promise<void> {
      this.$v.$touch();

      if (this.$v.$invalid || this.isSubmitting) {
        return;
      }

      this.isSubmitting = true;

      try {
        await this.$store.dispatch(
          'budsies/sendBulkOrderQuestion',
          {
            bulkOrderId: this.bulkorderInfo.id,
            questionText: this.question
          }
        );

        this.isQuestionSubmitted = true;
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

  ._quotation-container {
    margin-top: var(--spacer-xl);
    display: flex;
    column-gap: var(--spacer-lg);
    flex-direction: column;
    justify-content: center;
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
  }

  ._production-time {
    margin-top: var(--spacer-xl);
  }

  ._quotes-selector {
    margin-top: var(--spacer-xl);
    width: 100%;

    ._quotes-list {
      list-style: none;
      margin-top: var(--spacer-base);
      padding-left: 0;
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
  }

  ._order-bulk-sample-action {
    margin-top: var(--spacer-xl);
    padding: var(--spacer-lg);
    background-color: $sample-background-color;

    ._submit-button-container {
      display: flex;
      justify-content: center;
      margin-top: var(--spacer-lg);
    }

    ._form-errors {
      margin-top: var(--spacer-lg);
    }
  }

  ._send-message-to-manager {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: var(--spacer-xl);
    text-align: center;

    ._send-message-to-manager-submit,
    ._send-message-to-manager-textarea {
      margin: var(--spacer-sm) auto;
    }

    ._send-message-to-manager-textarea {
      width: 75%;
      padding: var(--spacer-sm);
    }

    ._message-submit-button {
      margin-top: var(--spacer-sm);
    }

    ._error-text {
      color: var(--c-danger-variant);
      font-size: var(--font-xs);
      margin: var(--spacer-sm) 0;
      height: calc(var(--font-xs) * 1.2);
    }
  }

  ._more-info {
    margin-top: var(--spacer-sm);
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

  @media (min-width: $tablet-min) {
    ._quotation-container {
      flex-direction: row;
    }

    ._compare-to {
      margin-right: var(--spacer-3xl);
    }

    ._quotes-selector {
      margin-top: 0;
      width: 50%;
    }

    ._bulkorder-description {
      width: 50%;
    }
  }

  @media (min-width: $desktop-min) {
    ._quotation-container {
      margin-top: var(--spacer-2xl);
    }

    ._quotes-selector {
      ._quote-description-row {
          width: 50%;
      }
    }

    ._order-bulk-sample-action {
      margin-top: var(--spacer-2xl);

      ._submit-button-container,
      ._form-errors {
        margin-top: var(--spacer-xl);
      }
    }

    ._send-message-to-manager {
      margin-top: var(--spacer-2xl);

      ._message-submit-button {
        margin-top: var(--spacer-lg);
      }
    }

    ._more-info {
      margin-top: var(--spacer-xl);
    }
  }
}
</style>
