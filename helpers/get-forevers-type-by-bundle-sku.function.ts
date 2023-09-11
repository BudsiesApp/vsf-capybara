import PlushieProductType from 'theme/interfaces/plushie-product-type';

export default function getForeversTypeByBundleSku (sku?: string): string {
  switch (sku) {
    case 'ForeversDog_bundle':
      return PlushieProductType.DOG;
    case 'ForeversCat_bundle':
      return PlushieProductType.CAT;
    case 'ForeversOther_bundle':
      return PlushieProductType.OTHER;
    default:
      throw new Error('Unknown forevers bundle sku: ' + sku);
  }
}
