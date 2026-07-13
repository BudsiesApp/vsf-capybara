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

export function resolveVideoSelectorField (selector: VideoSelectorField): ResolvedVideoData | undefined {
  if (!selector) {
    return;
  }

  const asset = selector.asset;

  if (asset && asset.filename) {
    return {
      sourceType: ResolvedVideoSourceType.ASSET,
      assetUrl: asset.filename,
      aspectRatio: selector.aspect_ratio as number,
      autoplay: selector.autoplay === true,
      muted: selector.muted === true,
      loop: selector.loop === true,
      displayControls: selector.display_controls === true
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
    displayControls: selector.display_controls === true
  };
}

export function resolveVideoData (videoData: VideoData): ResolvedVideoData | undefined {
  if (videoData.video !== undefined) {
    return resolveVideoSelectorField(videoData.video);
  }

  const url = videoData.url;
  if (!url || !url.video_id || !url.provider) {
    return;
  }

  return {
    sourceType: ResolvedVideoSourceType.EMBEDDED,
    videoId: url.video_id,
    provider: url.provider,
    aspectRatio: videoData.aspect_ratio,
    autoplay: false,
    muted: false,
    loop: false,
    displayControls: videoData.display_controls === true
  };
}
