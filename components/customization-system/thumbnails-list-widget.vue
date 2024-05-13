<template>
  <div
    class="thumbnails-list-widget"
    :class="{ '-disabled': isDisabled }"
  >
    <ul class="_options-list">
      <li
        v-for="option in values"
        :key="option.id"
        class="_option"
        :class="{
          '-round': isRound,
          '-is-selected': isSelected(option)
        }"
      >
        <label class="_option-label">
          <input
            class="_input"
            :disabled="isDisabled"
            :type="inputType"
            :value="option.id"
            v-model="selectedOption"
          >
        </label>

        <div class="_image-wrapper">
          <BaseImage
            class="_image"
            :src="option.previewUrl"
            :aspect-ratio="1"
          />
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
      </li>
    </ul>

    <div class="_error-message">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRefs } from '@vue/composition-api';

import { BaseImage } from 'src/modules/budsies';
import { OptionValue } from 'src/modules/customization-system';

export default defineComponent({
  name: 'ThumbnailsListWidget',
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
      default: () => ([])
    },
    shape: {
      // TODO: move to the separate type
      type: String as PropType<'round' | 'square'>,
      default: 'square'
    }
  },
  setup (props, { emit }) {
    const { maxValuesCount, shape, value } = toRefs(props);

    // TODO: move to separate composable
    const inputType = computed<'checkbox' | 'radio'>(() => {
      return maxValuesCount.value && maxValuesCount.value > 1 ? 'checkbox' : 'radio';
    });
    const selectedOption = computed<string | string[] | undefined>({
      get: () => {
        if (inputType.value === 'checkbox' && value.value === undefined) {
          return [];
        }

        if (inputType.value !== 'checkbox' && Array.isArray(value.value)) {
          return value.value[0];
        }

        return value.value;
      },
      set: (newValue) => {
        emit('input', newValue);
      }
    });

    const isRound = computed<boolean>(() => {
      return shape.value === 'round';
    });

    function isSelected (option: OptionValue): boolean {
      if (inputType.value === 'checkbox') {
        return Array.isArray(value.value) && value.value.includes(option.id);
      }

      return typeof value.value === 'string' && value.value === option.id;
    }

    return {
      inputType,
      isRound,
      isSelected,
      selectedOption
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/typography";

.thumbnails-list-widget {
  ._options-list {
    display: grid;
    justify-content: space-around;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    padding: 0;
  }

  ._option {
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    flex-grow: 0;
    display: block;
    padding: var(--spacer-sm);

    &.-selected {
      background: var(--c-primary);

      &.-round {
        background: transparent;

        ._image-wrapper {
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
            background: url('/assets/images/sprite/ico-tick-green.png') no-repeat center #fff;
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

  @include for-desktop {
    ._options-list {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }
  }
}
</style>
