import { PlushieType } from 'theme/interfaces/plushie.type';

import getForeversSkuByType from './get-forevers-sku-by-type.function';
import getGolfCoverSkuByType from './get-golf-covers-sku-by-type.function';

export default function getPlushieSkuByTypes (
  productType: string,
  plushieType: PlushieType
): string {
  switch (plushieType) {
    case PlushieType.FOREVERS:
      return getForeversSkuByType(productType);
    case PlushieType.GOLF_COVERS:
      return getGolfCoverSkuByType(productType);
    default:
      throw new Error('Unknown plushie type: ' + plushieType);
  }
}
