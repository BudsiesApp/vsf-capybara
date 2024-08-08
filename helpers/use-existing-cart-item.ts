import { computed, Ref, SetupContext } from '@vue/composition-api';

import CartItem from 'core/modules/cart/types/CartItem';

export function useExistingCartItem (
  existingPlushieId: Ref<string | undefined>,
  { root }: SetupContext
) {
  const cartItems = computed<CartItem[]>(() => {
    return root.$store.getters['cart/getCartItems'];
  });
  const existingCartItem = computed<CartItem | undefined>(() => {
    if (!existingPlushieId.value) {
      return;
    }

    return cartItems.value.find((item) => item.extension_attributes?.plushie_id && item.extension_attributes?.plushie_id === existingPlushieId.value);
  });

  return {
    existingCartItem
  }
}
