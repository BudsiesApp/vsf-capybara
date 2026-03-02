import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';

export function getCartItemTitle (cartItem: CartItem): string {
  let name = cartItem.name;

  if (!cartItem?.is_alteration_product || !cartItem.extension_attributes?.plushie_id) {
    return name;
  }

  return `${name} (for #${cartItem.extension_attributes.plushie_id})`;
}
