import { CustomOption } from 'core/modules/catalog/types/CustomOption';

export default interface AddonOption {
  id: number,
  sku: string,
  name: string,
  description: string,
  price: number | undefined,
  regularPrice: number,
  specialPrice: number | null,
  images: string[],
  optionId: number,
  optionValueId: number,
  videoUrl?: string,
  customOptions?: CustomOption[]
}
