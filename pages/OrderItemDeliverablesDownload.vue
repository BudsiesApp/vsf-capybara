<template>
  <div id="order-item-deliverables-download">
    <SfHeading
      :title="$t('Your Order Item Is Ready To Download', { orderItemId })"
      :level="1"
      class="_title"
    />

    <div v-if="showLoading" class="_loading">
      <div class="_deliverables-placeholder _placeholder" />

      <div class="_related-placeholder _placeholder" />
    </div>

    <div v-else-if="showNotFound" class="_not-found">
      {{ $t('No deliverables found for this order item') }}
    </div>

    <div v-else-if="showContent" class="_content">
      <div class="_deliverables-list">
        <div
          v-for="deliverable in deliverables"
          :key="deliverable.storage_item_id"
          class="_deliverable-item"
        >
          <BaseImage
            class="_image"
            :src="getAbsoluteImageUrl(deliverable.storage_item_url)"
            alt=""
          />

          <SfButton @click="downloadDeliverable(deliverable)">
            {{ $t('Download') }}
          </SfButton>
        </div>
      </div>

      <div class="_related-products" v-if="relatedProducts.length > 0">
        <SfHeading
          :title="$t('Create personalized keepsakes with your image')"
          class="_products-title"
          :level="3"
        />

        <div class="_products-grid">
          <o-product-card
            v-for="product in relatedProducts"
            class="_product"
            :key="product.id"
            :product="product"
            :link="getProductCustomizeLink(product)"
            link-tag="router-link"
            :image-height="352"
            :image-width="352"
            :wishlist-icon="false"
            @click.native.capture="() => onProductCardClick(product.sku)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, onMounted, PropType, Ref, ref } from '@vue/composition-api';
import { SfButton, SfHeading } from '@storefront-ui/vue';
import { SearchQuery } from 'storefront-query-builder';
import config from 'config';

import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { PRODUCT_LOCALIZED_PRICE_DICTIONARY } from '@vue-storefront/core/modules/catalog';
import Product from '@vue-storefront/core/modules/catalog/types/Product';
import { BaseImage } from 'src/modules/budsies';
import { Currency, GET_ACTIVE_CURRENCY } from 'src/modules/currency';
import { fetchOrderItemDeliverables, Deliverable } from 'src/modules/customization-system';
import ImageHandlerService from 'src/modules/file-storage/image-handler.service';
import { PriceHelper, ProductEvent } from 'src/modules/shared';

import { prepareCategoryProduct } from 'theme/helpers';
import OProductCard from 'theme/components/organisms/o-product-card.vue';

const RELATED_PRODUCTS_SKUS = [
  'petsiesCustomCutOutBlankets_bundle',
  'customRenaissanceBlankets_bundle',
  'customPhotoPortraits_bundle',
  'petsiesCustomPrintedSocks_bundle',
  'customPajamas_bundle',
  'customGolfShirts_bundle',
  'customPrintedMasks_bundle',
  'customTumblers_bundle'
];

const PRODUCT_SKU_ROUTE_MAPPING: Record<string, string> = {
  'petsiesCustomCutOutBlankets_bundle': 'cut-out-blankets',
  'customRenaissanceBlankets_bundle': 'renaissance-blankets',
  'customPhotoPortraits_bundle': 'photo-portraits-creation-page',
  'petsiesCustomPrintedSocks_bundle': 'printed-socks-creation-page',
  'customPajamas_bundle': 'pajamas-creation',
  'customGolfShirts_bundle': 'golf-shirts-creation',
  'customPrintedMasks_bundle': 'printed-masks-creation-page',
  'customTumblers_bundle': 'tumblers-creation'
};

export default defineComponent({
  name: 'OrderItemDeliverablesDownload',
  components: {
    BaseImage,
    SfButton,
    SfHeading,
    OProductCard
  },
  props: {
    orderItemId: {
      type: Number as PropType<number>,
      required: true
    }
  },
  setup (props, context) {
    const imageHandlerService = inject<ImageHandlerService>('ImageHandlerService');

    const deliverables = ref<Deliverable[]>([]);
    const isLoading = ref(true);
    const isError = ref(false);

    async function loadDeliverables (): Promise<void> {
      if (!props.orderItemId) {
        isLoading.value = false;
        return;
      }

      try {
        isLoading.value = true;
        // TODO: temporary - current TS version don't handle `value` type right in this case
        (deliverables as Ref<Deliverable[]>).value = await fetchOrderItemDeliverables(props.orderItemId);
      } catch (error) {
        isError.value = true;
      } finally {
        isLoading.value = false;
      }
    }

    async function loadRelatedProducts (): Promise<void> {
      const query = new SearchQuery()
        .applyFilter({ key: 'sku', value: { 'in': RELATED_PRODUCTS_SKUS } })
        .applyFilter({ key: 'status', value: { 'in': [1] } });

      if (!config.products.listOutOfStockProducts) {
        query.applyFilter({ key: 'stock.is_in_stock', value: { 'eq': true } });
      }

      await context.root.$store.dispatch('product/findProducts', {
        query,
        options: {
          prefetchGroupProducts: false
        }
      });
    }

    const productBySkuDictionary = computed<Record<string, Product>>(() => {
      return context.root.$store.getters['product/getProductBySkuDictionary'];
    });

    const productPriceDictionary = computed<Record<string, PriceHelper.ProductPrice>>(() => {
      return context.root.$store.getters[PRODUCT_LOCALIZED_PRICE_DICTIONARY]
    });
    const selectedCurrency = computed<Currency>(() => {
      return context.root.$store.getters[GET_ACTIVE_CURRENCY];
    });

    const relatedProducts = computed<ReturnType<typeof prepareCategoryProduct>[]>(() => {
      const list: ReturnType<typeof prepareCategoryProduct>[] = [];
      const _productBySkuDictionary = productBySkuDictionary.value;

      for (const sku of RELATED_PRODUCTS_SKUS) {
        const product = _productBySkuDictionary[sku];

        if (!product) continue;

        list.push(
          prepareCategoryProduct(
            product,
            productPriceDictionary.value,
            selectedCurrency.value
          )
        );
      }

      return list;
    });

    const showLoading = computed(() => isLoading.value && !isError.value);
    const showNotFound = computed(() =>
    // TODO: temporary - current TS version don't handle `value` type right in this case
      isError.value || (!isLoading.value && (deliverables as Ref<Deliverable[]>).value.length === 0)
    );
    const showContent = computed(() =>
    // TODO: temporary - current TS version don't handle `value` type right in this case
      !isLoading.value && !isError.value && (deliverables as Ref<Deliverable[]>).value.length > 0
    );

    function getAbsoluteImageUrl (url: string): string {
      if (!imageHandlerService) return url;
      return imageHandlerService.getOriginalImageUrl(url);
    }

    function getProductCustomizeLink (product: any): string {
      const imageUrl = (deliverables as Ref<Deliverable[]>).value[0]?.storage_item_url;

      const routeName = PRODUCT_SKU_ROUTE_MAPPING[product.sku];

      return context.root.$router.resolve({
        name: routeName,
        query: {
          'existing-image-url': imageUrl
        }
      }).href;
    }

    function formatDate (dateString: string): string {
      return new Date(dateString).toLocaleDateString();
    }

    onMounted(async () => {
      await Promise.all([
        loadDeliverables(),
        loadRelatedProducts()
      ]);
    });

    async function downloadDeliverable (deliverable: Deliverable) {
      const imageSrc = getAbsoluteImageUrl(deliverable.storage_item_url);

      const image = await fetch(imageSrc);
      const imageBlob = await image.blob();
      const imageURL = URL.createObjectURL(imageBlob);

      const link = document.createElement('a');
      link.href = imageURL;
      link.download = props.orderItemId.toString();

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(imageURL);
    }

    function onProductCardClick (productSku: string): void {
      const product = productBySkuDictionary.value[productSku];

      EventBus.$emit(
        ProductEvent.PRODUCT_CARD_CLICK,
        {
          product,
          categoryName: 'Result Download',
          categoryId: 'Result Download'
        }
      );
    }

    return {
      deliverables,
      relatedProducts,
      showLoading,
      showNotFound,
      showContent,
      getAbsoluteImageUrl,
      getProductCustomizeLink,
      formatDate,
      downloadDeliverable,
      onProductCardClick
    };
  },
  metaInfo (): any {
    return {
      title: this.$t('Download Result')
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "theme/css/mixins/form-placeholder-item.scss";

#order-item-deliverables-download {
  box-sizing: border-box;

  ._title {
    --heading-padding: 0;

    margin-top: var(--spacer-lg);
  }

  ._content {
    display: flex;
    flex-direction: column;
    row-gap: var(--spacer-lg);
    margin-top: var(--spacer-lg)
  }

  ._deliverables-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--spacer-base);
    height: 55vh;
    padding: 0 var(--spacer-sm);
  }

  ._deliverable-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: var(--spacer-sm);
    border: 1px solid var(--c-light);
    padding: var(--spacer-sm);
    height: 100%;
    box-sizing: border-box;
  }

  ._image {
    height: 100%;
    width: auto;
    object-fit: contain;
  }

  ._title,
  ._products-title {
    padding: 0 var(--spacer-sm);
  }

  ._related-products {
    &::v-deep {
      .sf-product-card {
        --image-width: 100%;

        margin: 0 auto;
        height: 100%;
      }
    }

    ._products-grid {
      display: grid;
      justify-content: space-between;
      grid-template-columns: repeat(auto-fit, minmax(46%, 1fr));
      row-gap: calc(var(--spacer-sm) + var(--spacer-xs));
      column-gap: calc(var(--spacer-sm) + var(--spacer-xs));
      padding: 0 calc(var(--spacer-sm) + var(--spacer-xs));
      margin-top: var(--spacer-lg);

      ._product {
        --product-card-max-width: none;

        margin: 0 var(--spacer-xs);
        flex: 1 1 50%;
      }
    }
  }

  ._placeholder {
    @include form-placeholder-item;
  }

  ._deliverables-placeholder {
    height: 55vh;
    max-width: 40rem;
    margin: var(--spacer-lg) auto 0;
  }

  ._related-placeholder {
    height: 200px;
    margin-top: var(--spacer-lg);
  }

  @media (min-width: $tablet-min) {
    max-width: 1272px;
    width: 100%;
    margin: 0 auto;

    ._deliverables-list {
      height: 60vh;
    }

    ._deliverables-placeholder {
      height: 60vh;
    }

    ._related-products {
      ._products-grid {
        grid-template-columns: repeat(auto-fit, minmax(31%, 1fr));
      }

      ._product {
        flex: 1 1 33%;
      }
    }
  }

  @include for-desktop {
    ._related-products {
      ._products-grid {
        grid-template-columns: repeat(auto-fit, minmax(23%, 1fr));
      }

      ._product {
        flex: 1 1 25%;
      }
    }
  }

  @media (min-width: $desktop-l-min) {
    ._related-products {
      ._products-grid {
        grid-template-columns: repeat(auto-fit, minmax(18%, 1fr));
      }

      ._product {
        flex: 1 1 20%;
      }
    }
  }
}
</style>
