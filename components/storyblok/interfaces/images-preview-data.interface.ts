import { AssetField, ItemData } from 'src/modules/vsf-storyblok-module';

export interface ImagesPreviewData extends ItemData {
  main_image: AssetField,
  preview_images_list: AssetField[]
}
