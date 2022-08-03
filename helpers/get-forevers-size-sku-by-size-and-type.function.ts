const availableSizes = ['small', 'medium', 'large'];

export default function getForeversSizeSkuBySizeAndType (size: string, type: string): string {
  if (!availableSizes.includes(size)) {
    throw new Error(`Unknown product size: ${size}`);
  }

  let skuPrefix;

  switch (type) {
    case 'dog':
      skuPrefix = 'simpleForeversDog'
      break;
    case 'cat':
      skuPrefix = 'simpleForeversCat'
      break;
    case 'other':
      skuPrefix = 'simpleForeversOther'
      break;
    default:
      throw new Error('Unknown product type: ' + type);
  }

  return `${skuPrefix}_${size}`;
}
