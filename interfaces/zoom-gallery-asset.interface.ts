import { ImageSourceItem } from 'src/modules/budsies';
import { AspectRatio, VideoProvider } from 'src/modules/shared';

export interface ZoomGalleryVideoData {
  videoId: string,
  provider: VideoProvider,
  aspectRatio?: AspectRatio,
  displayControls?: boolean,
  autoplay?: boolean
}

export default interface ZoomGalleryAsset {
  thumb: string | ImageSourceItem[],
  thumbFallback?: ImageSourceItem,
  stage: string | ImageSourceItem[],
  stageFallback?: ImageSourceItem,
  big: string,
  alt?: string,
  title?: string,
  video?: ZoomGalleryVideoData
}
