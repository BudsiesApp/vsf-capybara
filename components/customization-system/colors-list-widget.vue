<template>
  <div class="colors-list-widget" :class="{ '-disabled': isDisabled }">
    <ul class="_options-list">
      <li
        v-for="option in values"
        :key="option.id"
        class="_option"
        :class="{
          '-round': isRound,
          '-selected': isSelected(option),
        }"
      >
        <div class="_color-wrapper">
          <div class="_color" :style="{ 'background-color': option.color }" />
        </div>

        <div class="_content-wrapper">
          <div class="_name">
            {{ option.name }}
          </div>

          <div class="_price" v-if="option.price && option.price > 0">
            <span>+</span>

            {{ option.price | currency("$", 0) }}
          </div>
        </div>

        <label class="_option-label">
          <input
            class="_input"
            :disabled="isDisabled"
            :type="inputType"
            :value="option.id"
            v-model="selectedOption"
          >
        </label>
      </li>
    </ul>

    <div class="_error-message">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRefs } from '@vue/composition-api';

import { OptionValue, useListWidget } from 'src/modules/customization-system';

export default defineComponent({
  name: 'ColorsListWidget',
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
  setup (props, context) {
    const { maxValuesCount, shape, value } = toRefs(props);

    const isRound = computed<boolean>(() => {
      return shape.value === 'round';
    });

    return {
      ...useListWidget(value, maxValuesCount, context),
      isRound
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "~@storefront-ui/shared/styles/helpers/typography";

// TODO: add variable
$color-selector-selected-border-color: #51a7f9;

.colors-list-widget {
  ._options-list {
    display: grid;
    justify-content: space-around;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    padding: 0;
  }

  ._option {
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    flex-grow: 0;
    display: block;
    padding: var(--spacer-sm);

    ._color-wrapper {
      position: relative;
      left: -4px;
      border: 4px solid transparent;
      width: 100%;
      height: 0;
      padding-top: 100%;
      overflow: hidden;
    }

    &.-selected {
      ._color-wrapper {
        border-color: $color-selector-selected-border-color;
      }
    }

    &.-round {
      ._color-wrapper {
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

  ._input {
    opacity: 0;
    height: 0;
    width: 0;
    position: absolute;
  }

  ._option-label {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }

  ._name,
  ._price {
    text-align: center;
    font-size: var(--font-sm);
  }

  ._name {
    font-weight: var(--font-semibold);
    margin-top: var(--spacer-xs);
  }

  ._price {
    margin-top: var(--spacer-2xs);
  }

  &.-disabled {
    opacity: 0.6;
    pointer-events: none;
  }

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

  @media (min-width: $tablet-min) {
    ._options-list {
      justify-content: flex-start;
      padding: 0;
    }
  }
}
</style>
