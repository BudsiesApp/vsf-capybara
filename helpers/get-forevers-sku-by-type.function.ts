import ForeversProductType from 'theme/interfaces/forevers-product-type';

export default function getForeversSkuByType (type: string): string {
  switch (type) {
    case ForeversProductType.DOG:
      return 'ForeversDog_bundle'
    case ForeversProductType.CAT:
      return 'ForeversCat_bundle'
    case ForeversProductType.OTHER:
      return 'ForeversOther_bundle'
    default:
      throw new Error('Unknown product type: ' + type);
  }
}
