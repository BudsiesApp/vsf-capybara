import { computed, ref, Ref } from 'vue';

import CartItem from 'core/modules/cart/types/CartItem';
import { SelectedBundleOption } from 'core/modules/catalog/types/BundleOption';
import Product from 'core/modules/catalog/types/Product';
import {
  Customization,
  CustomizationOptionValue,
  CustomizationStateItem,
  CustomizationType,
  findPurchaseFlowCustomization,
  findPurchaseFlowOptionValue,
  isCustomizationAvailableInFlow,
  OptionValue,
  ProductCustomizationMode
} from 'src/modules/customization-system';
import { ProductPurchaseFlow } from 'src/modules/shared';

import { useAddToCart } from './use-add-to-cart';

export function useCreationWizardCustomizeLater (
  product: Ref<Product | undefined>,
  productCustomizations: Ref<Customization[]>,
  customizationState: Ref<CustomizationStateItem[]>,
  customizationOptionValue: Ref<Record<string, CustomizationOptionValue>>,
  bundleOptions: Ref<Record<number, SelectedBundleOption>>,
  existingCartItem: Ref<CartItem | undefined>,
  customizationMode: Ref<ProductCustomizationMode>
) {
  const flowCustomization = computed<Customization | undefined>(() => {
    return findPurchaseFlowCustomization(productCustomizations.value);
  });

  const laterFlowOptionValue = computed<OptionValue | undefined>(() => {
    if (!flowCustomization.value) {
      return undefined;
    }

    return findPurchaseFlowOptionValue(flowCustomization.value, ProductPurchaseFlow.CUSTOMIZE_LATER);
  });

  const canCustomizeLater = computed<boolean>(() => {
    return customizationMode.value !== ProductCustomizationMode.CUSTOMIZE &&
      !existingCartItem.value &&
      !!laterFlowOptionValue.value;
  });

  const laterCustomizationIds = computed<Set<string>>(() => {
    const ids = productCustomizations.value
      .filter((customization) => {
        return isCustomizationAvailableInFlow(
          customization,
          ProductCustomizationMode.ADD_TO_CART,
          ProductPurchaseFlow.CUSTOMIZE_LATER
        );
      })
      .map((customization) => customization.id);

    return new Set(ids);
  });

  const laterRequiredCustomizations = computed<Customization[]>(() => {
    return productCustomizations.value.filter((customization) => {
      return customization.type === CustomizationType.OPTION &&
        !customization.isHidden &&
        !!customization.optionData?.isRequired &&
        customization.id !== flowCustomization.value?.id &&
        laterCustomizationIds.value.has(customization.id);
    });
  });

  function isLaterFlowCustomization (customization: Customization): boolean {
    return laterCustomizationIds.value.has(customization.id);
  }

  const isLaterRequiredDataFilled = computed<boolean>(() => {
    return laterRequiredCustomizations.value.every((customization) => {
      return !!customizationOptionValue.value[customization.id];
    });
  });

  const laterCustomizationState = computed<CustomizationStateItem[]>(() => {
    const state = customizationState.value.filter((item) => {
      return item.customization_id !== flowCustomization.value?.id;
    });

    if (flowCustomization.value && laterFlowOptionValue.value) {
      state.push({
        customization_id: flowCustomization.value.id,
        value: laterFlowOptionValue.value.id
      });
    }

    return state;
  });

  const laterBundleOptions = computed<Record<number, SelectedBundleOption>>(() => {
    const flowBundleOptionId = flowCustomization.value?.bundleOptionId;
    const flowBundleOptionItemId = laterFlowOptionValue.value?.bundleOptionItemId;

    if (!flowBundleOptionId || !flowBundleOptionItemId) {
      return bundleOptions.value;
    }

    return {
      ...bundleOptions.value,
      [flowBundleOptionId]: {
        option_id: flowBundleOptionId,
        option_qty: 1,
        option_selections: [flowBundleOptionItemId]
      }
    };
  });

  const { addToCartHandler, isSubmitting } = useAddToCart(
    product,
    ref(1),
    laterCustomizationState,
    laterBundleOptions,
    ref(undefined),
    undefined,
    ProductPurchaseFlow.CUSTOMIZE_LATER
  );

  return {
    addToCartForLater: addToCartHandler,
    canCustomizeLater,
    isLaterFlowCustomization,
    isLaterRequiredDataFilled,
    isSubmittingForLater: isSubmitting
  };
}
