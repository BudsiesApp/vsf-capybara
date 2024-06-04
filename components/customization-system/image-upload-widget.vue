<template>
  <div class="image-upload-widget">
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
      @is-busy-changed="$emit('widget-busy-changed', $event)"
    />

    <div class="_error-message">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
import config from 'config';
import { defineComponent, nextTick, PropType, ref, toRefs, watch } from '@vue/composition-api';

import { FileUploadValue, useFilesUpload } from 'src/modules/customization-system';

import { useBackendProductId } from 'theme/helpers/use-backend-product-id';

import MArtworkUpload from '../molecules/m-artwork-upload.vue';

export default defineComponent({
  components: {
    MArtworkUpload
  },
  props: {
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
      type: [Object, Array] as PropType<FileUploadValue | FileUploadValue[] | undefined>,
      default: undefined
    }
  },
  setup (props, context) {
    const { maxValuesCount, productId, value } = toRefs(props);

    const artworkUpload = ref<InstanceType<typeof MArtworkUpload> | null>(null)
    const filesUploadFields = useFilesUpload(value, maxValuesCount, context);

    watch(filesUploadFields.initialItems, async (newValue) => {
      // TODO: temporary - current TS version don't handle `value` type right in this case
      if (!newValue.length || !(artworkUpload as any).value) {
        return;
      }

      await nextTick();
      // TODO: temporary - current TS version don't handle `value` type right in this case
      (artworkUpload as any).value.initFiles();
    });

    return {
      ...filesUploadFields,
      ...useBackendProductId(productId),
      artworkUpload,
      artworkUploadUrl: config.images.fileuploaderUploadUrl as string
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/typography";

.image-upload-widget {
  width: 100%;
  max-width: 610px;

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
