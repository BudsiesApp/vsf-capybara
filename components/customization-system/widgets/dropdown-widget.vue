<template>
  <sf-select
    class="dropdown-widget sf-select--underlined"
    :error-message="error"
    :disabled="isDisabled"
    :should-lock-scroll-on-open="isMobile"
    :valid="isValid"
    :label-id="ariaLabelledby"
    v-model="selectedOption"
    v-if="showSelect"
  >
    <sf-select-option
      v-for="optionValue in dropdownOptions"
      :key="optionValue.id"
      :value="optionValue.id"
    >
      {{ optionValue.label }}
    </sf-select-option>
  </sf-select>
</template>

<script lang="ts">
import { SfSelect } from '@storefront-ui/vue';
import {
  computed,
  defineComponent,
  nextTick,
  PropType,
  ref,
  toRefs,
  watch
} from 'vue';

import {
  mapMobileObserver,
  unMapMobileObserver
} from '@storefront-ui/vue/src/utilities/mobile-observer';

import {
  OptionValue,
  PRODUCTION_TIME_SELECTOR_STANDARD_OPTION_VALUE_ID,
  useOptionValuesPrice,
  useValuesSort
} from 'src/modules/customization-system';
import { PriceHelper, useRootInstance } from 'src/modules/shared';
import { Currency, GET_ACTIVE_CURRENCY } from 'src/modules/currency';

const defaultPlaceholder = 'Select Option';

interface DropdownOption {
  id: string,
  label: string
}

export default defineComponent({
  name: 'DropdownWidget',
  components: {
    SfSelect
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
    placeholder: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    value: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    values: {
      type: Array as PropType<OptionValue[]>,
      default: () => []
    },
    ariaLabelledby: {
      type: String as PropType<string | undefined>,
      default: undefined
    }
  },
  setup (props, context) {
    const root = useRootInstance();
    const { placeholder, values } = toRefs(props);
    const selectedOption = computed<string | undefined>({
      get: () => {
        return props.value;
      },
      set: (newValue) => {
        context.emit('input', newValue);
      }
    });
    const isValid = computed<boolean>(() => {
      return !props.error;
    });

    const { sortedValues } = useValuesSort(values);

    const { defaultOptionValue, isOptionValuesSamePrice, optionValuePriceDictionary } = useOptionValuesPrice(
      sortedValues
    );

    const selectedCurrency = computed<Currency>(() => {
      return root.$store.getters[GET_ACTIVE_CURRENCY];
    });

    const isProductionTimeDefaultOption = computed<boolean>(() => {
      if (!defaultOptionValue.value) {
        return false;
      }

      return defaultOptionValue.value.id === PRODUCTION_TIME_SELECTOR_STANDARD_OPTION_VALUE_ID;
    });

    const dropdownOptions = computed<DropdownOption[]>(() => {
      const _optionValuePriceDictionary = optionValuePriceDictionary.value;
      const _isOptionValuesSamePrice = isOptionValuesSamePrice.value;
      const _isProductionTimeDefaultOption = isProductionTimeDefaultOption.value;

      const options: DropdownOption[] = [
        {
          id: '',
          label: placeholder.value || defaultPlaceholder
        }
      ];

      sortedValues.value.forEach((optionValue) => {
        const optionValuePrice = _optionValuePriceDictionary[optionValue.id];
        const finalPrice = optionValuePrice ? PriceHelper.getFinalPrice(optionValuePrice) : null;
        const canShowPrice = !_isOptionValuesSamePrice || sortedValues.value.length === 1;
        let label = optionValue.name || '';

        // TODO: quick fix to avoid breaking dropdown prices formatting and add support for production time customization relative prices
        if (_isProductionTimeDefaultOption) {
          label += `: +${PriceHelper.formatPrice(finalPrice, selectedCurrency.value.symbol)}`;
        } else if (canShowPrice && finalPrice) {
          label += ` ${PriceHelper.formatPrice(finalPrice, selectedCurrency.value.symbol)}`;
        }

        options.push({
          id: optionValue.id,
          label
        });
      });

      return options;
    });

    const showSelect = ref<boolean>(true);
    const sortedValuesIdsString = computed<string>(() => {
      var ids = '';

      for (const value of sortedValues.value) {
        ids += value.id
      }

      return ids;
    });

    watch([sortedValuesIdsString, selectedCurrency], async () => {
      showSelect.value = false;
      await nextTick();
      showSelect.value = true;
    });

    return {
      dropdownOptions,
      isValid,
      selectedOption,
      showSelect
    };
  },
  computed: {
    ...mapMobileObserver()
  },
  beforeDestroy (): void {
    unMapMobileObserver();
  }
});
</script>

<style lang="scss" scoped>
.dropdown-widget {
  width: 100%;
  max-width: var(--dropdown-widget-max-width, 610px);

  &.sf-select {
    --select-padding: 0;
    --select-selected-padding: var(
      --dropdown-select-padding,
      var(--spacer-xs) var(--spacer-lg) var(--spacer-xs) var(--spacer-2xs)
    );
    --select-height: var(
      --dropdown-select-height,
      auto
    );
  }
}
</style>
