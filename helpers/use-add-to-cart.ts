import { Ref, SetupContext, ref } from '@vue/composition-api';

import { Logger } from '@vue-storefront/core/lib/logger';
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';
import { setBundleProductOptionsAsync } from '@vue-storefront/core/modules/catalog/helpers';
import Product from '@vue-storefront/core/modules/catalog/types/Product';
import { CustomizationStateItem } from 'src/modules/customization-system';
import { ServerError } from 'src/modules/shared';

export function useAddToCart (
  product: Ref<Product>,
  quantity: Ref<number>,
  customizationState: Ref<Record<string, CustomizationStateItem>>,
  existingCartItem: Ref<CartItem | undefined>,
  { root }: SetupContext
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
    if (isSubmitting.value) {
      return;
    }

    isSubmitting.value = true;

    await root.$store.dispatch(
      'product/setBundleOptions',
      {
        product: product.value,
        bundleOptions: root.$store.state.product.current_bundle_options
      }
    );

    try {
      await root.$store.dispatch('cart/addItem', {
        productToAdd: Object.assign({}, product.value, {
          qty: quantity.value,
          customizationState: Object.values(customizationState.value)
        })
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
        bundleOptions: root.$store.state.product.current_bundle_options
      }
    );

    try {
      await updateClientAndServerItem({
        product: Object.assign({}, existingCartItem.value, {
          qty: quantity.value,
          product_option: productOption,
          customizationState: Object.values(customizationState.value)
        }),
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