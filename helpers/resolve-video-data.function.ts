import { AspectRatio } from 'src/modules/shared/types/aspect-ratio.value';
import { VideoProvider } from 'src/modules/shared/types/video-provider.value';
import { VideoSelectorField } from 'src/modules/vsf-storyblok-module';

import VideoData from '../components/storyblok/interfaces/video-data.interface';

export enum ResolvedVideoSourceType {
  ASSET = 'asset',
  EMBEDDED = 'embedded'
}

interface ResolvedVideoDataBase {
  sourceType: ResolvedVideoSourceType,
  displayControls: boolean,
  autoplay: boolean,
  muted: boolean,
  loop: boolean
}

export interface ResolvedAssetVideoData extends ResolvedVideoDataBase {
  sourceType: ResolvedVideoSourceType.ASSET,
  assetUrl: string,
  aspectRatio: number
}

export interface ResolvedEmbeddedVideoData extends ResolvedVideoDataBase {
  sourceType: ResolvedVideoSourceType.EMBEDDED,
  videoId: string,
  provider: VideoProvider,
  aspectRatio?: AspectRatio
}

export type ResolvedVideoData = ResolvedAssetVideoData | ResolvedEmbeddedVideoData;

export function resolveVideoSelectorField (selector?: VideoSelectorField | null): ResolvedVideoData | undefined {
  if (!selector) {
    return;
  }

  const asset = selector.asset;
  const options = selector.options || {};

  if (asset && asset.filename) {
    return {
      sourceType: ResolvedVideoSourceType.ASSET,
      assetUrl: asset.filename,
      aspectRatio: selector.aspect_ratio as number,
      autoplay: options.autoplay === true,
      muted: options.muted === true,
      loop: options.loop === true,
      displayControls: options.display_controls === true
    };
  }

  if (!selector.video_id || !selector.provider) {
    return;
  }

  return {
    sourceType: ResolvedVideoSourceType.EMBEDDED,
    videoId: selector.video_id,
    provider: selector.provider,
    aspectRatio: selector.aspect_ratio as AspectRatio,
    autoplay: false,
    muted: false,
    loop: false,
    displayControls: options.display_controls === true
  };
}

export function resolveVideoData (videoData: VideoData): ResolvedVideoData | undefined {
  return resolveVideoSelectorField(videoData.video);
}
