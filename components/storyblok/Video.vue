<template>
  <div
    class="storyblok-video layout-regular-component"
    :class="cssClasses"
    :style="styles"
  >
    <editor-block-icons :item="itemData" />

    <video
      class="_asset-video"
      :src="resolvedVideoData.assetUrl"
      :autoplay="resolvedVideoData.autoplay"
      :muted="resolvedVideoData.muted"
      :loop="resolvedVideoData.loop"
      :controls="resolvedVideoData.displayControls"
      playsinline
      v-if="hasAssetVideo"
    />

    <StreamingVideo
      class="_embedded-video"
      :aspect-ratio="resolvedVideoData.aspectRatio"
      :video-id="resolvedVideoData.videoId"
      :provider="resolvedVideoData.provider"
      :display-controls="resolvedVideoData.displayControls"
      v-else-if="hasEmbeddedVideo"
    />
  </div>
</template>

<script lang="ts">
import { Blok } from 'src/modules/vsf-storyblok-module/components';

import { StreamingVideo } from 'src/modules/shared';

import VideoData from './interfaces/video-data.interface';
import {
  resolveVideoData,
  ResolvedVideoData,
  ResolvedVideoSourceType
} from '../../helpers/resolve-video-data.function';

export default Blok.extend({
  name: 'StoryblokVideo',
  components: {
    StreamingVideo
  },
  computed: {
    itemData (): VideoData {
      return this.item as VideoData;
    },
    resolvedVideoData (): ResolvedVideoData | undefined {
      return resolveVideoData(this.itemData);
    },
    hasAssetVideo (): boolean {
      return !!this.resolvedVideoData && this.resolvedVideoData.sourceType === ResolvedVideoSourceType.ASSET;
    },
    hasEmbeddedVideo (): boolean {
      return !!this.resolvedVideoData && this.resolvedVideoData.sourceType === ResolvedVideoSourceType.EMBEDDED;
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "src/modules/vsf-storyblok-module/components/defaults/mixins";

.storyblok-video {
  ._asset-video {
    display: block;
    width: 100%;
    height: auto;
  }

  &.-editor-preview-mode {
    ._asset-video,
    ._embedded-video {
      pointer-events: none
    }
  }

  @include display-property-handling;
}
</style>
