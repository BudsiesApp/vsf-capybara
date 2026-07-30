import { ref, Ref } from 'vue';

import CartItem from 'core/modules/cart/types/CartItem';

export function useProductQuantity (
  existingCartItem: Ref<CartItem | undefined>
) {
  const quantity = ref<number>(1);

  if (existingCartItem.value) {
    quantity.value = existingCartItem.value.qty;
  }

  return {
    quantity
  }
}
