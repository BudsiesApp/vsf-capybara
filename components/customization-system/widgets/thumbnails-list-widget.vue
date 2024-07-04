<template>
  <base-list-widget
    class="thumbnails-list-widget"
    v-bind="$props"
    v-model="selectedOption"
  >
    <template #image="{ option, selected, round }">
      <div
        class="_image-wrapper"
        :class="{ '-selected': selected, '-round': round }"
      >
        <BaseImage
          class="_image"
          :src="option.thumbnailUrl"
          :aspect-ratio="1"
        />
      </div>
    </template>
  </base-list-widget>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from '@vue/composition-api';

import { BaseImage } from 'src/modules/budsies';
import {
  OptionValue,
  WidgetOptionAlignment,
  WidgetOptionShape
} from 'src/modules/customization-system';

import BaseListWidget from './base-list-widget.vue';

export default defineComponent({
  name: 'ThumbnailsListWidget',
  components: {
    BaseImage,
    BaseListWidget
  },
  props: {
    alignment: {
      type: String as PropType<WidgetOptionAlignment>,
      default: 'left'
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
    value: {
      type: [String, Array] as PropType<string | string[] | undefined>,
      default: undefined
    },
    values: {
      type: Array as PropType<OptionValue[]>,
      default: () => []
    },
    shape: {
      type: String as PropType<WidgetOptionShape>,
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
.thumbnails-list-widget {
  --base-list-widget-item-max-width: 145px;
  --base-list-widget-item-width: 33.33%;

  width: 100%;

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
          right: 8%;
          top: 0;
          z-index: 2;
        }
      }
    }
  }
}
</style>
