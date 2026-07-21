import { DraftOrderItem } from 'src/modules/customization-system';

export interface OrderItemCustomizationFormData {
  id: number,
  title: string,
  draftOrderItem: DraftOrderItem,
  product: any,
  isCustomized: boolean
}
