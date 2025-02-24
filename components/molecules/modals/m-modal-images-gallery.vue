<template>
  <SfModal
    :visible="isVisible"
    @close="closeModal"
    class="m-modal-images-gallery"
  >
    <div class="_modal-content">
      <div
        class="_navigation -back"
        @click="toPreviousImage"
        v-show="hasPreviousImage"
      >
        <div class="_icon -back" />
      </div>

      <div class="_image-container" v-if="currentImage">
        <img :src="currentImage" class="_image">
      </div>

      <div
        class="_navigation -next"
        @click="toNextImage"
        v-show="hasNextImage"
      >
        <div class="_icon -next" />
      </div>
    </div>
  </SfModal>
</template>

<script lang="ts">
import Vue from 'vue';
import { SfModal } from '@storefront-ui/vue';

export default Vue.extend({
  name: 'MModalImagesGallery',
  components: {
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
  data () {
    return {
      currentIndex: 0
    }
  },
  computed: {
    currentImage (): string | undefined {
      return this.images[this.currentIndex];
    },
    images (): string[] {
      return this.modalData?.payload?.images || [];
    },
    hasPreviousImage (): boolean {
      return this.currentIndex !== 0;
    },
    hasNextImage (): boolean {
      return this.currentIndex < this.images.length - 1;
    }
  },
  methods: {
    closeModal (): void {
      this.$emit('close', this.modalData.name)
      this.currentIndex = 0;
    },
    toPreviousImage (): void {
      if (!this.hasPreviousImage) {
        return;
      }

      this.currentIndex--;
    },
    toNextImage (): void {
      if (!this.hasNextImage) {
        return;
      }

      this.currentIndex++;
    }
  }
});
</script>

<style lang="scss" scoped>
.m-modal-images-gallery {
  --modal-content-padding: 0;
  --modal-width: auto;

  ._modal-content {
    position: relative;
    display: flex;
  }

  ._image-container {
    display: flex;
  }

  ._image {
    max-width: 100%;
  }

  ._icon {
    display: none;
    position: absolute;
    width: 20px;
    height: 20px;
    border: 6px solid var(--c-dark);
    border-top-color: transparent;
    border-right-color: transparent;

    &.-next {
      transform: rotate(225deg);
      right: 20px;
    }

    &.-back {
      transform: rotate(45deg);
      left: 20px;
    }
  }

  ._navigation {
    position: absolute;
    top: 0;
    height: 100%;
    width: 40%;
    cursor: pointer;
    display: flex;
    align-items: center;
    z-index: 2;

    &.-back {
      left: 0;
      justify-content: flex-start;
    }

    &.-next {
      right: 0;
      justify-content: flex-end;
    }

    &:hover {
      ._icon {
        display: block;
      }
    }
  }

}
</style>
