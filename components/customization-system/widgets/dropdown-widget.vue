<template>
  <sf-select
    class="dropdown-widget sf-select--underlined"
    :error-message="error"
    :disabled="isDisabled"
    :should-lock-scroll-on-open="isMobile"
    :valid="isValid"
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
} from '@vue/composition-api';

import {
  mapMobileObserver,
  unMapMobileObserver
} from '@storefront-ui/vue/src/utilities/mobile-observer';

import {
  OptionValue,
  useOptionValuesPrice,
  useValuesSort
} from 'src/modules/customization-system';
import { PriceHelper } from 'src/modules/shared';

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
    }
  },
  setup (props, context) {
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

    const { optionValuePriceDictionary } = useOptionValuesPrice(
      sortedValues,
      context
    );

    const dropdownOptions = computed<DropdownOption[]>(() => {
      const options: DropdownOption[] = [
        {
          id: '',
          label: placeholder.value || defaultPlaceholder
        }
      ];

      sortedValues.value.forEach((optionValue) => {
        const optionValuePrice = optionValuePriceDictionary.value[optionValue.id];
        const finalPrice = optionValuePrice ? PriceHelper.getFinalPrice(optionValuePrice) : null;
        let label = optionValue.name || '';

        if (finalPrice) {
          label += ` ${PriceHelper.formatPrice(finalPrice)}`;
        }

        options.push({
          id: optionValue.id,
          label
        });
      });

      return options;
    });

    const showSelect = ref<boolean>(true);
    watch(values, async () => {
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
  max-width: 610px;

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
