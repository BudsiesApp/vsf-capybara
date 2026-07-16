import { VideoProvider } from 'src/modules/shared';

import ZoomGalleryAsset from 'theme/interfaces/zoom-gallery-asset.interface';
import VideoData from 'theme/components/storyblok/interfaces/video-data.interface';
import { resolveVideoData, ResolvedVideoSourceType } from './resolve-video-data.function';

const supportedVideoProviders: readonly VideoProvider[] = [VideoProvider.youtubeShorts, VideoProvider.youtube];

enum YoutubeImageQuality {
  STANDARD = 'sddefault',
  MEDIUM = 'mqdefault',
  HIGH = 'hqdefault',
  MAX = 'maxresdefault',
}

function getYouTubeImageSrc (videoId: string, quality: YoutubeImageQuality): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

export function getZoomGalleryAssetForVideoData (videoData: VideoData): ZoomGalleryAsset | undefined {
  const resolvedVideo = resolveVideoData(videoData);
  if (!resolvedVideo || resolvedVideo.sourceType !== ResolvedVideoSourceType.EMBEDDED) {
    return;
  }

  if (!supportedVideoProviders.includes(resolvedVideo.provider)) {
    return;
  }

  const videoId = resolvedVideo.videoId;

  const asset: ZoomGalleryAsset = {
    stage: '',
    thumb: '',
    big: '',
    alt: '',
    title: '',
    video: {
      videoId: videoId,
      provider: resolvedVideo.provider,
      aspectRatio: resolvedVideo.aspectRatio,
      displayControls: resolvedVideo.displayControls,
      autoplay: false
    }
  };

  switch (resolvedVideo.provider) {
    case VideoProvider.youtube:
    case VideoProvider.youtubeShorts:
      asset.stage = getYouTubeImageSrc(videoId, YoutubeImageQuality.MAX);
      asset.thumb = getYouTubeImageSrc(videoId, YoutubeImageQuality.STANDARD);
      asset.big = getYouTubeImageSrc(videoId, YoutubeImageQuality.MAX);
      break;
  }

  return asset;
}
