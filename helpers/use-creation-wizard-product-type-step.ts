import { onMounted, ref, Ref, SetupContext } from '@vue/composition-api';

import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import CartItem from 'core/modules/cart/types/CartItem';
import Product from 'core/modules/catalog/types/Product';
import { PlushieWizardEvents } from 'src/modules/budsies';
import { ProductEvent } from 'src/modules/shared';

import { PlushieType } from 'theme/interfaces/plushie.type';
import getPlushieSkuByTypes from './get-plushie-sku-by-types.function';

export function useCreationWizardProductTypeStep (
  plushieType: Ref<PlushieType>,
  currentProduct: Ref<Product | undefined>,
  existingCartItem: Ref<CartItem | undefined>,
  preselectedProductType: Ref<string | undefined>,
  resetCustomizationState: () => void,
  nextStep: () => void,
  afterProductTypeSet: () => void,
  { root }: SetupContext
) {
  const isProductLoading = ref<boolean>(false);

  async function loadProduct (sku: string): Promise<void> {
    isProductLoading.value = true;

    await root.$store.dispatch('product/loadProduct', {
      parentSku: sku,
      childSku: null
    });

    isProductLoading.value = false;
    nextStep();
  }

  async function setProductType (type: string): Promise<void> {
    const productSku: string = getPlushieSkuByTypes(type, plushieType.value);

    if (currentProduct.value?.sku === productSku) {
      nextStep();
      return;
    }

    EventBus.$emit(ProductEvent.PRODUCT_PAGE_SHOW, currentProduct);

    await loadProduct(productSku);
    resetCustomizationState();

    afterProductTypeSet();

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
    setProductType
  }
}
