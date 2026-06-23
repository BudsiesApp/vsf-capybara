<template>
  <div
    class="storyblok-video layout-regular-component"
    :class="cssClasses"
    :style="styles"
  >
    <editor-block-icons :item="itemData" />

    <video
      v-if="hasAssetVideo"
      class="_asset-video"
      :src="assetVideoUrl"
      :autoplay="autoplay"
      :muted="muted"
      :loop="loop"
      :controls="displayControls"
      playsinline
    />

    <StreamingVideo
      class="_embedded-video"
      :aspect-ratio="itemData.aspect_ratio"
      :video-id="itemData.url.video_id"
      :provider="itemData.url.provider"
      :display-controls="displayControls"
      :auto-play="autoplay"
      v-else-if="hasEmbeddedVideo"
    />
  </div>
</template>

<script lang="ts">
import { Blok } from 'src/modules/vsf-storyblok-module/components';

import { StreamingVideo } from 'src/modules/shared';

import VideoData from './interfaces/video-data.interface';

export default Blok.extend({
  name: 'StoryblokVideo',
  components: {
    StreamingVideo
  },
  computed: {
    itemData (): VideoData {
      return this.item as VideoData;
    },
    hasAssetVideo (): boolean {
      const video = this.itemData.video;
      return !!(video && video.filename);
    },
    hasEmbeddedVideo (): boolean {
      const url = this.itemData.url;
      return !!(url && url.video_id && url.provider);
    },
    assetVideoUrl (): string {
      return this.itemData.video ? this.itemData.video.filename : '';
    },
    autoplay (): boolean {
      return this.itemData.autoplay !== undefined ? this.itemData.autoplay : false;
    },
    muted (): boolean {
      return this.itemData.muted !== undefined ? this.itemData.muted : false;
    },
    loop (): boolean {
      return this.itemData.loop !== undefined ? this.itemData.loop : false;
    },
    displayControls (): boolean {
      return this.itemData.display_controls !== undefined ? this.itemData.display_controls : true;
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
    ._embedded-video,
    ._asset-video {
      pointer-events: none
    }
  }

  @include display-property-handling;
}
</style>
