<template>
  <div
    class="production-time-timeline-widget"
    :role="groupRole"
    :aria-labelledby="ariaLabelledby"
  >
    <p
      v-if="isHolidayPeriod"
      class="_location-selector"
      :class="{ '-single-option': sortedValues.length === 1 }"
    >
      {{ $t('Delivery location:') }}
      <strong>{{ isDomesticHolidayLocation ? $t('United States') : $t('International') }}</strong>
      <span>·</span>
      <button type="button" @click="toggleHolidayLocation">
        {{ isDomesticHolidayLocation ? $t("I'm outside the U.S.") : $t("I'm in the U.S.") }}
      </button>
    </p>

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
          v-if="sortedValues.length > 1"
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
import { useStore } from '@vue-storefront/core/application-services';
import {
  computed,
  defineComponent,
  PropType,
  toRefs,
  watch
} from 'vue';

import { RushAddon } from 'src/modules/budsies';
import {
  ListWidgetInputType,
  OptionValue,
  PRODUCTION_TIME_SELECTOR_STANDARD_OPTION_VALUE_ID,
  HolidayDeliveryLocation,
  useHolidayDeliveryLocation,
  useListWidget,
  useOptionValuesPrice
} from 'src/modules/customization-system';
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
  name: 'ProductionTimeTimelineWidget',
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
    isHolidayPeriod: {
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
    const applicationStore = useStore();
    const { maxValuesCount, radioGroupName, value, values } = toRefs(props);
    const { location: holidayLocation, setLocation } = useHolidayDeliveryLocation();
    const hasError = computed<boolean>(() => !!props.error);
    const listWidgetFields = useListWidget(value, maxValuesCount, context);
    const { optionValuePriceDictionary } = useOptionValuesPrice(values);

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
      return applicationStore.getters['budsies/getProductRushAddons'](props.productId);
    });

    const productionTimeOptionCardDataByOptionValueId = computed<Record<string, ProductionTimeOptionCardData>>(() => {
      const dictionary: Record<string, ProductionTimeOptionCardData> = {};
      const matchingAddons = props.isHolidayPeriod
        ? productRushAddons.value.filter((addon) => addon.isDomestic === (holidayLocation.value === HolidayDeliveryLocation.DOMESTIC))
        : productRushAddons.value;
      const standardAddon = matchingAddons.find((addon) => !addon.id);
      const addonBySku: Record<string, RushAddon> = {};

      for (const addon of matchingAddons) {
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
          isInTimeForChristmas: props.isHolidayPeriod && addon.isInTimeForChristmas,
          isHolidayPeriod: props.isHolidayPeriod,
          optionName: optionValue.name || addon.text,
          optionValueSku: optionValue.sku || '',
          price,
          slotsLeft: typeof addon.slotsLeft === 'number' ? addon.slotsLeft : Infinity,
          turnaroundTime: addon.turnaroundTime
        };
      }

      return dictionary;
    });

    const sortedValues = computed<OptionValue[]>(() => {
      const cardDataByOptionValueId = productionTimeOptionCardDataByOptionValueId.value;
      let locationValues = values.value;

      if (props.isHolidayPeriod) {
        locationValues = values.value.filter((optionValue) => !!cardDataByOptionValueId[optionValue.id]);
      }

      return [...locationValues].sort((a, b) => {
        const firstCardData = cardDataByOptionValueId[a.id];
        const secondCardData = cardDataByOptionValueId[b.id];
        const firstTurnaroundTime = firstCardData?.turnaroundTime;
        const secondTurnaroundTime = secondCardData?.turnaroundTime;

        if (firstTurnaroundTime !== undefined && secondTurnaroundTime !== undefined) {
          return secondTurnaroundTime - firstTurnaroundTime;
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
      let fastestAvailableOption: OptionValue | undefined;
      let fastestAvailableTurnaroundTime: number | undefined;

      for (const optionValue of values.value) {
        const cardData = cardDataByOptionValueId[optionValue.id];

        if (!cardData || cardData.slotsLeft === 0) {
          continue;
        }

        if (
          fastestAvailableTurnaroundTime === undefined ||
          cardData.turnaroundTime < fastestAvailableTurnaroundTime
        ) {
          fastestAvailableOption = optionValue;
          fastestAvailableTurnaroundTime = cardData.turnaroundTime;
        }
      }

      return fastestAvailableOption?.id;
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

    const isDomesticHolidayLocation = computed<boolean>(() => {
      return holidayLocation.value === HolidayDeliveryLocation.DOMESTIC;
    });

    function toggleHolidayLocation (): void {
      setLocation(
        isDomesticHolidayLocation.value
          ? HolidayDeliveryLocation.INTERNATIONAL
          : HolidayDeliveryLocation.DOMESTIC
      );
    }

    watch([sortedValues, value], ([visibleValues, selectedValue]) => {
      const selectedOptionValueId = typeof selectedValue === 'string' ? selectedValue : undefined;

      if (!props.isHolidayPeriod || !visibleValues.length || visibleValues.some(({ id }) => id === selectedOptionValueId)) {
        return;
      }

      const standardValue = visibleValues.find(({ id }) => id === PRODUCTION_TIME_SELECTOR_STANDARD_OPTION_VALUE_ID);
      if (standardValue) context.emit('input', standardValue.id);
    });

    const { ariaDescribedby, ariaInvalid, errorMessageId } = useErrorAccessibility(
      'production-time-timeline-widget',
      hasError
    );

    return {
      ariaDescribedby,
      ariaInvalid,
      errorMessageId,
      groupRole,
      isFastestAvailable,
      isOptionValueDisabled,
      isDomesticHolidayLocation,
      holidayLocation,
      onInputClick,
      productionTimeOptionCardDataByOptionValueId,
      radioInputName,
      sortedValues,
      toggleHolidayLocation,
      ...listWidgetFields
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.production-time-timeline-widget {
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

  ._location-selector {
    display: flex;
    gap: 0.35rem;
    align-items: baseline;
    justify-content: center;
    margin-bottom: var(--spacer-sm);
    color: var(--c-text-muted);
    font-size: var(--font-sm);

    strong {
      color: var(--c-text);
    }

    button {
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--c-primary);
      font: inherit;
      text-decoration: underline;
      cursor: pointer;
    }

    &.-single-option {
      margin-bottom: var(--spacer-base);
    }
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
