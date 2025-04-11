import { AssetField, ItemData } from 'src/modules/vsf-storyblok-module';

export interface LightboxGalleryData extends ItemData {
  preview_image: AssetField,
  images_list: AssetField[]
}
