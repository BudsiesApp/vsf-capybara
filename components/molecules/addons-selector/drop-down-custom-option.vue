<template>
  <div
    class="addons-selector-drop-down-custom-option"
  >
    <SfSelect
      class="_field sf-select--underlined"
      :class="{'-invalid': errors.length}"
      :selected="value"
      :label="option.title"
      :name="option.title"
      :error-message="errors[0]"
      :valid="!errors.length"
      :should-lock-scroll-on-open="isMobile"
      @change="onCustomOptionChange"
    >
      <SfSelectOption
        class="_option"
        v-for="optionValue in options"
        :key="optionValue.title"
        :value="optionValue.title.toLowerCase()"
      >
        {{ optionValue.title }}
      </SfSelectOption>
    </SfSelect>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from '@vue/composition-api';
import { SfSelect } from '@storefront-ui/vue';
import {
  mapMobileObserver,
  unMapMobileObserver
} from '@storefront-ui/vue/src/utilities/mobile-observer';

import { CustomOption, OptionValue } from 'core/modules/catalog/types/CustomOption';

export default defineComponent({
  name: 'AddonsSelectorDropDownCustomOption',
  components: {
    SfSelect
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    option: {
      type: Object as PropType<CustomOption>,
      required: true
    },
    addonOptionValueId: {
      type: Number,
      required: true
    },
    errors: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    ...mapMobileObserver(),
    options (): OptionValue[] {
      return this.option.values || [];
    }
  },
  beforeDestroy () {
    unMapMobileObserver();
  },
  methods: {
    onCustomOptionChange (value: string): void {
      this.$emit('input', {
        value: value.toLowerCase(),
        option: this.option,
        addonOptionValueId: this.addonOptionValueId
      });
    }
  }
})
</script>

<style lang="scss">
.addons-selector-drop-down-custom-option {
  ._field {
    --select-border-color: var(--c-white);
  }
}
</style>
