<template>
  <base-list-widget
    class="thumbnails-list-widget"
    :class="{'-round': isRound}"
    v-bind="$props"
    v-model="selectedOption"
  >
    <template #image="{ option, selected, round }">
      <div
        class="_image-wrapper"
        :class="{ '-selected': selected, '-round': round }"
      >
        <base-image
          class="_image"
          :src="getItemImage(option)"
          :aspect-ratio="1"
          v-if="getItemImage(option)"
        />
      </div>
    </template>
  </base-list-widget>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from '@vue/composition-api';
import { getThumbnailPath } from '@vue-storefront/core/helpers';

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

    const isRound = computed<boolean>(() => {
      return props.shape === 'round';
    });

    function getItemImage (optionValue: OptionValue): string | undefined {
      if (!optionValue.thumbnailUrl) {
        return;
      }
      return getThumbnailPath(optionValue.thumbnailUrl, 210, 210, '');
    }

    return {
      isRound,
      selectedOption,
      getItemImage
    };
  }
});
</script>

<style lang="scss" scoped>
.thumbnails-list-widget {
  --base-list-widget-item-width: var(--thumbnails-list-widget-item-width, 33.33%);
  --base-list-widget-item-max-width: var(--thumbnails-list-widget-item-max-width, 130px);
  --base-list-widget-item-min-width: var(--thumbnails-list-widget-item-min-width, 65px);
  --base-list-widget-name-display: var(--thumbnails-list-widget-name-display, block);

  width: 100%;

  &.-round {
    --base-list-widget-item-min-width: var(--thumbnails-list-widget-round-item-min-width, --thumbnails-list-widget-item-min-width);
    --base-list-widget-name-display: block;
  }

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
