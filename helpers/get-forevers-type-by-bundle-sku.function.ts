import ForeversProductType from 'theme/interfaces/forevers-product-type';

export default function getForeversTypeByBundleSku (sku?: string): string {
  switch (sku) {
    case 'ForeversDog_bundle':
      return ForeversProductType.DOG;
    case 'ForeversCat_bundle':
      return ForeversProductType.CAT;
    case 'ForeversOther_bundle':
      return ForeversProductType.OTHER;
    default:
      throw new Error('Unknown forevers bundle sku: ' + sku);
  }
}
