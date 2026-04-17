<template>
  <div id="extra-charge-purchase">
    <div class="loader-container" v-if="isLoading">
      <div class="loader" />
    </div>

    <p v-if="errorMessage" class="extra-charge-purchase__message extra-charge-purchase__message--error">
      {{ $t(errorMessage) }}
    </p>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onBeforeUnmount, ref } from '@vue/composition-api';

import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';
import Product from '@vue-storefront/core/modules/catalog/types/Product';

import {
  Customization,
  CustomizationStateItem,
  updateProductProductionTimeCustomizationData,
  useAvailableCustomizations,
  useCustomizationState,
  useCustomizationsBundleOptions
} from 'src/modules/customization-system';
import { getCustomizationIdByOptionValueId } from 'src/modules/customization-system/helpers/get-customization-id-by-option-value-id';

import { useAddToCart } from 'theme/helpers/use-add-to-cart';

export function getCustomizationStateFromProp (
  customizationStateProp?: string,
  customizations: Customization[] = []
): CustomizationStateItem[] {
  if (!customizationStateProp) {
    return [] as CustomizationStateItem[];
  }

  try {
    const parsedValue = JSON.parse(customizationStateProp);

    if (Array.isArray(parsedValue)) {
      return parsedValue as CustomizationStateItem[];
    }

    if (!parsedValue || typeof parsedValue !== 'object') {
      return [] as CustomizationStateItem[];
    }

    return Object.entries(parsedValue).reduce<CustomizationStateItem[]>((result, [id, value]) => {
      if (!value || typeof value !== 'object') {
        return result;
      }

      const customizationId = getCustomizationIdByOptionValueId(customizations, id);

      if (!customizationId) {
        return result;
      }

      const quantity = Number((value as { qty?: number | string }).qty);

      result.push({
        customization_id: customizationId,
        quantity: quantity || 1,
        value: id
      });

      return result;
    }, []);
  } catch (error) {
    return [] as CustomizationStateItem[];
  }
}

export default defineComponent({
  name: 'ExtraChargePurchase',
  props: {
    sku: {
      type: String,
      required: true
    },
    plushieId: {
      type: String,
      required: true
    },
    qty: {
      type: String,
      required: true
    },
    customizationValues: {
      type: String,
      required: true
    }
  },
  setup (props, { root }) {
    const isLoading = ref<boolean>(true);
    const errorMessage = ref<string | null>(null);
    const product = ref<Product | undefined>(undefined);
    const existingCartItem = ref<CartItem | undefined>(undefined);

    const INCORRECT_PURCHASE_LINK_MESSAGE = root.$t('Purchase link is incorrect.').toString();

    const cartItems = computed<CartItem[]>(() => {
      return root.$store.getters['cart/getCartItems'] || [];
    });

    const initialCustomizationState = computed<CustomizationStateItem[]>(() => {
      return getCustomizationStateFromProp(props.customizationValues);
    });

    const {
      mergeCustomizationState,
      selectedOptionValuesIds,
      updateCustomizationOptionValue,
      customizationOptionValue,
      customizationQuantity,
      customizationState
    } = useCustomizationState(undefined, initialCustomizationState);

    const quantity = computed<number>(() => {
      const parsedQuantity = Number(props.qty);

      if (Number.isNaN(parsedQuantity) || parsedQuantity < 1) {
        return 1;
      }

      return parsedQuantity;
    });

    const productCustomizations = computed<Customization[]>(() => {
      return product.value?.customizations || [];
    });

    const { availableOptionValues } = useAvailableCustomizations(
      productCustomizations,
      selectedOptionValuesIds,
      customizationOptionValue,
      updateCustomizationOptionValue
    );

    const { bundleOptions } = useCustomizationsBundleOptions(
      productCustomizations,
      customizationOptionValue,
      availableOptionValues,
      customizationQuantity
    );

    const { addToCartHandler } = useAddToCart(
      product,
      quantity,
      customizationState,
      bundleOptions,
      existingCartItem,
      { root } as any,
      props.plushieId
    );

    const pendingSamePlushieCartItem = computed<CartItem | undefined>(() => {
      return cartItems.value.find((item) => {
        const plushieId = item.extension_attributes?.plushie_id;

        return item.is_alteration_product &&
          String(plushieId) === props.plushieId &&
          item.sku === props.sku;
      });
    });

    const isMalformedLink = computed<boolean>(() => {
      return !props.sku || !props.plushieId || !props.qty || !props.customizationValues;
    });

    async function loadProduct (): Promise<boolean> {
      if (isMalformedLink.value) {
        errorMessage.value = INCORRECT_PURCHASE_LINK_MESSAGE;
        isLoading.value = false;
        return false;
      }

      isLoading.value = true;
      errorMessage.value = null;

      try {
        let [loadedProduct] = await Promise.all(
          [
            root.$store.dispatch('product/loadProduct', {
              parentSku: props.sku,
              setCurrent: false
            }),
            root.$store.dispatch('budsies/loadProductsRushAddons', {
              productSku: props.sku
            })
          ]
        );

        if (!loadedProduct) {
          errorMessage.value = INCORRECT_PURCHASE_LINK_MESSAGE;
          product.value = undefined;
          return false;
        }

        loadedProduct = updateProductProductionTimeCustomizationData(
          loadedProduct,
          root.$store
        );

        product.value = loadedProduct;

        const resolvedCustomizationState = getCustomizationStateFromProp(
          props.customizationValues,
          loadedProduct.customizations || []
        );

        if (resolvedCustomizationState.length === 0) {
          errorMessage.value = INCORRECT_PURCHASE_LINK_MESSAGE;
          return false;
        }

        mergeCustomizationState(resolvedCustomizationState);
        return true;
      } catch (error) {
        errorMessage.value = INCORRECT_PURCHASE_LINK_MESSAGE;
        product.value = undefined;
        return false;
      } finally {
        isLoading.value = false;
      }
    }

    async function removePendingSamePlushieCartItem (): Promise<void> {
      const existingCartItem = pendingSamePlushieCartItem.value;

      if (!existingCartItem) {
        return;
      }

      await root.$store.dispatch('cart/removeItem', {
        product: existingCartItem,
        removeByParentSku: false
      });
    }

    async function executePurchaseFlow (): Promise<void> {
      const isProductLoaded = await loadProduct();

      if (!isProductLoaded || !product.value) {
        return;
      }

      try {
        isLoading.value = true;
        errorMessage.value = null;

        await removePendingSamePlushieCartItem();
        await addToCartHandler();
        await root.$router.replace({ name: 'detailed-cart' });
      } catch (error) {
        errorMessage.value = root.$t('Sorry, we were unable to update your cart').toString();
      } finally {
        isLoading.value = false;
      }
    }

    const isUserSessionStarted = computed<boolean>(() => {
      return root.$store.getters['user/getIsSessionStarted'];
    });

    onMounted(() => {
      if (isUserSessionStarted.value) {
        return executePurchaseFlow();
      }

      EventBus.$once('session-after-started', executePurchaseFlow);
    });

    onBeforeUnmount(() => {
      EventBus.$off('session-after-started', executePurchaseFlow);
    });

    return {
      customizationState,
      errorMessage,
      isLoading,
      pendingSamePlushieCartItem,
      product,
      removePendingSamePlushieCartItem
    };
  }
});
</script>

<style lang="scss" scoped>
#extra-charge-purchase {
  box-sizing: border-box;
  padding: 0 var(--spacer-xs);
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  .loader-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    .loader {
      position: absolute;
      width: 4.8em;
      height: 4.8em;
      border-radius: 100%;
      border: 2px solid var(--c-secondary);
      border-bottom-color: var(--c-primary);
      animation: rotate 1s linear infinite;
    }
  }
}
</style>
