import CartItemOption from 'core/modules/cart/types/CartItemOption';
import { Customization, CustomizationStateItem, EstimatedShipment } from 'src/modules/customization-system';

export interface OrderContentItem {
  key: string,
  thumbnail: string,
  name: string,
  qty: number,
  customizations?: Customization[],
  customizationState?: CustomizationStateItem[],
  customOptions: CartItemOption[],
  estimatedShipment?: EstimatedShipment,
  specialPrice?: string,
  regularPrice: string
}
