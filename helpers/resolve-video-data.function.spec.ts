import { AspectRatio } from 'src/modules/shared/types/aspect-ratio.value';
import { VideoProvider } from 'src/modules/shared/types/video-provider.value';
import { Alignment } from 'src/modules/vsf-storyblok-module/types/alignment.value';
import { SpacingSettingsFieldName } from 'src/modules/vsf-storyblok-module/types/spacing-setting-field-name.value';

import VideoData, { isVideoData } from '../components/storyblok/interfaces/video-data.interface';
import { getZoomGalleryAssetForVideoData } from './get-zoom-gallery-asset-for-video-data.function';
import {
  resolveVideoData,
  ResolvedVideoSourceType
} from './resolve-video-data.function';

jest.mock('src/modules/vsf-storyblok-module', () => ({
  resolveStoryblokAssetUrl: (url: string) => url.includes('a.storyblok.com')
    ? url.replace('a.storyblok.com', 'sb-assets.budsies.com')
    : url
}));

jest.mock('src/modules/shared', () => ({
  VideoProvider: {
    youtube: 'youtube',
    youtubeShorts: 'youtube_shorts'
  }
}));

function createVideoData (video?: any): VideoData {
  return {
    _uid: '',
    alignment: Alignment.LEFT,
    spacing_settings: {
      [SpacingSettingsFieldName.MARGIN_TOP]: '',
      [SpacingSettingsFieldName.MARGIN_RIGHT]: '',
      [SpacingSettingsFieldName.MARGIN_BOTTOM]: '',
      [SpacingSettingsFieldName.MARGIN_LEFT]: '',
      [SpacingSettingsFieldName.PADDING_TOP]: '',
      [SpacingSettingsFieldName.PADDING_RIGHT]: '',
      [SpacingSettingsFieldName.PADDING_BOTTOM]: '',
      [SpacingSettingsFieldName.PADDING_LEFT]: ''
    },
    video
  };
}

describe('resolveVideoData', () => {
  it('resolves uploaded selector assets and their playback options', () => {
    const videoData = createVideoData({
      aspect_ratio: 16 / 9,
      asset: { filename: 'https://cdn.example/video.mp4' },
      options: {
        autoplay: true,
        muted: true,
        loop: true,
        display_controls: true
      }
    });

    expect(resolveVideoData(videoData)).toEqual({
      sourceType: ResolvedVideoSourceType.ASSET,
      assetUrl: 'https://cdn.example/video.mp4',
      aspectRatio: 16 / 9,
      autoplay: true,
      muted: true,
      loop: true,
      displayControls: true
    });
    expect(isVideoData(videoData)).toBe(true);
  });

  it('resolves selector embeds and converts supported embeds for the zoom gallery', () => {
    const videoData = createVideoData({
      aspect_ratio: AspectRatio.A16_9,
      video_id: 'youtube-video-id',
      provider: VideoProvider.youtube,
      options: { display_controls: true }
    });

    expect(resolveVideoData(videoData)).toEqual({
      sourceType: ResolvedVideoSourceType.EMBEDDED,
      videoId: 'youtube-video-id',
      provider: VideoProvider.youtube,
      aspectRatio: AspectRatio.A16_9,
      autoplay: false,
      muted: false,
      loop: false,
      displayControls: true
    });

    expect(getZoomGalleryAssetForVideoData(videoData)).toMatchObject({
      video: {
        videoId: 'youtube-video-id',
        provider: VideoProvider.youtube,
        aspectRatio: AspectRatio.A16_9,
        displayControls: true
      }
    });
  });

  it.each([
    undefined,
    null,
    {},
    { aspect_ratio: AspectRatio.A16_9, asset: { filename: '' } },
    { aspect_ratio: AspectRatio.A16_9, provider: VideoProvider.youtube }
  ])('rejects an absent or invalid selector: %p', (video: any) => {
    const videoData = createVideoData(video);

    expect(resolveVideoData(videoData)).toBeUndefined();
    expect(isVideoData(videoData)).toBe(false);
  });

  it('rejects legacy-only Video payloads in all consumers', () => {
    const legacyOnlyVideoData = {
      url: {
        video_id: 'legacy-video-id',
        provider: VideoProvider.youtube
      },
      aspect_ratio: AspectRatio.A16_9,
      display_controls: true
    } as any;

    expect(resolveVideoData(legacyOnlyVideoData)).toBeUndefined();
    expect(isVideoData(legacyOnlyVideoData)).toBe(false);
    expect(getZoomGalleryAssetForVideoData(legacyOnlyVideoData)).toBeUndefined();
  });
});
