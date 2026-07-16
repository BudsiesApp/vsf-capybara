import { AssetField, ItemData, ColorPickerField, LinkField, VideoSelectorField } from 'src/modules/vsf-storyblok-module';

export default interface HomepageIntroSectionData extends ItemData {
  image: AssetField,
  mobile_image: AssetField,
  title: string,
  subtitle: string,
  text_color: ColorPickerField,
  button_link: LinkField,
  button_text: string,
  background_color: ColorPickerField,
  desktop_content_start?: number | string,
  desktop_content_end?: number | string,
  background_video?: VideoSelectorField,
  mobile_background_video?: VideoSelectorField
}
