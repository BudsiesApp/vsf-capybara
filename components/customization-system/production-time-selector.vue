<template>
  <sf-select
    class="production-time-selector sf-select--underlined"
    :error-message="error"
    :disabled="isDisabled"
    :should-lock-scroll-on-open="isMobile"
    :valid="isValid"
    v-model="selectedOption"
  >
    <sf-select-option
      v-for="option in productionTimeOptions"
      :key="option.id"
      :value="option.id"
    >
      {{ option.text }}
    </sf-select-option>
  </sf-select>
</template>

<script lang="ts">
import { SfSelect } from '@storefront-ui/vue';
import {
  computed,
  defineComponent,
  PropType,
  toRefs
} from '@vue/composition-api';
import {
  mapMobileObserver,
  unMapMobileObserver
} from '@storefront-ui/vue/src/utilities/mobile-observer';

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
    isRequired: {
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
    const { isRequired, values } = toRefs(props);
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
    const productionTimeOptions = computed<ProductionTimeOption[]>(() => {
      const options = getProductionTimeOptionsFromCustomization(
        props.productId,
        props.bundleOptionId,
        props.values,
        root.$store
      );

      options.unshift({
        id: '',
        text: props.placeholder,
        isDomestic: false,
        optionId: props.bundleOptionId
      });

      return options;
    });

    return {
      isValid,
      productionTimeOptions,
      selectedOption
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
.production-time-selector {
  width: 100%;
  max-width: 610px;

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
