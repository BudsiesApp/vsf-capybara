import PlushieProductType from 'theme/interfaces/plushie-product-type';

import {
  FOREVERS_CAT_BUNDLE_SKU,
  FOREVERS_DOG_BUNDLE_SKU,
  FOREVERS_OTHER_BUNDLE_SKU
} from './forevers-product-skus';

export default function getForeversSkuByType (type: string): string {
  switch (type) {
    case PlushieProductType.DOG:
      return FOREVERS_DOG_BUNDLE_SKU
    case PlushieProductType.CAT:
      return FOREVERS_CAT_BUNDLE_SKU
    case PlushieProductType.OTHER:
      return FOREVERS_OTHER_BUNDLE_SKU
    default:
      throw new Error('Unknown product type: ' + type);
  }
}
