<template>
  <div
    class="m-bodypart-option-configurator"
    :class="{ '-disabled': disabled, '-compact': compactMode }"
  >
    <div class="_group-item" v-for="group in optionsGroups" :key="group">
      <div class="_group-title" v-if="group !== 'default'">
        {{ group }}
      </div>

      <ul class="_visual-selector">
        <a-body-part-value
          v-for="option in optionsByGroup[group]"
          :option="option"
          :input-type="inputType"
          :parent-component-instance-id="instanceId"
          :name="name"
          v-model="selectedOption"
          :disabled="disabled"
          :type="type"
          :key="option.id"
          @change="onChange"
        />
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { BodypartOption, Dictionary } from 'src/modules/budsies';

import ABodyPartValue from '../atoms/a-body-part-value.vue';

let instanceId = 0;

export default Vue.extend({
  name: 'MBodypartOptionConfigurator',
  components: {
    ABodyPartValue
  },
  props: {
    name: {
      type: String,
      required: true
    },
    value: {
      type: [Array, Object] as PropType<BodypartOption | BodypartOption[]>,
      default: undefined
    },
    maxValues: {
      type: Number,
      default: 1
    },
    type: {
      type: String,
      default: 'product'
    },
    options: {
      type: Array as PropType<BodypartOption[]>,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    compactMode: {
      type: Boolean,
      default: false
    }
  },
  data (): Record<string, any> {
    return {
      instanceId: ''
    };
  },
  computed: {
    selectedOption: {
      get (): BodypartOption | BodypartOption[] {
        if (this.inputType === 'checkbox' && this.value === undefined) {
          return [];
        }

        if (this.inputType !== 'checkbox' && Array.isArray(this.value)) {
          return this.value[0];
        }

        return this.value;
      },
      set (value: BodypartOption | BodypartOption[]): void {
        this.$emit('input', value);
      }
    },
    inputType (): 'checkbox' | 'radio' {
      return this.maxValues > 1 ? 'checkbox' : 'radio';
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
  },
  created: function (): void {
    this.instanceId = instanceId.toString();
    instanceId += 1;
  },
  methods: {
    onChange ({ event, option }: {event: Event, option: BodypartOption}): void {
      if (!Array.isArray(this.selectedOption)) {
        return;
      }

      const existingItem = this.selectedOption.find(item => item.value === option.value);
      if (existingItem) {
        return;
      }

      if (this.selectedOption.length < this.maxValues) {
        return;
      }

      event.preventDefault();
    }
  }
})
</script>

<style lang="scss" scoped>
.m-bodypart-option-configurator {
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

  &.-disabled {
    ._visual-selector {
      opacity: 0.7;

      > label {
       cursor: default;
      }
    }
  }

  &.-compact {
    ._visual-selector {
      row-gap: var(--spacer-sm);
    }
  }
}
</style>
