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
            :initially-expanded="false"
            class="_customizations-section"
          >
            <template #title>
              <span class="_title-container">
                <span class="_customizations-label">{{ $t('Customizations') }}</span>
                <span class="_selections-count">{{ selectionsCountLabel }}</span>
              </span>
            </template>

            <cart-item-configuration-extended
              :customization-groups="customizationGroups"
              :has-customizable-properties="hasCustomizableProperties"
              :product-options="productOptions"
              :removable-options="removableOptions"
              :removed-options="removedOptions"
              :is-options-manage-disabled="isCartSyncing"
              @remove-option="removeOption"
              @restore-option="restoreOption"
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
              {{ $t('Quantity') }}: {{ product.qty }}
            </div>

            <SfButton
              v-if="showEditButton"
              class="-small _action-button"
              :disabled="isCartSyncing"
              @click="editHandler"
            >
              {{ $t('Edit') }}
            </SfButton>

            <SfButton
              class="-small color-secondary _action-button"
              :disabled="isCartSyncing"
              @click="removeHandler"
            >
              {{ $t('Remove') }}
            </SfButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import debounce from 'lodash-es/debounce';
import { computed, defineComponent, inject, onBeforeUnmount, onMounted, PropType, ref, toRef } from '@vue/composition-api';
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
import { useCartItemRemovableOptions } from 'theme/helpers/use-cart-item-removable-options';

import ACustomProductQuantity from 'theme/components/atoms/a-custom-product-quantity.vue';
import MCartLineCouponOffer from 'theme/components/molecules/m-cart-line-coupon-offer.vue';
import MExpandableSection from 'theme/components/molecules/m-expandable-section.vue';
import { getCartItemOptions } from 'theme/helpers/get-cart-item-options.function';
import { getCartItemTitle } from 'theme/helpers/get-cart-item-title.function';

const CHANGE_QUANTITY_DEBOUNCE_TIME = 1000;

const pillowSampleProductSku = 'pillowBulkSample_bundle';
const keychainSampleProductSku = 'keychainBulkSample_bundle';
const plushKeychainSampleProductSku = 'keychainPlushBulkSample_bundle';
const acrylicKeychainSampleProductSku = 'keychainAcrylicBulkSample_bundle';
const plushSampleProductSku = 'CustomBulkSample_bundle';

const bulkSampleProductSkus = [
  plushSampleProductSku,
  pillowSampleProductSku,
  keychainSampleProductSku,
  acrylicKeychainSampleProductSku,
  plushKeychainSampleProductSku
];

const editableProductsSkus = [
  ...bulkSampleProductSkus
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
    const productQty = computed(() => props.product.qty);
    const showPrices = ref(true);
    const showCouponOfferSection = ref(false);

    const cartItemRemovableOptions = useCartItemRemovableOptions(
      toRef(props, 'product'),
      context
    );

    const {
      customizationGroups,
      hasCustomizableProperties,
      plushieName,
      selectionsCount: customizationGroupsCount
    } = useCartItemConfiguration(
      productCustomizations,
      cartItemRemovableOptions.initialCustomizationState,
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

      if (bulkSampleProductSkus.includes(product.sku)) {
        let routeName;

        if (product.sku === pillowSampleProductSku) {
          routeName = 'pillow-sample';
        } else if (product.sku === keychainSampleProductSku) {
          routeName = 'keychain-sample'
        } else if (product.sku === plushKeychainSampleProductSku) {
          routeName = 'plush-keychain-sample'
        } else if (product.sku === acrylicKeychainSampleProductSku) {
          routeName = 'acrylic-keychain-sample';
        } else {
          routeName = 'plush-sample';
        }

        context.root.$router.push({ name: routeName, query: { existingPlushieId: product.extension_attributes?.plushie_id } })
      }
    }

    onMounted(() => {
      syncQuantityDebounced = debounce(syncQuantity, CHANGE_QUANTITY_DEBOUNCE_TIME);
    });

    onBeforeUnmount(() => {
      syncQuantityDebounced?.cancel();
    });

    return {
      ...cartItemRemovableOptions,
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
      column-gap: var(--spacer-sm);
    }

    ._customizations-label {
      font-weight: var(--font-semibold);
    }

    ._selections-count {
      font-size: var(--font-sm);
      color: var(--c-text-muted);
      margin-left: var(--spacer-xs);
      white-space: nowrap;
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
    font-size: var(--font-sm);
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

    ._configuration,
    ._coupon-offer {
      max-width: 26rem;
    }

    ._action-button {
      flex: 0;
    }

    ._item-actions {
      background-color: transparent;
    }

    ._configuration {
      --expandable-section-header-hor-align: flex-start;

      ._title-container {
        justify-content: flex-start;
        flex-grow: 0;
      }
    }
  }
}
</style>
