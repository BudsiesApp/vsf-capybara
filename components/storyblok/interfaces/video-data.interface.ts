import { AspectRatio } from 'src/modules/shared';
import { ItemData, VideoSelectorField, VideoUrlField } from 'src/modules/vsf-storyblok-module';

import { resolveVideoData } from '../../../helpers/resolve-video-data.function';

export default interface VideoData extends ItemData {
  video?: VideoSelectorField,
  url?: VideoUrlField,
  aspect_ratio?: AspectRatio,
  display_controls?: boolean
}

export function isVideoData (item: any): item is VideoData {
  return !!resolveVideoData(item as VideoData);
}
