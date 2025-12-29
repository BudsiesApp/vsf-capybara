import { AspectRatio } from 'src/modules/shared';
import { ItemData, VideoUrlField } from 'src/modules/vsf-storyblok-module';

export default interface VideoData extends ItemData {
  url: VideoUrlField,
  aspect_ratio: AspectRatio,
  display_controls?: boolean
}

export function isVideoData (item: any): item is VideoData {
  if (!item.aspect_ratio) {
    return false;
  }

  const url = item.url;

  if (!url) {
    return false;
  }

  return url.video_id && url.video_url && url.provider;
}
