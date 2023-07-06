
import PlushieProductType from 'theme/interfaces/plushie-product-type';

export default function getGolfCoverSkuByType (type: string): string {
  switch (type) {
    case PlushieProductType.DOG:
      return 'golfHeadCoversDog_bundle'
    case PlushieProductType.CAT:
      return 'golfHeadCoversCat_bundle'
    case PlushieProductType.OTHER:
      return 'golfHeadCoversOther_bundle'
    default:
      throw new Error('Unknown product type: ' + type);
  }
}
