import PlushieProductType from 'theme/interfaces/plushie-product-type';

export default function getForeversSkuByType (type: string): string {
  switch (type) {
    case PlushieProductType.DOG:
      return 'ForeversDog_bundle'
    case PlushieProductType.CAT:
      return 'ForeversCat_bundle'
    case PlushieProductType.OTHER:
      return 'ForeversOther_bundle'
    default:
      throw new Error('Unknown product type: ' + type);
  }
}
