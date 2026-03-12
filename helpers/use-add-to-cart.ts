import { Ref, SetupContext, ref } from '@vue/composition-api';

import { Logger } from '@vue-storefront/core/lib/logger';
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';
import { SelectedBundleOption } from '@vue-storefront/core/modules/catalog/types/BundleOption';
import { setBundleProductOptionsAsync } from '@vue-storefront/core/modules/catalog/helpers';
import Product from '@vue-storefront/core/modules/catalog/types/Product';
import { CustomizationAvailabilityFlow, CustomizationStateItem, filterCustomizationState, normalizeCustomizationAvailabilityFlow } from 'src/modules/customization-system';
import { ServerError } from 'src/modules/shared';

export function useAddToCart (
  product: Ref<Product | undefined>,
  quantity: Ref<number>,
  customizationStateItems: Ref<CustomizationStateItem[]>,
  bundleOptions: Ref<Record<number, SelectedBundleOption>>,
  existingCartItem: Ref<CartItem | undefined>,
  { root }: SetupContext,
  existingPlushieId?: string,
  customizationAvailabilityFlow?: CustomizationAvailabilityFlow
) {
  const isSubmitting = ref<boolean>(false);

  async function updateClientAndServerItem (payload: {
    product: CartItem,
    forceUpdateServerItem?: boolean,
    forceClientState?: boolean
  }): Promise<void> {
    await root.$store.dispatch('cart/updateClientAndServerItem', payload);
  }

  async function addToCart (): Promise<void> {
    if (!product.value) {
      throw new Error('Product is not defined during adding to cart');
    }

    if (isSubmitting.value) {
      return;
    }

    isSubmitting.value = true;

    const productOption = setBundleProductOptionsAsync(
      null,
      {
        product: product.value,
        bundleOptions: bundleOptions.value
      }
    );

    const productToAddData: Partial<CartItem> = {
      qty: quantity.value,
      product_option: productOption,
      extension_attributes: {
        customization_state: filterCustomizationState(customizationStateItems.value)
        // TODO: uncomment when API will support this field
        // flow: normalizeCustomizationAvailabilityFlow(customizationAvailabilityFlow)
      }
    };

    if (existingPlushieId) {
      if (!productToAddData.extension_attributes) {
        productToAddData.extension_attributes = {};
      }

      productToAddData.extension_attributes.plushie_id = existingPlushieId;
    }

    try {
      await root.$store.dispatch('cart/addItem', {
        productToAdd: Object.assign({}, product.value, productToAddData)
      });
    } catch (err) {
      if (err instanceof ServerError) {
        throw err;
      }

      Logger.error(err, 'budsies')();
    } finally {
      isSubmitting.value = false;
    }
  }

  async function updateExistingCartItem (): Promise<void> {
    if (!existingCartItem.value) {
      throw new Error('Cart item is not defined');
    }

    if (isSubmitting.value) {
      return;
    }

    isSubmitting.value = true;

    const productOption = setBundleProductOptionsAsync(
      null,
      {
        product: existingCartItem.value,
        bundleOptions: bundleOptions.value
      }
    );

    const cartItemForUpdate: Partial<CartItem> = {
      qty: quantity.value,
      product_option: productOption,
      extension_attributes: {
        ...existingCartItem.value.extension_attributes,
        customization_state: filterCustomizationState(customizationStateItems.value)
        // TODO: uncomment when API will support this field
        // flow: normalizeCustomizationAvailabilityFlow(customizationAvailabilityFlow)
      }
    };

    if (existingPlushieId) {
      if (!cartItemForUpdate.extension_attributes) {
        cartItemForUpdate.extension_attributes = {};
      }

      cartItemForUpdate.extension_attributes.plushie_id = existingPlushieId;
    }

    try {
      await updateClientAndServerItem({
        product: Object.assign({}, existingCartItem.value, cartItemForUpdate),
        forceUpdateServerItem: true
      });
    } catch (err) {
      if (err instanceof ServerError) {
        throw err;
      }

      Logger.error(err, 'budsies')();
    } finally {
      isSubmitting.value = false;
    }
  }

  async function addToCartHandler (): Promise<void> {
    if (existingCartItem.value) {
      return updateExistingCartItem();
    }

    await addToCart();
  }

  return {
    addToCartHandler,
    isSubmitting
  }
}
