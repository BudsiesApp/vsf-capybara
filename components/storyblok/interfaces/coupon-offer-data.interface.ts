import { ItemData } from 'src/modules/vsf-storyblok-module';

export default interface CouponOfferData extends ItemData {
  coupon_code: string,
  title: string
}
