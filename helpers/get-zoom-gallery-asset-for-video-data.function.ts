import { VideoProvider } from 'src/modules/shared';

import ZoomGalleryAsset from 'theme/interfaces/zoom-gallery-asset.interface';
import VideoData from 'theme/components/storyblok/interfaces/video-data.interface';

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
  if (!supportedVideoProviders.includes(videoData.url.provider)) {
    return;
  }

  const videoId = videoData.url.video_id;

  const asset: ZoomGalleryAsset = {
    stage: '',
    thumb: '',
    big: '',
    alt: '',
    title: '',
    video: {
      videoId: videoId,
      provider: videoData.url.provider,
      aspectRatio: videoData.aspect_ratio,
      displayControls: videoData.display_controls || false,
      autoplay: false
    }
  };

  switch (videoData.url.provider) {
    case VideoProvider.youtube:
    case VideoProvider.youtubeShorts:
      asset.stage = getYouTubeImageSrc(videoId, YoutubeImageQuality.MAX);
      asset.thumb = getYouTubeImageSrc(videoId, YoutubeImageQuality.STANDARD);
      asset.big = getYouTubeImageSrc(videoId, YoutubeImageQuality.MAX);
      break;
  }

  return asset;
}
