import ForeversProductType from 'theme/interfaces/forevers-product-type';

const availableSizes = ['small', 'medium', 'large'];

export default function getForeversSizeSkuBySizeAndType (size: string, type: string): string {
  if (!availableSizes.includes(size)) {
    throw new Error(`Unknown product size: ${size}`);
  }

  let skuPrefix;

  switch (type) {
    case ForeversProductType.DOG:
      skuPrefix = 'simpleForeversDog'
      break;
    case ForeversProductType.CAT:
      skuPrefix = 'simpleForeversCat'
      break;
    case ForeversProductType.OTHER:
      skuPrefix = 'simpleForeversOther'
      break;
    default:
      throw new Error('Unknown product type: ' + type);
  }

  return `${skuPrefix}_${size}`;
}
