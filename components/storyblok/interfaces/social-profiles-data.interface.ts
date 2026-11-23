import { ColorPickerField, ItemData } from 'src/modules/vsf-storyblok-module';

export type SocialProfilesSize = 'small' | 'medium' | 'large';

export default interface SocialProfilesData extends ItemData {
  icon_set?: 'circled' | 'plain',
  color?: ColorPickerField,
  desktop_size?: SocialProfilesSize,
  mobile_size?: SocialProfilesSize
}
