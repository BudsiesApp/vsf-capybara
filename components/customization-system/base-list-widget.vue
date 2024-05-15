<template>
  <div class="base-list-widget" :class="{ '-disabled': isDisabled }">
    <ul class="_options-list" :class="{ '-flex': isFlexLayout }">
      <li
        v-for="option in values"
        :key="option.id"
        class="_option"
        :class="{
          '-round': isRound,
          '-selected': isSelected(option),
        }"
      >
        <slot
          name="image"
          :selected="isSelected(option)"
          :round="isRound"
          :option="option"
        />

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
import {
  computed,
  defineComponent,
  PropType,
  toRefs
} from '@vue/composition-api';

import { BaseImage } from 'src/modules/budsies';
import { OptionValue, useListWidget } from 'src/modules/customization-system';

export default defineComponent({
  name: 'BaseListWidget',
  components: {
    BaseImage
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
  setup (props, context) {
    const { layout, maxValuesCount, shape, value } = toRefs(props);

    const isRound = computed<boolean>(() => {
      return shape.value === 'round';
    });
    const isFlexLayout = computed<boolean>(() => {
      return layout.value === 'flex';
    });

    return {
      isFlexLayout,
      isRound,
      ...useListWidget(value, maxValuesCount, context)
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "~@storefront-ui/shared/styles/helpers/typography";

.base-list-widget {
  ._options-list {
    display: grid;
    grid-template-columns: repeat(
      auto-fill,
      minmax(var(--base-list-widget-item-max-width), 1fr)
    );
    padding: 0;

    &.-flex {
      display: flex;
      justify-content: center;

      ._option {
        width: var(--base-list-widget-item-width);
        max-width: var(--base-list-widget-item-max-width);
      }
    }
  }

  ._image-wrapper {
    position: relative;
    display: flex;
  }

  ._option {
    position: relative;
    flex-shrink: 0;
    flex-grow: 0;
    display: block;
    padding: var(--spacer-sm);
    box-sizing: border-box;

    &.-selected {
      background: var(--c-primary);

      &.-round {
        background: transparent;
      }
    }

    &.-round {
      padding: 0 var(--spacer-sm);
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
    cursor: pointer;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 2;
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
      padding: 0;
    }
  }

  @include for-desktop {
    ._options-list {
      grid-template-columns: repeat(
        auto-fill,
        minmax(var(--base-list-widget-item-max-width), 1fr)
      );

      &.-flex {
        ._option {
          width: var(--base-list-widget-item-max-width);
        }
      }
    }
  }
}
</style>
