<template>
  <div
    class="m-bodypart-option-configurator"
    :class="{ '-disabled': disabled }"
  >
    <m-checkbox
      v-if="canBeDetailed"
      class="_detailing-checkbox"
      v-model="showDetailedBodyParts"
      :label="detailingFlagText"
      :disabled="disabled"
    />

    <slot name="heading" />

    <slot name="top-helper-text" />

    <div v-if="showDetailedBodyParts" class="_detailed-body-parts-container">
      <m-bodypart-option-configurator
        v-for="childBodyPart in childrenBodyParts"
        class="_detailed-body-part"
        :key="childBodyPart.id"
        :name="childBodyPart.code"
        v-model="selectedOption"
        :max-values="childBodyPart.maxValues"
        :body-part="childBodyPart"
        :type="type"
        :disabled="disabled"
      >
        <template #heading>
          <SfHeading
            class="-required "
            :level="3"
            :title="childBodyPart.name"
          />
        </template>
      </m-bodypart-option-configurator>
    </div>

    <div class="_options-groups-container" v-else>
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

    <slot name="bottom-helper-text" />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { SfHeading } from '@storefront-ui/vue';

import { Bodypart, BodypartOption } from 'src/modules/budsies';

import MOptionsGroups from './m-options-groups.vue';
import MCheckbox from './m-checkbox.vue';

let instanceId = 0;

export default Vue.extend({
  name: 'MBodypartOptionConfigurator',
  components: {
    MCheckbox,
    MOptionsGroups,
    SfHeading
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
    detailingFlagText (): string | undefined {
      return this.bodyPart.detailingFlagText;
    },
    canBeDetailed (): boolean {
      return !!this.bodyPart.childrenBodyparts && this.bodyPart.childrenBodyparts.length > 0;
    },
    childrenBodyParts (): Bodypart[] {
      return this.bodyPart.childrenBodyparts || [];
    },
    showDetailedBodyParts: {
      get (): boolean {
        return this.canBeDetailed && this.fShowDetailedBodyParts;
      },
      set (value: boolean) {
        this.fShowDetailedBodyParts = value;
      }
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
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.m-bodypart-option-configurator {
  display: flex;
  flex-direction: column;
  align-items: center;

  ._detailing-checkbox {
    display: inline-block;
    margin-bottom: var(--spacer-lg);
  }

  ._detailed-body-parts-container {
    margin-top: var(--spacer-lg);
    display: grid;
    gap: var(--spacer-sm);
    grid-template-columns: auto;
  }

  &.-disabled {
    ::v-deep .a-body-part-vale {
      opacity: 0.7;

      > label {
       cursor: default;
      }
    }
  }

  @include for-desktop {
    ._detailed-body-parts-container {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}
</style>
