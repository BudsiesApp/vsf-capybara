<template>
  <SfModal
    :visible="isVisible"
    @close="closeModal"
    class="m-modal-images-gallery"
  >
    <div class="_modal-content">
      <div class="_overlay" @click="closeModal" />

      <o-carousel
        ref="stageCarousel"
        class="_image-container"
        :show-counter="false"
        :loop="false"
        :items="carouselItems"
        :slides-per-view="1"
        :show-navigation-buttons="true"
      >
        <template #default="{ item: image }">
          <div
            class="_image-wrapper"
            :href="image.big"
            v-if="image"
          >
            <BaseImage
              class="_image"
              :alt="image.alt"
              :lazy="true"
              :src="image.filename"
            />
          </div>
        </template>
      </o-carousel>
    </div>
  </SfModal>
</template>

<script lang="ts">
import Vue from 'vue';
import { SfModal } from '@storefront-ui/vue';

import { BaseImage } from 'src/modules/budsies';
import { AssetField } from 'src/modules/vsf-storyblok-module';

import { OCarouselItem } from 'theme/components/interfaces/o-carousel-item.interface';
import OCarousel from 'theme/components/organisms/o-carousel.vue';
import { resolveStoryblokAssetFields } from 'theme/helpers/storyblok-asset-sink-values';

export default Vue.extend({
  name: 'MModalImagesGallery',
  components: {
    BaseImage,
    OCarousel,
    SfModal
  },
  props: {
    isVisible: {
      type: Boolean,
      default: false,
      required: true
    },
    modalData: {
      type: Object,
      default: () => ({}),
      required: true
    }
  },
  computed: {
    carouselItems (): OCarouselItem[] {
      return this.images.map((image) => ({
        key: image.filename,
        data: image
      }));
    },
    images (): AssetField[] {
      const images: AssetField[] = this.modalData?.payload?.images || [];

      return resolveStoryblokAssetFields(images);
    }
  },
  methods: {
    closeModal (): void {
      this.$emit('close', this.modalData.name)
    }
  }
});
</script>

<style lang="scss" scoped>
@import '~@storefront-ui/shared/styles/helpers/breakpoints';

.m-modal-images-gallery {
  --modal-content-padding: 0;
  --modal-width: auto;
  --modal-background: transparent;

  ._modal-content {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
  }

  ._overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--overlay-background, rgba(var(--c-gray-base), 0.7));
  }

  ._image-container {
    display: flex;
    width: 100%;
  }

  ._image {
    max-width: 100%;
  }

  ::v-deep {
    .sf-modal__close {
      z-index: 2;
    }

    .sf-modal__overlay {
      display: none;
    }

    .sf-modal__content {
      height: 100%;
    }
  }

  @include for-desktop {
    ._overlay {
      display: none;
    }

    ::v-deep {
      .sf-modal__overlay {
        display: block;
      }

      .sf-modal__container {
        max-width: 50rem;
      }
    }
  }
}
</style>
