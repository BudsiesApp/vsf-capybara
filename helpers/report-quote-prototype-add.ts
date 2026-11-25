import { cartHooksExecutors } from '@vue-storefront/core/modules/cart/hooks';
import createDiffLog from '@vue-storefront/core/modules/cart/helpers/createDiffLog';
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';

export function getServerLineIds (cartItems: CartItem[]): Set<CartItem['server_item_id']> {
  return new Set(cartItems.map(item => item.server_item_id).filter(id => id != null));
}

// Magento adds the prototype while choosing the quote and returns no line, and the cart imports it silently.
// The added line is the newest server line of the sample product that the cart did not have before the choice.
export function reportQuotePrototypeAdd (
  lineIdsBeforeChoice: Set<CartItem['server_item_id']>,
  cartItems: CartItem[],
  sampleSku: string
): void {
  const addedLine = cartItems
    .filter(item => item.sku === sampleSku && item.server_item_id != null && !lineIdsBeforeChoice.has(item.server_item_id))
    .sort((first, second) => Number(second.server_item_id) - Number(first.server_item_id))[0];

  if (!addedLine) {
    return;
  }

  const write = {
    item_id: addedLine.server_item_id,
    qty: addedLine.qty,
    extension_attributes: { budsies_quote_item_totals: addedLine.extension_attributes?.budsies_quote_item_totals }
  };

  cartHooksExecutors.afterAddToCart({
    cartItem: addedLine,
    diffLog: createDiffLog().pushServerResponse({ status: 200, sku: addedLine.sku, result: write })
  });
}
