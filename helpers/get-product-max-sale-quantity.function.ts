import { isBundleProduct } from '@vue-storefront/core/modules/catalog/helpers';
import Product from '@vue-storefront/core/modules/catalog/types/Product';
import { getSelectedProductLinkFromBundleOption, getDefaultProductLinkFromBundleOption } from '@vue-storefront/core/modules/catalog/helpers/bundleOptions';

const defaultMaxSaleQuantity = 10000;
const simpleProductBundleOptionTitle = 'product';

function getProductMaxSaleQuantityForBundleProduct (product: Product): number {
  if (!product.bundle_options) {
    return defaultMaxSaleQuantity;
  }

  const productBundleOption = product.bundle_options.find((option) => {
    return option.title.toLowerCase() === simpleProductBundleOptionTitle
  });

  if (!productBundleOption) {
    return defaultMaxSaleQuantity;
  }

  let stockProduct: Product | undefined;

  if (product.product_option) {
    stockProduct = getSelectedProductLinkFromBundleOption(
      productBundleOption,
      product.product_option
    )?.product;
  }

  if (!stockProduct) {
    stockProduct = getDefaultProductLinkFromBundleOption(productBundleOption)?.product;
  }

  if (!stockProduct || !stockProduct.stock.max_sale_qty) {
    return defaultMaxSaleQuantity;
  }

  return stockProduct.stock.max_sale_qty;
}

export function getProductMaxSaleQuantity (product: Product): number {
  if (isBundleProduct(product)) {
    return getProductMaxSaleQuantityForBundleProduct(product);
  }

  return defaultMaxSaleQuantity;
}
