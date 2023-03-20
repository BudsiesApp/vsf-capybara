<template>
  <div
    class="m-bodypart-option-configurator"
    :class="{ '-disabled': disabled }"
  >
    <m-options-groups
      :options="options"
      :input-type="inputType"
      :option-configurator-instance-id="instanceId"
      :name="name"
      v-model="selectedOption"
      :disabled="disabled"
      :type="type"
      @change="onChange"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { Bodypart, BodypartOption } from 'src/modules/budsies';

import MOptionsGroups from './m-options-groups.vue';

let instanceId = 0;

export default Vue.extend({
  name: 'MBodypartOptionConfigurator',
  components: {
    MOptionsGroups
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
    disabled: {
      type: Boolean,
      default: false
    },
    bodyPart: {
      type: Object as PropType<Bodypart>,
      required: true
    }
  },
  data (): Record<string, any> {
    return {
      instanceId: '',
      fShowDetailedBodyParts: false
    };
  },
  computed: {
    options (): BodypartOption[] {
      return this.$store.getters['budsies/getBodypartOptions'](this.bodyPart.id);
    },
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
    }
  },
  created: function (): void {
    this.instanceId = instanceId.toString();
    instanceId += 1;
  },
  methods: {
    onChange (event: Event, option: BodypartOption): void {
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
  &.-disabled {
    ::v-deep .a-body-part-vale {
      opacity: 0.7;

      > label {
       cursor: default;
      }
    }
  }
}
</style>
