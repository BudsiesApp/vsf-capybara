<template>
  <div class="m-options-groups">
    <div class="_group-item" v-for="group in optionsGroups" :key="group">
      <div class="_group-title" v-if="group !== 'default'">
        {{ group }}
      </div>

      <ul class="_visual-selector">
        <a-body-part-value
          v-for="option in optionsByGroup[group]"
          :option="option"
          :input-type="inputType"
          :option-configurator-instance-id="optionConfiguratorInstanceId"
          :name="name"
          v-model="fSelectedOption"
          :disabled="disabled"
          :type="type"
          :key="option.id"
          @change="(value) => $emit('change', value)"
        />
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { BodypartOption, Dictionary } from 'src/modules/budsies';

import ABodyPartValue from '../atoms/a-body-part-value.vue';

export default Vue.extend({
  name: 'MOptionsGroups',
  components: {
    ABodyPartValue
  },
  props: {
    options: {
      type: Array as PropType<BodypartOption[]>,
      default: () => []
    },
    inputType: {
      type: String as PropType<'checkbox' | 'radio'>,
      required: true
    },
    optionConfiguratorInstanceId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    value: {
      type: [Array, Object] as PropType<BodypartOption | BodypartOption[]>,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'product'
    }
  },
  computed: {
    fSelectedOption: {
      get (): BodypartOption | BodypartOption[] {
        return this.value
      },
      set (value: BodypartOption | BodypartOption[]) {
        this.$emit('input', value);
      }
    },
    optionsGroups (): string[] {
      return Array.from(new Set(this.options.map((option) => option.group)));
    },
    optionsByGroup (): Dictionary<BodypartOption[]> {
      const optionsByGroup: Dictionary<BodypartOption[]> = Object.assign({}, ...Array.from(this.optionsGroups, (k) => ({ [`${k}`]: [] })));

      this.options.forEach((option) => {
        optionsByGroup[option.group].push(option);
      });

      return optionsByGroup;
    }
  }
})
</script>

<style scoped lang="scss">
.m-options-groups {
  ._group-item {
    margin-bottom: var(--spacer-sm);

    &:last-child {
      margin-bottom: 0;
    }
  }

  ._group-title {
    text-align: center;
    font-size: var(--font-sm);
    margin-bottom: var(--spacer-sm);
  }

  ._visual-selector {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding: 0;
    row-gap: 2vw;
  }
}
</style>
