import { VideoProvider } from 'src/modules/shared';

import ZoomGalleryAsset from 'theme/interfaces/zoom-gallery-asset.interface';
import VideoData from 'theme/components/storyblok/interfaces/video-data.interface';

enum YouTubeImageQuality {
  STANDARD = 'sddefault',
  MEDIUM = 'mqdefault',
  HIGH = 'hqdefault',
  MAX = 'maxresdefault',
}

function getYouTubeImageSrc (videoId: string, quality: YouTubeImageQuality): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

export function getZoomGalleryAssetForVideoData (videoData: VideoData): ZoomGalleryAsset {
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
      asset.stage = getYouTubeImageSrc(videoId, YouTubeImageQuality.MAX);
      asset.thumb = getYouTubeImageSrc(videoId, YouTubeImageQuality.STANDARD);
      asset.big = getYouTubeImageSrc(videoId, YouTubeImageQuality.MAX);
      break;
  }

  return asset;
}
