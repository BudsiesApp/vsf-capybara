<template>
  <sf-select
    class="dropdown-widget sf-select--underlined"
    :error-message="error"
    :disabled="isDisabled"
    :should-lock-scroll-on-open="isMobile"
    :valid="isValid"
    v-model="selectedOption"
  >
    <sf-select-option
      v-for="optionValue in sortedValues"
      :key="optionValue.id"
      :value="optionValue.id"
    >
      {{ optionValue.name }}
    </sf-select-option>
  </sf-select>
</template>

<script lang="ts">
import { SfSelect } from '@storefront-ui/vue';
import { computed, defineComponent, PropType, toRefs } from '@vue/composition-api';

import { mapMobileObserver, unMapMobileObserver } from '@storefront-ui/vue/src/utilities/mobile-observer';

import { OptionValue, useDefaultValue, useValuesSort } from 'src/modules/customization-system';

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
    value: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    values: {
      type: Array as PropType<OptionValue[]>,
      default: () => []
    }
  },
  setup (props, { emit }) {
    const { values } = toRefs(props);
    const selectedOption = computed<string | undefined>({
      get: () => {
        return props.value;
      },
      set: (newValue) => {
        emit('input', newValue);
      }
    });
    const isValid = computed<boolean>(() => {
      return !props.error
    });

    useDefaultValue(selectedOption, values);

    return {
      isValid,
      selectedOption,
      ...useValuesSort(values)
    }
  },
  computed: {
    ...mapMobileObserver()
  },
  beforeDestroy (): void {
    unMapMobileObserver();
  }
})
</script>

<style lang="scss" scoped>
.dropdown-widget {
  --select-padding: 0;
}
</style>
