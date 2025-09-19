import { DraftOrderItem } from 'src/modules/customization-system';

export interface OrderItemCustomizationFormData {
  id: string,
  title: string,
  draftOrderItem: DraftOrderItem,
  product: any,
  isCustomized: boolean
}
