import { ItemData } from 'src/modules/vsf-storyblok-module';

export interface CarouselData extends ItemData {
  items: any[],
  autoplay: boolean,
  showCounter: boolean,
  slidesPerView: number,
  slidesPerViewMobile?: number,
  spaceBetween?: number,
  autoplayDelay?: number
}
