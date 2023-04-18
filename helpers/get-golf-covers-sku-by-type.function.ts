
import ForeversProductType from 'theme/interfaces/forevers-product-type';

export default function getGolfCoverSkuByType (type: string): string {
  switch (type) {
    case ForeversProductType.DOG:
      return 'golfHeadCoversDog_bundle'
    case ForeversProductType.CAT:
      return 'golfHeadCoversCat_bundle'
    case ForeversProductType.OTHER:
      return 'golfHeadCoversOther_bundle'
    default:
      throw new Error('Unknown product type: ' + type);
  }
}
