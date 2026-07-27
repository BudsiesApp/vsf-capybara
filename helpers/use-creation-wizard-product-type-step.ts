import { useStore } from '@vue-storefront/core/application-services';
import { onMounted, ref, Ref } from 'vue';

import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import CartItem from 'core/modules/cart/types/CartItem';
import Product from 'core/modules/catalog/types/Product';
import { PlushieWizardEvents } from 'src/modules/budsies';
import { updateProductProductionTimeCustomizationData } from 'src/modules/customization-system';
import { ProductEvent } from 'src/modules/shared';

import { PlushieType } from 'theme/interfaces/plushie.type';
import getPlushieSkuByTypes from './get-plushie-sku-by-types.function';

export function useCreationWizardProductTypeStep (
  plushieType: Ref<PlushieType>,
  currentProduct: Ref<Product | undefined>,
  existingCartItem: Ref<CartItem | undefined>,
  preselectedProductType: Ref<string | undefined>,
  resetCustomizationState: () => void,
  nextStep: () => Promise<void>,
  afterProductTypeSet: () => void
) {
  const applicationStore = useStore();
  const isProductLoading = ref<boolean>(false);

  async function loadProduct (sku: string): Promise<void> {
    isProductLoading.value = true;
    applicationStore.commit(`product/${PRODUCT_UNSET_CURRENT}`);

    try {
      let [product] = await Promise.all(
        [
          applicationStore.dispatch('product/loadProduct', {
            parentSku: sku,
            childSku: null,
            setCurrent: false
          }),
          applicationStore.dispatch(
            'budsies/loadProductsRushAddons',
            { productSku: sku }
          )
        ]
      );

      product = updateProductProductionTimeCustomizationData(
        product,
        applicationStore
      );

      await applicationStore.dispatch('product/setCurrent', product);

      void nextStep();
    } finally {
      isProductLoading.value = false;
    }
  }

  async function setProductType (type: string): Promise<void> {
    const productSku: string = getPlushieSkuByTypes(type, plushieType.value);

    if (currentProduct.value?.sku === productSku) {
      void nextStep();
      return;
    }

    await loadProduct(productSku);
    resetCustomizationState();

    afterProductTypeSet();

    EventBus.$emit(ProductEvent.PRODUCT_PAGE_SHOW, currentProduct.value);

    EventBus.$emit(PlushieWizardEvents.PLUSHIE_WIZARD_TYPE_CHANGE, {
      productType: type,
      plushieType: plushieType.value
    });
  }

  if (existingCartItem.value) {
    void loadProduct(existingCartItem.value.sku);
  }

  onMounted(() => {
    if (currentProduct.value || existingCartItem.value || !preselectedProductType.value) {
      return;
    }

    void setProductType(preselectedProductType.value);
  });

  return {
    isProductLoading,
    loadProduct,
    setProductType
  }
}
