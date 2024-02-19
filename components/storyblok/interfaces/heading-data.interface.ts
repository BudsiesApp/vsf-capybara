import { ItemData, LinkField } from 'src/modules/vsf-storyblok-module';

export default interface HeadingData extends ItemData {
  title: string,
  heading_type: string,
  is_custom_styled?: boolean,
  intro_text: string,
  is_link?: boolean,
  link_url?: LinkField
}
