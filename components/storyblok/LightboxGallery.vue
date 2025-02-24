<template>
  <div class="storyblok-images-preview">
    <div class="_image _main-preview-image" @click="showBookPreview">
      <BaseImage
        class="_image"
        :srcsets="imageSources"
        :alt="itemData.preview_image.alt"
        :title="itemData.preview_image.title"
      />

      <div class="_preview">
        <i class="_ico-magnify" />

        <span class="_preview-text">
          {{ $t('See Preview') }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { VueConstructor } from 'vue';
import { mapGetters } from 'vuex';

import { BaseImage, ImageSourceItem } from 'src/modules/budsies';
import { InjectType } from 'src/modules/shared';
import { Blok, ComponentWidthCalculator } from 'src/modules/vsf-storyblok-module';

import { LightboxGalleryData } from './interfaces/lightbox-gallery-data.interface';
import generateBreakpointsSpecs from './generate-breakpoints-specs';
import generateImageSourcesList from './generate-image-sources-list';
import { ModalList } from 'theme/store/ui/modals';

interface InjectedServices {
  componentWidthCalculator: ComponentWidthCalculator,
  window: Window
}

interface InjectedServices {
  componentWidthCalculator: ComponentWidthCalculator,
  window: Window
}

export default (Blok as VueConstructor<InstanceType<typeof Blok> & InjectedServices>).extend({
  name: 'LightboxGallery',
  components: {
    BaseImage
  },
  inject: {
    componentWidthCalculator: {},
    window: { from: 'WindowObject' }
  } as unknown as InjectType<InjectedServices>,
  computed: {
    ...mapGetters({
      supportsWebp: 'storyblok/supportsWebp'
    }),
    itemData (): LightboxGalleryData {
      return this.item as LightboxGalleryData;
    },
    imageSrc (): string {
      return this.itemData.preview_image.filename;
    },
    imageSources (): ImageSourceItem[] {
      if (!this.imageSrc) {
        return [];
      };

      const breakpointsSpecs = generateBreakpointsSpecs(
        this.imageSrc,
        this.componentWidthCalculator
      )

      return generateImageSourcesList(
        breakpointsSpecs,
        this.supportsWebp
      )
    }
  },
  methods: {
    showBookPreview (): void {
      this.$store.dispatch('ui/openModal', {
        name: ModalList.ImagesGallery,
        payload: {
          images: this.itemData.images_list.map((item) => item.filename)
        }
      });
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "src/modules/vsf-storyblok-module/components/defaults/mixins";

.storyblok-images-preview {
  @include display-property-handling;

  ._main-preview-image {
    overflow: hidden;
    position: relative;
    border-radius: 30px;
    cursor: pointer;
  }

  ._preview {
    position: absolute;
    box-sizing: border-box;
    bottom: -12px;
    right: -15px;
    width: 116px;
    height: 116px;
    padding-top: 24px;
    border-radius: 50%;
    background: #fbd241;
    line-height: 1.14;
    color: #4d546c;
    font-weight: var(--font-bold);
    text-align: center;

    &:hover {
      opacity: 0.9;
    }

    ._preview-text {
      display: block;
      padding: 4px 15px 0;
    }

    ._ico-magnify {
      display: inline-block;
      width: 25px;
      height: 25px;
      vertical-align: top;
      background: url(/assets/images/ico-magnify.png) no-repeat 0 0;
    }
  }
}
</style>
