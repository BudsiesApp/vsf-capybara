import config from 'config';

import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';

export interface CartLineCouponOffer {
  buttonText: string,
  couponCode: string
}

export interface CartLineCouponOfferMapping {
  buttonText: string,
  productSkus: string[]
}

export interface CartLineCouponOffersConfig {
  mappings: Record<string, CartLineCouponOfferMapping>
}

export function getCartLineCouponOffersConfig (): CartLineCouponOffersConfig {
  const cartConfig = (config as any).cart || {};

  return cartConfig.cartLineCouponOffers || { mappings: {} };
}

export function getCartLineCouponOfferMappingKey (product: CartItem): string {
  return product.parentSku || product.sku;
}

export function resolveCartLineCouponOffer (
  product: CartItem,
  mappings: Record<string, CartLineCouponOfferMapping> = getCartLineCouponOffersConfig().mappings
): CartLineCouponOffer | undefined {
  const mappingKey = getCartLineCouponOfferMappingKey(product);

  for (const couponCode in mappings) {
    const mapping = mappings[couponCode];

    if (!mapping || !mapping.buttonText || !Array.isArray(mapping.productSkus)) {
      continue;
    }

    if (!mapping.productSkus.includes(mappingKey)) {
      continue;
    }

    return {
      buttonText: mapping.buttonText,
      couponCode
    };
  }

  return undefined;
}
