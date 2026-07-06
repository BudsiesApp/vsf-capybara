import { PriceHelper } from '@vue-storefront/core/helpers';

export interface ProductionTimeOptionCardData {
  optionName: string,
  optionValueSku: string,
  price: PriceHelper.ProductPrice,
  slotsLeft: number,
  turnaroundTime: number
}
