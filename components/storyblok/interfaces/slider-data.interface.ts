import { ItemData } from 'src/modules/vsf-storyblok-module';
import SliderItem from './slider-item-data.interface';
import { ThumbnailsPosition } from './thumbnails-position.value';
import VideoData from './video-data.interface';

export default interface SliderData extends ItemData {
  slider_items: (SliderItem | VideoData)[],
  thumbnails_position: ThumbnailsPosition,
  delay_image_load: boolean
}
