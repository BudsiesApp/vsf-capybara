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

    <p class="_estimate-notice" v-if="!isQuoteSelectionDisabled">
      {{ $t('Pricing below is an estimate for bulk production only. No order has been placed!') }}
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
          :title="$t('Estimated Bulk Production Pricing')"
        />

        <p class="_quote-note" v-if="!isQuoteSelectionDisabled">
          {{ $t('Minimum order quantity: 50 pieces per design') }}
        </p>

        <div
          class="_quote-table-wrapper"
          v-if="!isQuoteSelectionDisabled && quotes && quotes.length"
        >
          <table class="_quote-table">
            <thead>
              <tr>
                <th scope="col">
                  {{ quantityColumnTitle }}
                </th>
                <th scope="col">
                  {{ $t('Estimated Unit Price (USD)') }}
                </th>
                <th scope="col">
                  {{ $t('Estimated Total (USD)') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="quote in quotes"
                :key="quote.id"
                class="_quote-row"
                :class="{ '-selected': isQuoteSelected(quote), '-disabled': isQuoteRowSelectionDisabled }"
                :tabindex="isQuoteRowSelectionDisabled ? -1 : 0"
                :aria-disabled="isQuoteRowSelectionDisabled ? 'true' : 'false'"
                @click="selectQuote(quote)"
                @keydown.enter.prevent="selectQuote(quote)"
                @keydown.space.prevent="selectQuote(quote)"
              >
                <td :data-label="quantityColumnTitle">
                  {{ getQuoteQuantityLabel(quote) }}
                </td>
                <td :data-label="$t('Estimated Unit Price (USD)')">
                  {{ getEstimatedUnitPrice(quote) }}
                </td>
                <td :data-label="$t('Estimated Total (USD)')">
                  {{ getEstimatedTotal(quote) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="_quote-currency-note" v-if="!isQuoteSelectionDisabled">
          {{ $t('Please note: All quotes are in $USD') }}
        </p>

        <div class="_production-time" v-if="productionTimeStoryContent">
          <Blok :item="productionTimeStoryContent" />
        </div>
      </div>
    </div>

    <p class="_not-order-note" v-if="!isQuoteSelectionDisabled">
      <strong>{{ $t('This is not an order.') }}</strong>
      {{ $t('All bulk projects require a prototype sample before bulk production can begin.') }}
    </p>

    <validation-observer
      tag="div"
      class="_sample-prototype-card"
      ref="validationObserver"
      v-slot="{ errors: formErrors }"
      v-if="!isQuoteSelectionDisabled"
    >
      <div class="_sample-prototype-copy">
        <SfHeading
          :title="$t('Next Step: Order Sample Prototype')"
          :level="2"
        />

        <p>
          {{ $t('We need to create a prototype first before we start bulk production. This step confirms size, structure, materials, colors, and overall quality before the full order is made.') }}
        </p>

        <p class="_sample-prototype-emphasis">
          {{ $t('You are not obligated to move into bulk production by purchasing a prototype.') }}
        </p>
      </div>

      <div class="_sample-prototype-action">
        <div class="_sample-prototype-fee-label">
          {{ $t('Sample prototype fee') }}
        </div>
        <div class="_sample-prototype-price">
          {{ sampleProductPrice }}
        </div>
        <div class="_sample-prototype-fee-note">
          {{ $t('One-time fee per unique design') }}
        </div>

        <SfButton class="_quote-submit-button" :disabled="isDisabled" @click="submitQuote">
          {{ $t('Get Sample Prototype') }}
        </SfButton>

        <div class="_secure-process-note">
          {{ $t('Secure & easy process') }}
        </div>
      </div>

      <m-addons-selector
        class="_sample-prototype-addons"
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
    </validation-observer>

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
import { SfButton, SfHeading } from '@storefront-ui/vue'
import { getProductGallery as getGalleryByProduct } from '@vue-storefront/core/modules/catalog/helpers';
import Product from '@vue-storefront/core/modules/catalog/types/Product';
import { BundleOption } from '@vue-storefront/core/modules/catalog/types/BundleOption';
import { ValidationObserver } from 'vee-validate';
import { TranslateResult } from 'vue-i18n';

import { PRODUCT_PRICE_DICTIONARY } from '@vue-storefront/core/modules/catalog';
import { PriceHelper } from 'src/modules/shared';
import { components } from 'src/modules/vsf-storyblok-module/components';
import { ItemData } from 'src/modules/vsf-storyblok-module';
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
      isDataLoaded: false,
      isSubmitting: false
    }
  },
  components: {
    MAddonsSelector,
    SfButton,
    SfHeading,
    Blok: components.block,
    ValidationObserver,
    MFormErrors
  },
  computed: {
    productPriceDictionary (): Record<string, PriceHelper.ProductPrice> {
      return this.$store.getters[PRODUCT_PRICE_DICTIONARY];
    },
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
    isQuoteRowSelectionDisabled (): boolean {
      return this.isQuoteSelectionDisabled || this.isBulkOrderInProgress;
    },
    quantityColumnTitle (): TranslateResult {
      if (!this.bulkorderInfo.size) {
        return this.$t('Quantity');
      }

      return this.$t('Quantity ({size}")', { size: this.bulkorderInfo.size });
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

      switch (this.bulkorderInfo.bulkorderProductId) {
        case BulkorderQuoteProductId.PILLOW:
          sampleProductPart = '_pillow_';
          break;
        case BulkorderQuoteProductId.KEYCHAIN:
          sampleProductPart = '_keychain_';
          break;
        case BulkorderQuoteProductId.ACRYLIC_KEYCHAIN:
          sampleProductPart = '_keychain_acrylic_';
          break;
        case BulkorderQuoteProductId.PLUSH_KEYCHAIN:
          sampleProductPart = '_keychain_plush_';
          break;
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
    formTitle (): TranslateResult {
      return this.$t('Your Estimated Bulk Order Quote');
    },
    subtitleProductName (): string {
      switch (this.bulkorderInfo.bulkorderProductId) {
        case BulkorderQuoteProductId.PLUSHIE:
        case BulkorderQuoteProductId.KEYCHAIN:
        case BulkorderQuoteProductId.PLUSH_KEYCHAIN:
        case BulkorderQuoteProductId.ACRYLIC_KEYCHAIN:
          return 'stuffed animal';
        case BulkorderQuoteProductId.PILLOW:
          return 'pillow';
        default:
          return '';
      }
    },
    sampleProductPrice (): string {
      const price = this.productPriceDictionary[this.sampleProduct.id];

      if (!price) {
        return '$0';
      }

      return '$' + price.regular.toString();
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
        const price = this.productPriceDictionary[productLink.product.id];

        result.push({
          id: Number(productLink.product.id),
          sku: productLink.product.sku,
          name: productLink.product.name,
          description: productLink.product.short_description || '',
          price: PriceHelper.getFinalPrice(price),
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
    getQuoteQuantityLabel (quote: BulkorderQuote): string {
      return quote.qty + ' ' + String(this.$t('pieces'));
    },
    getEstimatedUnitPrice (quote: BulkorderQuote): string {
      return this.getPrice(quote.productionPrice);
    },
    getEstimatedTotal (quote: BulkorderQuote): string {
      return this.getPrice(quote.qty * quote.productionPrice);
    },
    isQuoteSelected (quote: BulkorderQuote): boolean {
      return this.quoteId === quote.id.toString();
    },
    selectQuote (quote: BulkorderQuote): void {
      if (this.isQuoteRowSelectionDisabled) {
        return;
      }

      this.quoteId = quote.id.toString();
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
        this.$store.dispatch('storyblok/loadStory', { fullSlug: this.moreInfoStorySlug })
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

      await this.$store.dispatch('cart/create', {
        ignoreClientItemsCount: true
      });

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

        await this.$store.dispatch('cart/sync', { forceSync: true });

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

$table-header-color: #062e5f;
$selection-color: #ffb31a;
$border-color: #d8d8d8;
$soft-background-color: #f7f7f2;

.o-bulkorder-quotation-form {
  color: var(--c-text);

  ._title,
  ._subtitle,
  ._estimate-notice,
  ._not-order-note {
    text-align: center;
  }

  ._subtitle {
    margin: var(--spacer-sm) auto 0;
    max-width: 820px;
  }

  ._estimate-notice {
    margin: var(--spacer-sm) auto 0;
    font-size: var(--font-lg);
    font-weight: var(--font-semibold);
  }

  ._quotation-container {
    margin-top: var(--spacer-xl);
    display: flex;
    column-gap: var(--spacer-lg);
    flex-direction: column;
    justify-content: center;
  }

  ._bulkorder-description {
    width: 100%;
    text-align: center;

    ._description {
      margin-top: var(--spacer-sm);
    }

    ._artwork > img {
      max-width: 100%;
    }
  }

  ._quotes-selector {
    margin-top: var(--spacer-xl);
    width: 100%;
  }

  ._quote-currency-note {
    margin: var(--spacer-xs) 0 0;
  }

  ._quote-note {
    margin-top: var(--spacer-base);
    margin-bottom: 0;
  }

  ._quote-currency-note {
    font-style: italic;
  }

  ._quote-table-wrapper {
    margin-top: var(--spacer-xs);
  }

  ._quote-table {
    width: 100%;
    border: 1px solid $border-color;
    border-collapse: separate;
    border-spacing: 0;
    border-radius: 8px;
    overflow: hidden;

    th {
      padding: var(--spacer-sm);
      background: $table-header-color;
      color: var(--c-white);
      font-weight: var(--font-bold);
      text-align: center;
    }

    td {
      padding: var(--spacer-sm);
      font-size: var(--font-lg);
      font-weight: var(--font-semibold);
      text-align: center;
      vertical-align: middle;

    }
  }

  ._quote-row {
    cursor: pointer;

    &.-selected td {
      background: #fff8e8;
    }

    &.-disabled {
      cursor: default;
      opacity: 0.7;
    }

    td {
      background: var(--c-white);
    }

    & + ._quote-row td {
      border-top: 1px solid $border-color;
    }
  }

  ._production-time {
    margin-top: var(--spacer-base);
  }

  ._not-order-note {
    margin: var(--spacer-xl) auto 0;
    max-width: 860px;
    font-size: var(--font-lg);
  }

  ._sample-prototype-card {
    margin-top: var(--spacer-xl);
    padding: var(--spacer-lg);
    display: grid;
    row-gap: var(--spacer-lg);
    border: 3px solid $selection-color;
    border-radius: 8px;
    background: $soft-background-color;
  }

  ._sample-prototype-copy {
    p {
      margin-top: var(--spacer-base);
      line-height: 1.55;
    }
  }

  ._sample-prototype-emphasis {
    font-weight: var(--font-bold);
  }

  ._sample-prototype-action {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  ._sample-prototype-fee-label,
  ._sample-prototype-fee-note,
  ._secure-process-note {
    font-weight: var(--font-medium);
  }

  ._sample-prototype-price {
    margin-top: var(--spacer-xs);
    font-size: 56px;
    line-height: 1;
    font-weight: var(--font-bold);
  }

  ._sample-prototype-fee-note {
    margin-top: var(--spacer-sm);
  }

  ._quote-submit-button {
    margin-top: var(--spacer-base);
    width: 100%;
    max-width: 420px;
    background: $selection-color;
    color: var(--c-text);
  }

  ._secure-process-note {
    margin-top: var(--spacer-sm);
  }

  ._sample-prototype-addons {
    grid-column: 1 / -1;
  }

  ._form-errors {
    grid-column: 1 / -1;
    margin-top: var(--spacer-sm);
  }

  ._more-info {
    margin-top: var(--spacer-xl);
  }

  ::v-deep {
    .m-addons-selector {
      ._addon-input {
        &.sf-checkbox--is-active {
          background-color: var(--c-blue);
        }
      }
    }
  }

  @media (max-width: ($tablet-min - 1)) {
    ._quote-table {
      min-width: 0;

      thead {
        display: none;
      }

      tr,
      td {
        display: block;
      }

      ._quote-row {
        border-top: 1px solid $border-color;

        &:first-child {
          border-top: none;
        }
      }

      td {
        display: flex;
        justify-content: space-between;
        gap: var(--spacer-sm);
        border-top: none;
        text-align: right;

        &::before {
          content: attr(data-label);
          font-size: var(--font-base);
          font-weight: var(--font-bold);
          text-align: left;
        }
      }
    }

    ._sample-prototype-price {
      font-size: 48px;
    }
  }

  @media (min-width: $tablet-min) {
    ._quotation-container {
      flex-direction: row;
      align-items: flex-start;
    }

    ._quotes-selector {
      margin-top: 0;
      width: 50%;
    }

    ._bulkorder-description {
      width: 50%;
    }

    ._sample-prototype-card {
      grid-template-columns: minmax(0, 1fr) minmax(280px, 0.75fr);
      column-gap: var(--spacer-lg);
      align-items: stretch;
    }

    ._sample-prototype-action {
      padding-left: var(--spacer-lg);
      border-left: 1px solid $border-color;
    }
  }

  @media (min-width: $desktop-min) {
    ._quotation-container {
      margin-top: var(--spacer-2xl);
    }

    ._sample-prototype-card {
      margin-top: var(--spacer-2xl);
      padding: var(--spacer-xl);
    }
  }
}
</style>
