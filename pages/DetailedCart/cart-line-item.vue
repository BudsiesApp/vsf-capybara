<template>
  <div class="cart-line-item">
    <div class="_product-grid">
      <div class="_aside">
        <SfImage
          :src="thumbnail"
          alt=""
          width="140"
          height="140"
          class="_image"
        />
      </div>

      <div class="_main">
        <div class="_details">
          <label
            v-if="plushieName"
            class="_name"
          >
            {{ plushieName }}
          </label>

          <label class="_title">{{ title }}</label>

          <cart-item-shipment-promise
            class="_shipment-promise"
            :estimated-shipment="(product.extension_attributes || {}).estimated_shipment"
          />
        </div>

        <SfPrice
          v-if="cartItemPrice"
          :regular="formattedPrice.regular"
          :special="formattedPrice.special"
          class="_price"
        />
      </div>

      <div class="_configuration">
        <div class="_sections">
          <m-expandable-section
            v-show="selectionsCount > 0"
            :expanded="false"
            class="_customizations-section"
          >
            <template #title>
              <div class="_title-container">
                <span class="_customizations-label">{{ $t('Customizations') }}</span>
                <span class="_selections-count">{{ selectionsCountLabel }}</span>
              </div>
            </template>

            <cart-item-configuration-extended
              :customization-groups="customizationGroups"
              :has-customizable-properties="hasCustomizableProperties"
              :product-options="productOptions"
            />
          </m-expandable-section>

          <div
            class="_coupon-section"
            v-show="showCouponOfferSection"
          >
            <MCartLineCouponOffer
              :product="product"
              class="_coupon-offer"
              @should-render-changed="(value) => showCouponOfferSection = value"
            />
          </div>

          <div class="_item-actions">
            <a-custom-product-quantity
              v-if="showQuantitySelector"
              :value="product.qty"
              :disabled="isCartSyncing"
              @input="changeProductQuantity"
            />

            <div v-else class="_quantity">
              {{ product.qty }}
            </div>

            <SfButton
              v-if="showEditButton"
              class="-small _action-button"
              :disabled="isCartSyncing"
              @click="editHandler"
            >
              Edit
            </SfButton>

            <SfButton
              class="-small color-secondary _action-button"
              :disabled="isCartSyncing"
              @click="removeHandler"
            >
              Remove
            </SfButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import debounce from 'lodash-es/debounce';
import { computed, defineComponent, inject, onBeforeUnmount, onMounted, PropType, ref } from '@vue/composition-api';
import {
  SfImage,
  SfPrice,
  SfButton
} from '@storefront-ui/vue';
import { getThumbnailForProduct } from '@vue-storefront/core/modules/cart/helpers';
import { CART_ITEM_LOCALIZED_PRICE_DICTIONARY, IS_CART_SYNCING } from '@vue-storefront/core/modules/cart';
import { CART_UPD_ITEM } from '@vue-storefront/core/modules/cart/store/mutation-types';
import getCartItemKey from '@vue-storefront/core/modules/cart/helpers/get-cart-item-key.function';
import { GET_ACTIVE_CURRENCY } from 'src/modules/currency';
import {
  CartItemShipmentPromise,
  getCustomizationSystemThumbnail
} from 'src/modules/customization-system';
import { useCartItemConfiguration } from 'theme/helpers/use-cart-item-configuration';
import CartItemConfigurationExtended from './cart-item-configuration-extended.vue';
import { ImageHandlerService } from 'src/modules/file-storage';
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';

import { normalizeProductPurchaseFlow, ProductPurchaseFlow, PriceHelper } from 'src/modules/shared';
import { getProductMaxSaleQuantity } from 'theme/helpers/get-product-max-sale-quantity.function';

import ACustomProductQuantity from 'theme/components/atoms/a-custom-product-quantity.vue';
import MCartLineCouponOffer from 'theme/components/molecules/m-cart-line-coupon-offer.vue';
import MExpandableSection from 'theme/components/molecules/m-expandable-section.vue';
import { getCartItemOptions } from 'theme/helpers/get-cart-item-options.function';
import { getCartItemTitle } from 'theme/helpers/get-cart-item-title.function';

const CHANGE_QUANTITY_DEBOUNCE_TIME = 1000;

const foreversProductsSkus = [
  'ForeversDog_bundle',
  'ForeversCat_bundle',
  'ForeversOther_bundle'
];

const golfHeadCoversProductsSkus = [
  'golfHeadCoversDog_bundle',
  'golfHeadCoversCat_bundle',
  'golfHeadCoversOther_bundle'
];

const printedProductSkuRouteNameDictionary: Record<string, string> = {
  'petsiesCustomPrintedSocks_bundle': 'printed-socks-creation-page',
  'customPrintedMasks_bundle': 'printed-masks-creation-page',
  'customPrintedKeychains_bundle': 'printed-keychains-creation-page',
  'customFeltedMagnets_bundle': 'felted-magnets-creation-page',
  'customFeltedOrnaments_bundle': 'felted-ornaments-creation-page'
};

const blanketProductsSkus = [
  'customRenaissanceBlankets_bundle',
  'petsiesCustomCutOutBlankets_bundle'
];

const clayPlushieProductSkus = [
  'petsiesFigurines_bundle',
  'petsiesBobbleheads_bundle'
];

const clothesProductSkuRouteNameDictionary: Record<string, string> = {
  'customPajamas_bundle': 'pajamas-creation',
  'customHawaiianShirts_bundle': 'hawaiian-shirts-creation',
  'customGolfShirts_bundle': 'golf-shirts-creation'
};

const customPillowSku = 'customPillow_bundle';
const customPhotoPortraitsSku = 'customPhotoPortraits_bundle';
const customTumblersSku = 'customTumblers_bundle';
const customPetsiesHuggablesSku = 'petsiesHuggables_bundle';

const editableProductsSkus = [
  ...foreversProductsSkus,
  ...Object.keys(printedProductSkuRouteNameDictionary),
  ...blanketProductsSkus,
  ...clayPlushieProductSkus,
  ...golfHeadCoversProductsSkus,
  ...Object.keys(clothesProductSkuRouteNameDictionary),
  customPillowSku,
  customPhotoPortraitsSku,
  customTumblersSku,
  customPetsiesHuggablesSku
];

export default defineComponent({
  name: 'CartLineItem',
  components: {
    ACustomProductQuantity,
    CartItemConfigurationExtended,
    CartItemShipmentPromise,
    MCartLineCouponOffer,
    MExpandableSection,
    SfImage,
    SfPrice,
    SfButton
  },
  props: {
    product: {
      type: Object as PropType<CartItem>,
      required: true
    }
  },
  setup (props, context) {
    const imageHandlerService = inject<ImageHandlerService>('ImageHandlerService');

    let syncQuantityDebounced: ReturnType<typeof debounce> | undefined;

    const isCartSyncing = computed<boolean>(() => context.root.$store.getters[IS_CART_SYNCING]);

    const cartItemKey = computed<string>(() => getCartItemKey(props.product));

    const title = computed<string>(() => getCartItemTitle(props.product));

    const cartItemPrice = computed(() =>
      context.root.$store.getters[CART_ITEM_LOCALIZED_PRICE_DICTIONARY][cartItemKey.value]
    );

    const productCustomizations = computed(() => props.product.customizations || []);
    const productCustomizationState = computed(() => props.product.extension_attributes?.customization_state || []);
    const productQty = computed(() => props.product.qty);
    const showPrices = ref(true);
    const showCouponOfferSection = ref(false);

    const {
      customizationGroups,
      hasCustomizableProperties,
      plushieName,
      selectionsCount: customizationGroupsCount
    } = useCartItemConfiguration(
      productCustomizations,
      productCustomizationState,
      cartItemPrice,
      productQty,
      showPrices,
      context,
      ref(true)
    );

    const formattedPrice = computed(() =>
      PriceHelper.formatProductPrice(
        cartItemPrice.value,
        context.root.$store.getters[GET_ACTIVE_CURRENCY].symbol
      )
    );

    const thumbnail = computed<string>(() => {
      if (!imageHandlerService) {
        throw new Error('Image Handler Service is not defined');
      }

      const customizationSystemThumbnail = getCustomizationSystemThumbnail(
        props.product.customizations,
        props.product.extension_attributes?.customization_state,
        imageHandlerService
      );

      if (customizationSystemThumbnail) {
        return customizationSystemThumbnail;
      }

      if (props.product.thumbnail && props.product.thumbnail.includes('://')) {
        return props.product.thumbnail;
      }

      return getThumbnailForProduct(props.product);
    });

    const showQuantitySelector = computed<boolean>(() => {
      if (props.product?.is_alteration_product) {
        return false;
      }

      return getProductMaxSaleQuantity(props.product) > 1;
    });

    const showEditButton = computed<boolean>(() =>
      editableProductsSkus.includes(props.product.sku)
    );

    const productOptions = computed(() => getCartItemOptions(props.product));

    const selectionsCount = computed<number>(() =>
      hasCustomizableProperties.value ? customizationGroupsCount.value : productOptions.value.length
    );

    const selectionsCountLabel = computed<string>(() => {
      return selectionsCount.value === 1
        ? `1 ${context.root.$t('selection')}`
        : `${selectionsCount.value} ${context.root.$t('selections')}`;
    });

    function syncQuantity (): Promise<any> | void {
      if (isCartSyncing.value) {
        return;
      }

      return context.root.$store.dispatch('cart/sync', { forceClientState: true });
    }

    async function changeProductQuantity (qty: number): Promise<void> {
      if (!qty || Number.isNaN(qty) || qty < 1) {
        return;
      }

      context.root.$store.commit(`cart/${CART_UPD_ITEM}`, { product: props.product, qty });

      if (context.root.$store.getters['cart/isCartSyncEnabled']) {
        syncQuantityDebounced?.();
      }
    }

    async function removeHandler (): Promise<void> {
      if (isCartSyncing.value) {
        return;
      }

      await context.root.$store.dispatch('cart/removeItem', { product: props.product });
    }

    function editHandler (): void {
      const product = props.product;
      const productFlow = normalizeProductPurchaseFlow(product.extension_attributes?.flow);

      if (product.sku === customPetsiesHuggablesSku) {
        context.root.$router.push({
          name: 'huggables-creation-page',
          query: { existingPlushieId: product.extension_attributes?.plushie_id }
        });
      } else if (product.sku === customTumblersSku) {
        context.root.$router.push({
          name: 'tumblers-creation',
          query: { existingPlushieId: product.extension_attributes?.plushie_id }
        });
      } else if (product.sku === customPhotoPortraitsSku) {
        context.root.$router.push({
          name: 'photo-portraits-creation-page',
          query: { existingPlushieId: product.extension_attributes?.plushie_id }
        });
      } else if (product.sku === customPillowSku) {
        context.root.$router.push({
          name: 'pillow-product',
          query: { existingPlushieId: product.extension_attributes?.plushie_id }
        });
      } else if (Object.keys(clothesProductSkuRouteNameDictionary).includes(product.sku)) {
        context.root.$router.push({
          name: clothesProductSkuRouteNameDictionary[product.sku],
          params: { sku: product.sku },
          query: { existingPlushieId: product.extension_attributes?.plushie_id }
        });
      } else if (golfHeadCoversProductsSkus.includes(product.sku)) {
        context.root.$router.push({
          name: 'golf-covers-create',
          query: { id: product.extension_attributes?.plushie_id }
        });
      } else if (foreversProductsSkus.includes(product.sku)) {
        context.root.$router.push({
          name: productFlow === ProductPurchaseFlow.CUSTOMIZE_LATER
            ? 'forevers-customize-later'
            : 'forevers-create',
          query: { id: product.extension_attributes?.plushie_id }
        });
      } else if (Object.keys(printedProductSkuRouteNameDictionary).includes(product.sku)) {
        context.root.$router.push({
          name: printedProductSkuRouteNameDictionary[product.sku],
          params: { sku: product.sku },
          query: { existingPlushieId: product.extension_attributes?.plushie_id }
        });
      } else if (blanketProductsSkus.includes(product.sku)) {
        const routeName = product.sku === 'petsiesCustomCutOutBlankets_bundle'
          ? 'cut-out-blankets'
          : 'renaissance-blankets';

        context.root.$router.push({
          name: routeName,
          query: { existingPlushieId: product.extension_attributes?.plushie_id }
        });
      } else if (clayPlushieProductSkus.includes(product.sku)) {
        const routeName = product.sku === 'petsiesBobbleheads_bundle'
          ? 'bobbleheads-creation'
          : 'figurines-creation';

        context.root.$router.push({
          name: routeName,
          query: { existingPlushieId: product.extension_attributes?.plushie_id }
        });
      }
    }

    onMounted(() => {
      syncQuantityDebounced = debounce(syncQuantity, CHANGE_QUANTITY_DEBOUNCE_TIME);
    });

    onBeforeUnmount(() => {
      syncQuantityDebounced?.cancel();
    });

    return {
      cartItemPrice,
      customizationGroups,
      formattedPrice,
      hasCustomizableProperties,
      isCartSyncing,
      plushieName,
      productOptions,
      selectionsCount,
      selectionsCountLabel,
      showCouponOfferSection,
      showEditButton,
      showQuantitySelector,
      thumbnail,
      title,
      changeProductQuantity,
      editHandler,
      removeHandler
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.cart-line-item {
  display: flex;
  flex-direction: column;

  padding: var(--spacer-sm);
  border: 1.5px solid #D2D2D2;

  ._product-grid {
    display: grid;
    grid-template-columns: 9rem minmax(0, 1fr);
    grid-template-areas:
      "aside main"
      "configuration configuration"
      "configuration configuration";
    column-gap: var(--spacer-sm);
  }

  ._name {
    display: inline-block;
    font-size: var(--font-sm);
    font-weight: var(--font-semibold);
  }

  ._aside {
    grid-area: aside;
    line-height: 0;
  }

  ._image {
    background: none;
  }

  ._sections {
    display: flex;
    flex-direction: column;
    margin-top: var(--spacer-lg);
    gap: var(--spacer-lg);
  }

  ._main {
    grid-area: main;
    display: flex;
    flex-direction: column;
  }

  ._header {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 1;
  }

  ._details {
    display: flex;
    flex-direction: column;
  }

  ._title {
    display: inline-block;
    font-weight: var(--font-semibold);
    margin-top: var(--spacer-xs);
  }

  ._shipment-promise {
    margin-top: var(--spacer-xs);
  }

  ._price {
    align-items: flex-start;
    margin-top: var(--spacer-base);
  }

  ._configuration {
    --configuration-item-padding: var(--spacer-xs) 0 0 0;
    --configuration-item-border-top: 1px solid var(--c-divider);

    grid-area: configuration;

    ._title-container {
      display: flex;
      flex: 1;
      justify-content: space-between;
      align-items: center;
      padding-right: var(--spacer-sm);
    }

    ._customizations-label {
      font-weight: var(--font-semibold);
    }

    ._selections-count {
      font-size: var(--font-sm);
      color: var(--c-text-muted);
      margin-left: var(--spacer-xs);
    }
  }

  ._customizations-section {
    ::v-deep {
      ._body-inner {
        padding: 0 var(--spacer-sm);
      }
    }
  }

  ._coupon-offer {
    margin: 0;
  }

  ._coupon-section {
    padding: 0;
  }

  ._item-actions {
    display: flex;
    align-items: center;
    gap: var(--spacer-xs);
  }

  ._action-button {
    flex: 1;
  }

  .a-custom-product-quantity {
    ::v-deep {
      ._handle,
      ._value {
        height: 32px;
        box-sizing: border-box;
      }
    }
  }

  ._quantity {
    line-height: initial;
    text-align: center;
    margin-top: var(--spacer-sm);
    font-size: var(--font-lg);
  }

  @media (max-width: $tablet-min) {
    ._coupon-offer {
      --coupon-border-radius: 0;

      width: 100%;

      ::v-deep {
        ._content {
          padding: var(--spacer-xs);
          padding-left: var(--spacer-sm);
        }

        ._icon {
          padding: var(--spacer-xs) 0 var(--spacer-xs) var(--spacer-xs);
        }

        ._action {
          padding: var(--spacer-xs);
        }
      }

      &::before,
      &::after {
        display: none;
      }
    }
  }

  @media (min-width: $tablet-min) {
    ._product-grid {
      grid-template-areas:
        "aside main"
        "aside configuration"
        "aside actions";
    }

    ._main {
      flex-direction: row;
    }

    ._details {
      flex-grow: 3;
    }

    ._shipment-promise {
      width: auto;
    }

    ._price {
      flex-direction: row;
      margin-top: 0;
    }

    ._coupon-offer {
      max-width: 26rem;
    }

    ._action-button {
      flex: 0;
    }

    ._item-actions {
      background-color: transparent;
    }
  }
}
</style>
