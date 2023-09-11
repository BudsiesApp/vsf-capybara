import PlushieProductType from 'theme/interfaces/plushie-product-type';

const availableSizes = ['small', 'medium', 'large'];

export default function getForeversSizeSkuBySizeAndType (size: string, type: string): string {
  if (!availableSizes.includes(size)) {
    throw new Error(`Unknown product size: ${size}`);
  }

  let skuPrefix;

  switch (type) {
    case PlushieProductType.DOG:
      skuPrefix = 'simpleForeversDog'
      break;
    case PlushieProductType.CAT:
      skuPrefix = 'simpleForeversCat'
      break;
    case PlushieProductType.OTHER:
      skuPrefix = 'simpleForeversOther'
      break;
    default:
      throw new Error('Unknown product type: ' + type);
  }

  return `${skuPrefix}_${size}`;
}
