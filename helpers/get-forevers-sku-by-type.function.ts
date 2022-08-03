export default function getForeversSkuByType (type: string): string {
  switch (type) {
    case 'dog':
      return 'ForeversDog_bundle'
    case 'cat':
      return 'ForeversCat_bundle'
    case 'other':
      return 'ForeversOther_bundle'
    default:
      throw new Error('Unknown product type: ' + type);
  }
}
