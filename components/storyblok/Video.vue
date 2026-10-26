<template>
  <div
    class="storyblok-video layout-regular-component"
    :class="cssClasses"
    :style="styles"
  >
    <editor-block-icons :item="itemData" />

    <video
      ref="videoElement"
      class="_asset-video"
      :src="assetVideoData.assetUrl"
      :autoplay="assetVideoData.autoplay"
      :muted="assetVideoData.muted"
      :loop="assetVideoData.loop"
      :controls="assetVideoData.displayControls"
      playsinline
      v-if="assetVideoData"
    />

    <StreamingVideo
      class="_embedded-video"
      :aspect-ratio="embeddedVideoData.aspectRatio"
      :video-id="embeddedVideoData.videoId"
      :provider="embeddedVideoData.provider"
      :display-controls="embeddedVideoData.displayControls"
      v-else-if="embeddedVideoData"
    />
    <VideoPlaybackButton v-if="isEnabled" :is-paused="isPaused" @activate="toggle" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, onMounted, ref } from 'vue';
import { isServer } from '@vue-storefront/core/helpers';
import { isStoryblokPreview } from 'src/modules/vsf-storyblok-module/helpers/is-storyblok-preview.function';
import VideoPlaybackButton from 'src/modules/shared/components/video-playback-button.vue';
import { useVideoPlaybackToggle } from 'src/modules/shared/composables/use-video-playback-toggle';
import { assetPlaybackKey } from 'src/modules/shared/helpers/video-playback';
import { Blok } from 'src/modules/vsf-storyblok-module/components';

import { StreamingVideo } from 'src/modules/shared';

import VideoData from './interfaces/video-data.interface';
import {
  resolveVideoData,
  ResolvedAssetVideoData,
  ResolvedEmbeddedVideoData,
  ResolvedVideoData,
  ResolvedVideoSourceType
} from '../../helpers/resolve-video-data.function';

export default defineComponent({
  extends: Blok,
  name: 'StoryblokVideo',
  components: {
    StreamingVideo,
    VideoPlaybackButton
  },
  props: {
    item: {
      type: Object as PropType<VideoData>,
      required: true
    }
  },
  setup (props) {
    const videoElement = ref<HTMLVideoElement | null>(null);
    const preview = ref(false);

    onMounted(() => {
      if (!isServer) {
        preview.value = isStoryblokPreview();
      }
    });

    const asset = computed(() => {
      const resolved = resolveVideoData(props.item as VideoData);

      return resolved?.sourceType === ResolvedVideoSourceType.ASSET ? resolved : undefined;
    });
    const key = computed(() => assetPlaybackKey({
      id: asset.value?.assetId,
      filename: asset.value?.assetFilename
    }));
    const configuration = computed(() => ({
      native: !!asset.value,
      autoplay: !!asset.value?.autoplay,
      controls: !!asset.value?.displayControls
    }));

    return {
      videoElement,
      ...useVideoPlaybackToggle(
        videoElement,
        key,
        configuration,
        preview
      )
    };
  },
  computed: {
    itemData (): VideoData {
      return this.item as VideoData;
    },
    resolvedVideoData (): ResolvedVideoData | undefined {
      return resolveVideoData(this.itemData);
    },
    assetVideoData (): ResolvedAssetVideoData | undefined {
      return this.resolvedVideoData?.sourceType === ResolvedVideoSourceType.ASSET
        ? this.resolvedVideoData
        : undefined;
    },
    embeddedVideoData (): ResolvedEmbeddedVideoData | undefined {
      return this.resolvedVideoData?.sourceType === ResolvedVideoSourceType.EMBEDDED
        ? this.resolvedVideoData
        : undefined;
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "src/modules/vsf-storyblok-module/components/defaults/mixins";

.storyblok-video {
  position: relative;

  ._asset-video {
    display: block;
    width: 100%;
    height: auto;
  }

  &.-editor-preview-mode {
    ._asset-video,
    ._embedded-video,
    .video-playback-toggle {
      pointer-events: none
    }
  }

  @include display-property-handling;
}
</style>
