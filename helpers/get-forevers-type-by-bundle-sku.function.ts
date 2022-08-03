export default function getForeversTypeByBundleSku (sku?: string): string {
  switch (sku) {
    case 'ForeversDog_bundle':
      return 'dog'
    case 'ForeversCat_bundle':
      return 'cat'
    case 'ForeversOther_bundle':
      return 'other'
    default:
      throw new Error('Unknown forevers bundle sku: ' + sku);
  }
}
