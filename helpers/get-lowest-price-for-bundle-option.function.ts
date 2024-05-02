import { BundleOptionsProductLink } from 'core/modules/catalog/types/BundleOption';
import Product from 'core/modules/catalog/types/Product';

import { PriceHelper } from 'src/modules/shared';

export function getLowestPriceForBundleOptionProductLinks (productLinks: BundleOptionsProductLink[]): PriceHelper.ProductPrice {
  let lowestPrice: number | undefined;
  let lowestPriceProduct: Product | undefined;

  productLinks.forEach((productLink) => {
    if (!productLink.product) {
      return;
    }

    const productPrice = PriceHelper.getProductDefaultPrice(productLink.product, {}, false);
    const finalProductPrice = PriceHelper.getFinalPrice(productPrice);

    if (lowestPrice === undefined || finalProductPrice < lowestPrice) {
      lowestPrice = finalProductPrice;
      lowestPriceProduct = productLink.product;
    }
  });

  return PriceHelper.getProductDefaultPrice(lowestPriceProduct, {}, false);
}
