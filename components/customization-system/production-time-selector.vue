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
      :key="option"
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
    const productionTimeOptions = computed<ProductionTimeOption[]>(() => {
      return getProductionTimeOptionsFromCustomization(
        props.productId,
        props.bundleOptionId,
        props.values,
        root.$store
      );
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
