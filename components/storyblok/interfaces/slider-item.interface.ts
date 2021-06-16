import ImageInterface from './image.interface';
import LinkInterface from './link.interface';

export default interface SliderItemInterface {
  _uid: string,
  image: ImageInterface,
  mobile_image: ImageInterface,
  alt_tag: string,
  title_tag: string,
  link_url: LinkInterface,
  target_blank: boolean,
  css_classes: string,
  alignment: string,
  margin_bottom: string,
  margin_left: string,
  margin_right: string,
  margin_top: string,
  padding_bottom: string,
  padding_left: string,
  padding_right: string,
  padding_top: string
}
