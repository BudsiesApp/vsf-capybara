import { onlineHelper } from '@vue-storefront/core/helpers';
import CartItem from 'core/modules/cart/types/CartItem';
import { htmlDecode } from '@vue-storefront/core/filters/html-decode';

export function getCartItemOptions (cartItem: CartItem): {
  isCustom: boolean,
  label: string,
  value: string
}[] {
  if (!cartItem.custom_options?.length && !cartItem.configurable_options?.length) {
    return [];
  }

  const options = onlineHelper.isOnline && cartItem.totals && cartItem.totals.options
    ? cartItem.totals.options
    : cartItem.options || [];

  return options.map((option) => {
    return {
      value: htmlDecode(option.value),
      label: option.label,
      isCustom: !!cartItem.custom_options?.find((customOption) => customOption.title === option.label)
    }
  })
}
