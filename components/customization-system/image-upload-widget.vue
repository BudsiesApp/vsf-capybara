<template>
  <div class="image-upload-widget">
    <div class="_upload-now" v-show="isUploadNow">
      <p v-if="allowUploadLater">
        {{ $t('Don\'t have your photos? You can finalize your order and') }} <a
          class="_popup-link"
          href="javascript:void(0)"
          @click.stop.prevent="isUploadNow = false"
        >{{ $t('send them to us later.') }}</a>
      </p>

      <m-artwork-upload
        ref="artworkUpload"
        :disabled="isDisabled"
        :product-id="backendProductId"
        :upload-url="artworkUploadUrl"
        :allow-multiple="allowMultiple"
        :initial-items="initialItems"
        :max-files="maxFiles"
        @file-added="onFileAdded"
        @file-removed="onFileRemoved"
      />
    </div>

    <div
      class="_upload-email"
      v-show="!isUploadNow"
      v-if="allowUploadLater"
    >
      <p>
        {{ $t('Want to upload photos now? Please use') }} <a
          class="_popup-link"
          href="javascript:void(0)"
          @click.stop.prevent="isUploadNow = true"
        >{{ $t('our uploader.') }}</a>
      </p>

      <p>
        {{ $t('When you\'re ready, please email a photo of the design to:') }} <br> <a
          class="_popup-link"
          href="mailto:photos@mypetsies.com"
        >photos@mypetsies.com</a>
      </p>
    </div>

    <div class="_error-message">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
import config from 'config';
import { defineComponent, nextTick, PropType, ref, toRefs, watch } from '@vue/composition-api';

import { useBackendProductId } from 'theme/helpers/use-backend-product-id';

import MArtworkUpload from '../molecules/m-artwork-upload.vue';
import { useFilesUpload } from 'src/modules/customization-system';

export default defineComponent({
  components: {
    MArtworkUpload
  },
  props: {
    allowUploadLater: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: undefined
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    maxValuesCount: {
      type: Number as PropType<number | undefined>,
      default: undefined
    },
    productId: {
      type: Number,
      required: true
    },
    value: {
      type: [String, Array] as PropType<string | string[] | undefined>,
      default: undefined
    }
  },
  setup (props, context) {
    const { maxValuesCount, productId, value } = toRefs(props);

    const isUploadNow = ref<boolean>(true);
    const artworkUpload = ref<InstanceType<typeof MArtworkUpload> | null>(null)
    const filesUploadFields = useFilesUpload(value, maxValuesCount, context);

    watch(filesUploadFields.initialItems, async (newValue) => {
      if (!newValue.length || !artworkUpload.value) {
        return;
      }

      await nextTick()
      artworkUpload.value.initFiles();
    });

    return {
      ...filesUploadFields,
      ...useBackendProductId(productId),
      artworkUpload,
      artworkUploadUrl: config.images.fileuploaderUploadUrl as string,
      isUploadNow
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/typography";

.image-upload-widget {
  ._error-message {
    color: var(--widget-error-message-color, var(--c-danger-variant));
    height: calc(var(--font-xs) * 1.2);
    margin-top: var(--spacer-xs);

    @include font(
      --widget-error-message-font,
      var(--font-medium),
      var(--font-xs),
      1.2,
      var(--font-family-secondary)
    );
  }
}
</style>
