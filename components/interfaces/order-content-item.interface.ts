import { Customization, CustomizationStateItem } from 'src/modules/customization-system';

export interface OrderContentItem {
  key: string,
  thumbnail: string,
  name: string,
  qty: number,
  customizations?: Customization[],
  customizationState?: CustomizationStateItem[],
  specialPrice?: string,
  regularPrice: string
}
