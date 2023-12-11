<template>
  <div class="addons-selector-field-custom-option">
    <SfInput
      class="_field"
      v-model="optionValue"
      :label="option.title"
      :name="option.title"
      :error-message="errors[0]"
      :valid="!errors.length"
      :maxlength="maxLength"
    />

    <div
      class="_characters-count"
      :class="{'-limit-reached': isLengthLimitReached}"
    >
      {{ charactersCount }}
    </div>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from '@vue/composition-api';
import { SfInput } from '@storefront-ui/vue';

import { CustomOption } from 'core/modules/catalog/types/CustomOption';

export default defineComponent({
  name: 'AddonsSelectorFieldCustomOption',
  components: {
    SfInput
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
    charactersCount (): string {
      return `${this.value.length}/${this.option.max_characters}`;
    },
    isLengthLimitReached (): boolean {
      return this.value.length >= this.option.max_characters;
    },
    maxLength (): number {
      return this.option.max_characters;
    },
    optionValue: {
      get (): string {
        return this.value;
      },
      set (value: string) {
        if (value.length > this.option.max_characters) {
          return;
        }

        this.$emit('input', {
          value,
          option: this.option,
          addonOptionValueId: this.addonOptionValueId
        });
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.addons-selector-field-custom-option {
  ._characters-count {
    font-size: var(--font-sm);
    margin-top: var(--spacer-2xs);

    &.-limit-reached {
      font-weight: 400;
    }
  }

  ._field {
    --input-border-color: var(--c-white);

    ::v-deep {
      input {
        position: relative;
        opacity: 1;
        left: 0;
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
