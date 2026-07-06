<template>
  <div
    class="timeline-list-widget"
    :role="groupRole"
    :aria-labelledby="ariaLabelledby"
  >
    <ul class="_options-list">
      <li
        v-for="optionValue in sortedValues"
        :key="optionValue.id"
        class="_option"
        :class="{
          '-selected': isSelected(optionValue),
          '-disabled': isOptionValueDisabled(optionValue)
        }"
      >
        <span
          class="_timeline"
          :class="{
            '-selected': isSelected(optionValue),
            '-disabled': isOptionValueDisabled(optionValue)
          }"
          aria-hidden="true"
        >
          <span class="_timeline-mark" />
        </span>

        <label class="_label">
          <input
            class="_input"
            :type="inputType"
            :name="radioInputName"
            :value="optionValue.id"
            :aria-describedby="ariaDescribedby"
            :aria-invalid="ariaInvalid"
            :disabled="isOptionValueDisabled(optionValue)"
            @click="onInputClick(optionValue)"
            v-model="selectedOption"
          >

          <production-time-option-card
            v-if="productionTimeOptionCardDataByOptionValueId[optionValue.id]"
            class="_card"
            :is-disabled="isOptionValueDisabled(optionValue)"
            :is-fastest-available="isFastestAvailable(optionValue)"
            :is-selected="isSelected(optionValue)"
            v-bind="productionTimeOptionCardDataByOptionValueId[optionValue.id]"
          />
        </label>
      </li>
    </ul>

    <div
      :id="errorMessageId"
      class="_error-message"
      aria-live="polite"
    >
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

import { RushAddon } from 'src/modules/budsies';
import {
  ListWidgetInputType,
  OptionValue,
  useListWidget,
  useOptionValuesPrice
} from 'src/modules/customization-system';
import { PRODUCTION_TIME_SELECTOR_STANDARD_OPTION_VALUE_ID } from 'src/modules/customization-system/types/production-time-selector-standard-option-value-id';
import { useErrorAccessibility } from 'theme/helpers/use-error-accessibility';

import ProductionTimeOptionCard from '../production-time-option-card.vue';
import { ProductionTimeOptionCardData } from '../types/production-time-option-card-data.interface';

function getRushAddonForOptionValue (
  optionValue: OptionValue,
  standardAddon: RushAddon | undefined,
  addonBySku: Record<string, RushAddon>
): RushAddon | undefined {
  if (optionValue.id === PRODUCTION_TIME_SELECTOR_STANDARD_OPTION_VALUE_ID) {
    return standardAddon;
  }

  if (!optionValue.sku) {
    return;
  }

  return addonBySku[optionValue.sku];
}

export default defineComponent({
  name: 'TimelineListWidget',
  components: {
    ProductionTimeOptionCard
  },
  props: {
    ariaLabelledby: {
      type: String as PropType<string | undefined>,
      default: undefined
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
    productId: {
      type: Number,
      required: true
    },
    radioGroupName: {
      type: String as PropType<string | undefined>,
      default: undefined
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
  setup (props, context) {
    const { maxValuesCount, radioGroupName, value, values } = toRefs(props);
    const hasError = computed<boolean>(() => !!props.error);
    const listWidgetFields = useListWidget(value, maxValuesCount, context);
    const { optionValuePriceDictionary } = useOptionValuesPrice(values, context);

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

    const productRushAddons = computed<RushAddon[]>(() => {
      return context.root.$store.getters['budsies/getProductRushAddons'](props.productId);
    });

    const productionTimeOptionCardDataByOptionValueId = computed<Record<string, ProductionTimeOptionCardData>>(() => {
      const dictionary: Record<string, ProductionTimeOptionCardData> = {};
      const standardAddon = productRushAddons.value.find((addon) => !addon.id);
      const addonBySku: Record<string, RushAddon> = {};

      for (const addon of productRushAddons.value) {
        if (addon.id) {
          addonBySku[addon.id] = addon;
        }
      }

      for (const optionValue of values.value) {
        const addon = getRushAddonForOptionValue(
          optionValue,
          standardAddon,
          addonBySku
        );
        const price = optionValuePriceDictionary.value[optionValue.id];

        if (!addon || !price) {
          continue;
        }

        dictionary[optionValue.id] = {
          optionName: optionValue.name || addon.text,
          price,
          slotsLeft: typeof addon.slotsLeft === 'number' ? addon.slotsLeft : Infinity,
          turnaroundTime: addon.turnaroundTime
        };
      }

      return dictionary;
    });

    const sortedValues = computed<OptionValue[]>(() => {
      const cardDataByOptionValueId = productionTimeOptionCardDataByOptionValueId.value;

      return [...values.value].sort((a, b) => {
        const firstCardData = cardDataByOptionValueId[a.id];
        const secondCardData = cardDataByOptionValueId[b.id];
        const firstTurnaroundTime = firstCardData && firstCardData.turnaroundTime;
        const secondTurnaroundTime = secondCardData && secondCardData.turnaroundTime;

        if (firstTurnaroundTime !== undefined && secondTurnaroundTime !== undefined) {
          return firstTurnaroundTime - secondTurnaroundTime;
        }

        if (firstTurnaroundTime !== undefined) {
          return -1;
        }

        if (secondTurnaroundTime !== undefined) {
          return 1;
        }

        if (a.sn !== b.sn) {
          return a.sn - b.sn;
        }

        return a.id.localeCompare(b.id);
      });
    });

    const fastestAvailableOptionValueId = computed<string | undefined>(() => {
      if (props.isDisabled) {
        return;
      }

      const cardDataByOptionValueId = productionTimeOptionCardDataByOptionValueId.value;
      const optionValue = sortedValues.value.find((value) => {
        const cardData = cardDataByOptionValueId[value.id];

        return !!cardData && cardData.slotsLeft !== 0;
      });

      return optionValue && optionValue.id;
    });

    function isOptionValueSoldOut (optionValue: OptionValue): boolean {
      const cardData = productionTimeOptionCardDataByOptionValueId.value[optionValue.id];

      return !!cardData && cardData.slotsLeft === 0;
    }

    function isOptionValueDisabled (optionValue: OptionValue): boolean {
      return props.isDisabled || isOptionValueSoldOut(optionValue);
    }

    function isFastestAvailable (optionValue: OptionValue): boolean {
      return optionValue.id === fastestAvailableOptionValueId.value;
    }

    function onInputClick (optionValue: OptionValue): void {
      if (listWidgetFields.inputType.value !== ListWidgetInputType.RADIO) {
        return;
      }

      if (!listWidgetFields.isSelected(optionValue)) {
        return;
      }

      context.emit('input', undefined);
    }

    const { ariaDescribedby, ariaInvalid, errorMessageId } = useErrorAccessibility(
      'timeline-list-widget',
      hasError
    );

    return {
      ariaDescribedby,
      ariaInvalid,
      errorMessageId,
      groupRole,
      isFastestAvailable,
      isOptionValueDisabled,
      onInputClick,
      productionTimeOptionCardDataByOptionValueId,
      radioInputName,
      sortedValues,
      ...listWidgetFields
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.timeline-list-widget {
  $timeline-mark-size: 14px;
  $timeline-mark-border-width: 3px;
  $timeline-line-width: 2px;
  $timeline-color-incomplete: var(--c-divider);
  $timeline-color-selected: var(--c-primary);
  $desktop-option-max-width: 15rem;

  width: 100%;

  ._options-list {
    display: grid;
    grid-template-columns: 1fr;
    row-gap: var(--spacer-sm);
    padding: 0;
    margin: 0;
    list-style: none;
  }

  ._option {
    position: relative;
    width: 100%;
    display: grid;
    grid-template-columns: $timeline-mark-size 1fr;
    column-gap: var(--spacer-sm);

    &.-disabled {
      ._label {
        cursor: default;
      }
    }

    &:has(._input:focus-visible) {
      outline: var(--c-black) auto 1px;
      outline: -webkit-focus-ring-color auto 1px;
      outline: AccentColor auto 1px;
      outline-offset: 2px;
    }
  }

  ._timeline {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100%;

    &::before,
    &::after {
      content: "";
      position: absolute;
      left: calc(#{$timeline-mark-size} / 2 - #{$timeline-line-width} / 2);
      width: $timeline-line-width;
      background: $timeline-color-incomplete;
    }

    &::before {
      top: 0;
      bottom: calc(50% + #{$timeline-mark-size} / 2);
    }

    &::after {
      top: calc(50% + #{$timeline-mark-size} / 2);
      bottom: calc(0px - var(--spacer-sm));
    }

    &.-selected {
      ._timeline-mark {
        border-color: $timeline-color-selected;
        background: $timeline-color-selected;
      }
    }

    &.-disabled {
      opacity: 0.65;
    }
  }

  ._option:first-child {
    ._timeline::before {
      display: none;
    }
  }

  ._option:last-child {
    ._timeline::after {
      display: none;
    }
  }

  ._timeline-mark {
    position: relative;
    z-index: 1;
    width: $timeline-mark-size;
    height: $timeline-mark-size;
    border: $timeline-mark-border-width solid $timeline-color-incomplete;
    border-radius: 50%;
    box-sizing: border-box;
    background: var(--c-white);
  }

  ._label {
    display: block;
    cursor: pointer;
  }

  ._input {
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0;
    cursor: pointer;

    &:disabled {
      cursor: default;

      + ._card {
        opacity: 0.6;
      }
    }
  }

  ._card {
    pointer-events: none;
  }

  ._error-message {
    margin-top: var(--spacer-xs);
    color: var(--c-danger);
    font-size: var(--font-xs);
  }

  @include for-desktop {
    ._options-list {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--spacer-sm);
      margin: 0 auto;
    }

    ._option {
      display: flex;
      flex: 1;
      flex-direction: column;
      max-width: $desktop-option-max-width;
    }

    ._label {
      display: flex;
      justify-content: center;
    }

    ._timeline {
      align-items: center;
      min-height: auto;
      margin-bottom: var(--spacer-sm);

      &::before,
      &::after {
        top: calc(#{$timeline-mark-size} / 2 - #{$timeline-line-width} / 2);
        bottom: auto;
        width: calc(50% + var(--spacer-sm));
        height: $timeline-line-width;
      }

      &::before {
        right: 50%;
        left: auto;
      }

      &::after {
        right: auto;
        left: 50%;
      }
    }
  }
}
</style>
