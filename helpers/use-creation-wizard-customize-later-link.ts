import { computed, Ref } from 'vue';
import { RawLocation } from 'vue-router';

import CartItem from 'core/modules/cart/types/CartItem';
import Product from 'core/modules/catalog/types/Product';
import { ProductCustomizationMode } from 'src/modules/customization-system/types/customizable-product-flow.type';
import { PlushieType } from 'theme/interfaces/plushie.type';

import getForeversTypeByBundleSku from './get-forevers-type-by-bundle-sku.function';

export function useCreationWizardCustomizeLaterLink (
  plushieType: Ref<PlushieType>,
  currentProduct: Ref<Product | undefined>,
  existingCartItem: Ref<CartItem | undefined>,
  customizationMode: Ref<ProductCustomizationMode>
) {
  const customizeLaterLink = computed<RawLocation | undefined>(() => {
    if (plushieType.value !== PlushieType.FOREVERS || !currentProduct.value ||
      existingCartItem.value || customizationMode.value === ProductCustomizationMode.CUSTOMIZE) {
      return;
    }

    return {
      name: 'forevers-customize-later',
      query: { product: getForeversTypeByBundleSku(currentProduct.value.sku) }
    };
  });

  return { customizeLaterLink };
}
