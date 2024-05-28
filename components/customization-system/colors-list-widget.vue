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
  WidgetConfigLayout,
  WidgetConfigShape
} from 'src/modules/customization-system';

import BaseListWidget from './base-list-widget.vue';

export default defineComponent({
  name: 'ColorsListWidget',
  components: {
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
      type: String as PropType<WidgetConfigLayout>,
      default: 'grid'
    },
    maxValuesCount: {
      type: Number as PropType<number | undefined>,
      default: undefined
    },
    shape: {
      type: String as PropType<WidgetConfigShape>,
      default: 'square'
    },
    value: {
      type: [String, Array] as PropType<string | string[] | undefined>,
      default: undefined
    },
    values: {
      type: Array as PropType<OptionValue[]>,
      default: () => []
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

.colors-list-widget {
  --base-list-widget-item-absolute-width: 90px;
  --base-list-widget-item-relative-width: 25.01%;
  --base-list-widget-selected-option-background: transparent;

  width: 100%;

  ._color-wrapper {
    position: relative;
    left: -4px;
    border: 4px solid transparent;
    width: 100%;
    height: 0;
    padding-top: 100%;
    overflow: hidden;

    &.-selected {
      border-color: var(--c-primary);
    }

    &.-round {
      border-radius: 50%;
    }
  }

  ._color {
    width: 100%;
    padding-top: 100%;
    top: 0;
    position: absolute;
  }
}
</style>
