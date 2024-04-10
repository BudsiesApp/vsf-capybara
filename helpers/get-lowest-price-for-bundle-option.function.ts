import { BundleOption } from 'core/modules/catalog/types/BundleOption';
import Product from 'core/modules/catalog/types/Product';

import { PriceHelper } from 'src/modules/shared';

export function getLowestPriceForBundleOption (bundleOption: BundleOption): PriceHelper.ProductPrice {
  let lowestPrice: number | undefined;
  let lowestPriceProduct: Product | undefined;

  bundleOption.product_links.forEach((productLink) => {
    if (!productLink.product) {
      return;
    }

    const productPrice = PriceHelper.getProductDefaultPrice(productLink.product, {}, false);
    const finalProductPrice = PriceHelper.getFinalPrice(productPrice);

    if (!lowestPrice || finalProductPrice < lowestPrice) {
      lowestPrice = finalProductPrice;
      lowestPriceProduct = productLink.product;
    }
  });

  return PriceHelper.getProductDefaultPrice(lowestPriceProduct, {}, false);
}
