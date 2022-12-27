import CartItemOption from 'core/modules/cart/types/CartItemOption';

export interface OrderContentItem {
  key: string,
  thumbnail: string,
  name: string,
  plushieName?: string,
  plushieBreed?: string,
  qty: number,
  customOptions: CartItemOption[],
  specialPrice?: string,
  regularPrice: string,
  bundleOptions: string[]
}
