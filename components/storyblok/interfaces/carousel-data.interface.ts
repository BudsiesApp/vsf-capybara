import { ItemData } from 'src/modules/vsf-storyblok-module';

export interface CarouselData extends ItemData {
  items: any[],
  autoplay: boolean,
  showCounter: boolean,
  perView: number,
  perViewMobile?: number,
  gap?: number,
  peek?: number
}
