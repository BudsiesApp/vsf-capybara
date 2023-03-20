<template>
  <div class="m-detailed-body-parts">
    <m-checkbox
      v-if="canBeDetailed"
      class="_detailing-checkbox"
      v-model="showDetailedBodyParts"
      :label="detailingFlagText"
      :disabled="disabled"
    />

    <slot name="main-body-part-heading" />

    <slot name="top-helper-text" />

    <div v-if="showDetailedBodyParts" class="_detailed-body-parts-container">
      <div
        v-for="childBodyPart in childrenBodyParts"
        :key="childBodyPart.id"
        class="_detailed-body-part"
      >
        <slot
          name="detailed-body-part"
          :child-body-part="childBodyPart"
          :remove-conflicting-body-parts-values="removeConflictingBodyPartsValues"
        />
      </div>
    </div>

    <div class="_main-body-part-container" v-else>
      <slot :remove-conflicting-body-parts-values="removeConflictingBodyPartsValues" />
    </div>

    <slot name="bottom-helper-text" />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { Bodypart, BodypartOption } from 'src/modules/budsies';

import MCheckbox from './m-checkbox.vue';

export default Vue.extend({
  name: 'MDetailedBodyParts',
  components: {
    MCheckbox
  },
  props: {
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
      fShowDetailedBodyParts: false
    };
  },
  computed: {
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
    }
  },
  methods: {
    removeConflictingBodyPartsValues (
      bodyPartsValues: Record<string, BodypartOption | BodypartOption[] | undefined>,
      updatedBodyPart: Bodypart
    ) {
      if (updatedBodyPart.id === this.bodyPart.id) {
        this.childrenBodyParts.forEach((childBodyPart) => {
          if (!bodyPartsValues[childBodyPart.id]) {
            return;
          }

          delete bodyPartsValues[childBodyPart.id];
        });

        return;
      }

      if (!this.childrenBodyParts.find((bodyPart) => bodyPart.id === updatedBodyPart.id)) {
        return;
      }

      if (!bodyPartsValues[this.bodyPart.id]) {
        return;
      }

      delete bodyPartsValues[this.bodyPart.id];
    }
  }
})

</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.m-detailed-body-parts {
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

  ._main-body-part-container {
    width: 100%;
  }

  @include for-desktop {
    ._detailed-body-parts-container {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}
</style>
