<template>
  <div class="base-list-widget" :class="{ '-disabled': isDisabled }">
    <ul
      :aria-labelledby="ariaLabelledby"
      :role="groupRole"
      class="_options-list"
      :class="{ [`-alignment-${alignment}`]: true, '-round': isRound }"
    >
      <li
        v-for="option in sortedValues"
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
          <label class="_name" :for="getOptionId(option.id)">
            {{ option.name }}
          </label>

          <template v-if="!isOptionValuesSamePrice">
            <div
              class="_price"
              v-if="isDefaultOptionValue(option) && defaultOptionValueFinalPrice"
            >
              {{ formatPrice(defaultOptionValueFinalPrice) }}
            </div>

            <div
              class="_price"
              v-else-if="optionValueFinalPriceDeltaDictionary[option.id]"
            >
              <span v-if="optionValueFinalPriceDeltaDictionary[option.id] > 0">+</span>

              {{ formatPrice(optionValueFinalPriceDeltaDictionary[option.id]) }}
            </div>
          </template>
        </div>

        <input
          class="_input"
          :disabled="isDisabled"
          :type="inputType"
          :name="radioInputName"
          :value="option.id"
          :id="getOptionId(option.id)"
          v-model="selectedOption"
        >
      </li>
    </ul>

    <div class="_error-message" aria-live="polite">
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
import { SfPrice } from '@storefront-ui/vue';

import { BaseImage } from 'src/modules/budsies';
import {
  ListWidgetInputType,
  OptionValue,
  useListWidget,
  useOptionValuesPrice,
  useValuesSort,
  WidgetOptionAlignment,
  WidgetOptionShape
} from 'src/modules/customization-system';

export default defineComponent({
  name: 'BaseListWidget',
  components: {
    BaseImage,
    SfPrice
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
    ariaLabelledby: {
      type: String as PropType<string | undefined>,
      default: undefined
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
    radioGroupName: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    shape: {
      type: String as PropType<WidgetOptionShape>,
      default: 'square'
    }
  },
  setup (props, context) {
    const { maxValuesCount, radioGroupName, shape, value, values } = toRefs(props);

    const isRound = computed<boolean>(() => {
      return shape.value === 'round';
    });

    const listWidgetFields = useListWidget(value, maxValuesCount, context);

    const groupRole = computed<string>(() => {
      return listWidgetFields.inputType.value === ListWidgetInputType.RADIO
        ? 'radiogroup'
        : 'group';
    });

    const radioInputName = computed<string | undefined>(() => {
      return listWidgetFields.inputType.value === ListWidgetInputType.RADIO
        ? radioGroupName.value
        : undefined;
    });

    function getOptionId (optionId: string): string {
      return `base-list-widget-option-${optionId}`;
    }

    return {
      groupRole,
      isRound,
      radioInputName,
      getOptionId,
      ...listWidgetFields,
      ...useOptionValuesPrice(values, context, true),
      ...useValuesSort(values)
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "~@storefront-ui/shared/styles/helpers/typography";

.base-list-widget {
  width: 100%;

  ._options-list {
    display: flex;
    flex-wrap: wrap;
    padding: 0;

    &.-round {
      row-gap: var(--spacer-xs);
    }

    ._option {
      width: var(--base-list-widget-item-width);
      max-width: var(--base-list-widget-item-max-width);
      min-width: var(--base-list-widget-item-min-width);
    }

    &.-alignment-center {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
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
    padding: var(--spacer-xs);
    box-sizing: border-box;

    &.-selected {
      background: var(
        --base-list-widget-selected-option-background,
        var(--c-primary)
      );

      &.-round {
        background: transparent;
      }
    }

    &.-round {
      padding: 0 var(--spacer-sm);
    }

    &:has(._input:focus-visible) {
      outline: var(--c-black) auto 1px;
      outline: -webkit-focus-ring-color auto 1px;
      outline: AccentColor auto 1px;
      outline-offset: 1px;
    }
  }

  ._input {
    opacity: 0;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    margin: 0;
    z-index: 1;
    cursor: pointer;
    position: absolute;
  }

  ._name,
  ._price {
    text-align: center;
    font-size: var(--font-sm);
  }

  ._name {
    font-weight: var(--font-semibold);
    margin-top: var(--spacer-xs);
    display: var(--base-list-widget-name-display, block);
  }

  ._price {
    --price-regular-font-size: var(--font-sm);
    --price-special-font-size: var(--font-sm);
    --price-old-font-size: var(--font-sm);

    --price-regular-font-weight: var(--font-normal);
    --price-special-font-weight: var(--font-normal);

    margin-top: var(--spacer-2xs);
  }

  .sf-price {
    display: inline-flex;
  }

  &.-disabled {
    opacity: 0.6;
    pointer-events: none;
  }

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

  @media (min-width: $tablet-min) {
    ._options-list {
      padding: 0;
    }
  }

  @include for-desktop {
    ._option {
      padding: var(--spacer-sm);
    }
  }
}
</style>
