<template>
  <sf-select
    class="production-time-selector sf-select--underlined"
    :error-message="error"
    :disabled="isDisabled"
    :should-lock-scroll-on-open="isMobile"
    :valid="isValid"
    v-model="selectedOption"
    v-if="showSelect"
  >
    <sf-select-option
      v-for="option in productionTimeOptions"
      :key="option.id"
      :value="option.id"
    >
      <!-- There should be no white-spaces/newlines between the tag and the text because of the `white-space: pre-line` style applied -->
      <span class="_option-text">{{ option.text }}</span>
    </sf-select-option>
  </sf-select>
</template>

<script lang="ts">
import { SfSelect } from '@storefront-ui/vue';
import {
  computed,
  defineComponent,
  PropType,
  ref,
  watch,
  nextTick
} from '@vue/composition-api';
import {
  mapMobileObserver,
  unMapMobileObserver
} from '@storefront-ui/vue/src/utilities/mobile-observer';

import { Currency, GET_CURRENCY_EXCHANGE_RATE, GET_SELECTED_CURRENCY } from 'src/modules/currency';
import { OptionValue } from 'src/modules/customization-system';

import { getProductionTimeOptionsFromCustomization } from '../../helpers/get-production-time-options-from-customization.function';
import ProductionTimeOption from '../interfaces/production-time-option.interface';

export default defineComponent({
  name: 'ProductionTimeSelector',
  components: {
    SfSelect
  },
  props: {
    bundleOptionId: {
      type: Number,
      required: true
    },
    error: {
      type: String,
      default: undefined
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: 'Select Production Time'
    },
    productId: {
      type: Number,
      required: true
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
  setup (props, { emit, root }) {
    const selectedOption = computed<string | undefined>({
      get: () => {
        return props.value;
      },
      set: (newValue) => {
        emit('input', newValue);
      }
    });
    const isValid = computed<boolean>(() => {
      return !props.error;
    });
    const selectedCurrency = computed<Currency>(() => {
      return root.$store.getters[GET_SELECTED_CURRENCY]
    });

    const productionTimeOptions = computed<ProductionTimeOption[]>(() => {
      const rushUpgrades = root.$store.getters['budsies/getProductRushAddons'](props.productId);
      const currencyExchangeRate = root.$store.getters[GET_CURRENCY_EXCHANGE_RATE];
      const _selectedCurrency = selectedCurrency.value;

      const options = getProductionTimeOptionsFromCustomization(
        props.bundleOptionId,
        props.values,
        rushUpgrades,
        currencyExchangeRate,
        _selectedCurrency
      );

      options.unshift({
        id: '',
        text: props.placeholder,
        isDomestic: false,
        optionId: props.bundleOptionId
      });

      return options;
    });

    const showSelect = ref<boolean>(true);
    watch(selectedCurrency, async () => {
      showSelect.value = false;
      await nextTick();
      showSelect.value = true;
    });

    return {
      isValid,
      productionTimeOptions,
      showSelect,
      selectedOption
    };
  },
  computed: {
    ...mapMobileObserver()
  },
  methods: {
    getOptionText (option: ProductionTimeOption): string {
      return option.text.replace(/\n/g, '<br/>');
    }
  },
  beforeDestroy (): void {
    unMapMobileObserver();
  }
});
</script>

<style lang="scss" scoped>
.production-time-selector {
  width: 100%;
  max-width: 610px;

  ._option-text {
    white-space: pre-line;
  }

  &.sf-select {
    --select-padding: 0;
    --select-selected-padding: var(
      --dropdown-select-padding,
      var(--spacer-xs) var(--spacer-lg) var(--spacer-xs) var(--spacer-2xs)
    );
    --select-height: var(--dropdown-select-height, auto);

    ::v-deep .sf-select__selected {
      --select-option-font-size: var(
        --production-time-selector-option-font-size,
        var(--font-lg)
      );

      justify-content: center;
    }
  }
}
</style>
