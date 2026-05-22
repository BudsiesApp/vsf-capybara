import config from 'config';

import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';

export interface CartLineCouponOffer {
  buttonText: string,
  couponCode: string
}

export interface CartLineCouponOffersConfig {
  mappings: Record<string, CartLineCouponOffer>
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
  mappings: Record<string, CartLineCouponOffer> = getCartLineCouponOffersConfig().mappings
): CartLineCouponOffer | undefined {
  const mappingKey = getCartLineCouponOfferMappingKey(product);
  const offer = mappings[mappingKey];

  if (!offer || !offer.buttonText || !offer.couponCode) {
    return undefined;
  }

  return offer;
}
