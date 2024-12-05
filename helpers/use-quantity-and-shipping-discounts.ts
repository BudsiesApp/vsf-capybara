import { ref } from '@vue/composition-api';

export function useQuantityAndShippingDiscounts () {
  const showQuantityNotes = ref<boolean>(false);
  const quantityAndShippingDiscountsStorySlug = 'budsies_shipping_qty_discount_popup_content';

  return {
    showQuantityNotes,
    quantityAndShippingDiscountsStorySlug
  }
}
