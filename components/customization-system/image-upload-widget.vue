<template>
  <div class="image-upload-widget">
    <m-artwork-upload
      :disabled="isDisabled"
      :product-id="backendProductId"
      :upload-url="artworkUploadUrl"
      :allow-multiple="allowMultiple"
      :initial-items="initialItems"
      :max-files="maxFiles"
    />

    <div class="_error-message">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
import config from 'config';
import { computed, defineComponent, inject, PropType, toRefs } from '@vue/composition-api'

import Product from '@vue-storefront/core/modules/catalog/types/Product'
import { OptionValue } from 'src/modules/customization-system'
import { ImageHandlerService } from 'src/modules/file-storage';
import { CustomerImage } from 'src/modules/shared';
import { useBackendProductId } from 'theme/helpers/use-backend-product-id'

import MArtworkUpload from '../molecules/m-artwork-upload.vue'

function getCustomerImageByStorageItemId (
  storageItemId: string,
  imageHandlerService: ImageHandlerService
): CustomerImage {
  return {
    id: storageItemId,
    url: imageHandlerService.getOriginalImageUrl(storageItemId)
  };
}

function getInitialItems (value: string | string[] | undefined, imageHandlerService: ImageHandlerService): CustomerImage[] {
  if (!value) {
    return [];
  }

  if (typeof value === 'string') {
    return [getCustomerImageByStorageItemId(value, imageHandlerService)]
  }

  return value.map((item) => getCustomerImageByStorageItemId(item, imageHandlerService));
}

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
    product: {
      type: Object as PropType<Product>,
      required: true
    },
    value: {
      type: [String, Array] as PropType<string | string[] | undefined>,
      default: undefined
    },
    values: {
      type: Array as PropType<OptionValue[]>,
      default: () => ([])
    }
  },
  setup (props) {
    const { maxValuesCount, product } = toRefs(props);
    const imageHandlerService = inject<ImageHandlerService>('ImageHandlerService');

    if (!imageHandlerService) {
      throw new Error('ImageHandlerService is not defined');
    }

    const initialItems: CustomerImage[] = getInitialItems(props.value, imageHandlerService);
    const allowMultiple = computed<boolean>(() => {
      return !maxValuesCount.value || maxValuesCount.value > 1;
    });
    const maxFiles = computed<number | null>(() => {
      return maxValuesCount.value === undefined ? null : maxValuesCount.value;
    });

    return {
      ...useBackendProductId(product),
      allowMultiple,
      artworkUploadUrl: config.images.fileuploaderUploadUrl as string,
      initialItems,
      maxFiles
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/typography";

.image-upload-widget {
  ._error-message {
    color: var(--input-error-message-color, var(--c-danger));
    height: calc(var(--font-xs) * 1.2);
    margin-top: var(--spacer-xs);

    @include font(
      --input-error-message-font,
      var(--font-medium),
      var(--font-xs),
      1.2,
      var(--font-family-secondary)
    );
  }
}
</style>
