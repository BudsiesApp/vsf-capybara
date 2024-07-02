import { ref, Ref } from '@vue/composition-api';

import CartItem from 'core/modules/cart/types/CartItem';

export function useCustomerEmail (existingCartItem?: Ref<CartItem | undefined>) {
  const email = ref<string | undefined>();

  function fillExistingCartItemData () {
    if (!existingCartItem?.value) {
      return;
    }

    email.value = existingCartItem.value.email
  }

  fillExistingCartItemData();

  return {
    email
  }
}
