import { computed, Ref } from 'vue';

import CartItem from 'core/modules/cart/types/CartItem';
import { updateCartItemProductionTimeCustomizationState } from 'src/modules/customization-system';
import { useRootInstance } from 'src/modules/shared';

export function useExistingCartItem (
  existingPlushieId: Ref<string | undefined>
) {
  const root = useRootInstance();
  const cartItems = computed<CartItem[]>(() => {
    return root.$store.getters['cart/getCartItems'];
  });
  const existingCartItem = computed<CartItem | undefined>(() => {
    if (!existingPlushieId.value) {
      return;
    }

    let cartItem = cartItems.value.find((item) => item.extension_attributes?.plushie_id && item.extension_attributes?.plushie_id === existingPlushieId.value);

    if (!cartItem) {
      return;
    }

    // TODO: temporary until separate option value for "Standard"
    // production time will be added
    cartItem = updateCartItemProductionTimeCustomizationState(cartItem);

    return cartItem;
  });

  return {
    existingCartItem
  }
}
