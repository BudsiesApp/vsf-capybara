<template>
  <base-list-widget
    class="thumbnails-list-widget"
    :error="error"
    :is-disabled="isDisabled"
    :layout="layout"
    :max-values-count="maxValuesCount"
    :value="value"
    :values="values"
    :shape="shape"
    v-model="selectedOption"
  >
    <template #image="{ option, selected, round }">
      <div
        class="_image-wrapper"
        :class="{ '-selected': selected, '-round': round }"
      >
        <BaseImage class="_image" :src="option.previewUrl" :aspect-ratio="1" />
      </div>
    </template>
  </base-list-widget>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType
} from '@vue/composition-api';

import { BaseImage } from 'src/modules/budsies';
import { OptionValue } from 'src/modules/customization-system';

import BaseListWidget from './base-list-widget.vue';

export default defineComponent({
  name: 'ThumbnailsListWidget',
  components: {
    BaseImage,
    BaseListWidget
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
    layout: {
      // TODO: move to the separate type
      type: String as PropType<'flex' | 'grid'>,
      default: 'grid'
    },
    maxValuesCount: {
      type: Number as PropType<number | undefined>,
      default: undefined
    },
    value: {
      type: [String, Array] as PropType<string | string[] | undefined>,
      default: undefined
    },
    values: {
      type: Array as PropType<OptionValue[]>,
      default: () => []
    },
    shape: {
      // TODO: move to the separate type
      type: String as PropType<'round' | 'square'>,
      default: 'square'
    }
  },
  setup (props, { emit }) {
    const selectedOption = computed<string | string[] | undefined>({
      get: () => {
        return props.value;
      },
      set: (value) => {
        emit('input', value);
      }
    });

    return {
      selectedOption
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "~@storefront-ui/shared/styles/helpers/typography";

.thumbnails-list-widget {
  --base-list-widget-item-absolute-width: 145px;
  --base-list-widget-item-relative-width: 33.33%;

  ._image-wrapper {
    position: relative;
    display: flex;

    &.-round {
      &.-selected {
        &::before {
          background: rgba(52, 184, 147, 0.7);
          border-radius: 100%;
          content: "";
          height: 100%;
          left: 0;
          position: absolute;
          top: 0;
          width: 100%;
          z-index: 1;
        }

        &::after {
          background: url("/assets/images/sprite/ico-tick-green.png") no-repeat
            center #fff;
          border: 2px solid #38b677;
          border-radius: 100%;
          content: "";
          position: absolute;
          height: 24px;
          width: 24px;
          right: 0;
          top: 0;
          z-index: 2;
        }
      }
    }
  }
}
</style>
