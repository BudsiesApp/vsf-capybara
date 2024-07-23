import { onlineHelper } from '@vue-storefront/core/helpers';
import CartItem from 'core/modules/cart/types/CartItem';

export function getCartItemOptions (cartItem: CartItem): {
  isCustom: boolean,
  label: string,
  value: string
}[] {
  const options = onlineHelper.isOnline && cartItem.totals && cartItem.totals.options
    ? cartItem.totals.options
    : cartItem.options || [];

  return options.map((option) => {
    return {
      value: option.value,
      label: option.label,
      isCustom: !!cartItem.custom_options?.find((customOption) => customOption.title === option.label)
    }
  })
}
