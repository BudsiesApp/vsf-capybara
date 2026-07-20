import { ItemData, VideoSelectorField } from 'src/modules/vsf-storyblok-module';

import { resolveVideoData } from '../../../helpers/resolve-video-data.function';

export default interface VideoData extends ItemData {
  video?: VideoSelectorField
}

export function isVideoData (item: any): item is VideoData {
  return !!resolveVideoData(item as VideoData);
}
