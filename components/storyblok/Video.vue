<template>
  <div
    class="storyblok-video layout-regular-component"
    :class="cssClasses"
    :style="styles"
  >
    <editor-block-icons :item="itemData" />

    <video
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
  </div>
</template>

<script lang="ts">
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
