import { ImageSourceItem } from 'src/modules/budsies';

export default interface ZoomGalleryImage {
  thumb: string | ImageSourceItem[],
  thumbFallback?: ImageSourceItem,
  stage: string | ImageSourceItem[],
  stageFallback?: ImageSourceItem,
  big: string,
  alt?: string,
  title?: string
}
