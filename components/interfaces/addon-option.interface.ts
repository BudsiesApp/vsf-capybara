import { CustomOption } from 'core/modules/catalog/types/CustomOption';

// TODO: currently only used in `m-addons-selector`
// which used only in `o-cross-sells-products-selector` component
// probably can be simplified
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
