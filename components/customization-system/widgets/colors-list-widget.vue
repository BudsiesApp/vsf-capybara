<template>
  <base-list-widget
    class="colors-list-widget"
    v-bind="$props"
    v-model="selectedOption"
  >
    <template #image="{ option, selected, round }">
      <div
        class="_color-wrapper"
        :class="{ '-selected': selected, '-round': round }"
      >
        <div class="_color" :style="{ 'background-color': option.color }" />
      </div>
    </template>
  </base-list-widget>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from '@vue/composition-api';

import {
  OptionValue,
  WidgetOptionAlignment,
  WidgetOptionShape
} from 'src/modules/customization-system';

import BaseListWidget from './base-list-widget.vue';

export default defineComponent({
  name: 'ColorsListWidget',
  components: {
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
.colors-list-widget {
  --base-list-widget-item-max-width: 98px;
  --base-list-widget-item-width: 98px;
  --base-list-widget-selected-option-background: transparent;

  width: 100%;

  ._color-wrapper {
    position: relative;
    border: 4px solid transparent;
    width: 100%;
    height: 0;
    padding-top: calc(100% - 8px);
    box-sizing: border-box;

    &.-selected {
      border-color: var(--c-primary);
    }

    &.-round {
      border-radius: 50%;

      ._color {
        border-radius: 50%;
      }
    }
  }

  ._color {
    width: 100%;
    top: 0;
    height: 100%;
    position: absolute;
    border: 1px solid var(--c-gray-light);
    box-sizing: border-box;
  }
}
</style>
