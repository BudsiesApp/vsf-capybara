<template>
  <div class="m-body-parts-section">
    <div
      class="_body-part"
      v-for="bodyPart in bodyParts"
      :key="bodyPart.id"
    >
      <m-checkbox
        v-if="canBeDetailed[bodyPart.id]"
        class="_detailing-checkbox"
        :selected="showDetailedBodyParts[bodyPart.id]"
        :label="detailingFlagText[bodyPart.id]"
        :disabled="disabled"
        @change="onShowDetailedBodyPartsChange($event, bodyPart.id)"
      />

      <slot name="main-body-part-heading" :body-part="bodyPart" />

      <slot name="top-helper-text" :body-part="bodyPart" />

      <div v-if="canShowDetailedBodyParts(bodyPart.id)" class="_detailed-body-parts-container">
        <validation-provider
          v-slot="{ errors }"
          :rules="childBodyPart.isRequired ? 'required' : ''"
          :name="`'${childBodyPart.name}'`"
          :key="childBodyPart.id"
          v-for="childBodyPart in childrenBodyParts[bodyPart.id]"
          class="_detailed-body-part"
          tag="div"
        >
          <slot name="child-body-part-heading" :child-body-part="childBodyPart" />

          <m-body-part-option-configurator
            class="_options-list"
            :name="childBodyPart.code"
            :value="bodyPartsValues[childBodyPart.id]"
            :options="getBodyPartOptions(childBodyPart.id)"
            :max-values="childBodyPart.maxValues"
            type="bodypart"
            :disabled="disabled"
            @input="onBodyPartValueInput($event, childBodyPart, bodyPart)"
          />

          <div class="_error-text">
            {{ errors[0] }}
          </div>
        </validation-provider>
      </div>

      <div class="_main-body-part-container" v-else>
        <validation-provider
          v-slot="{ errors }"
          :rules="bodyPart.isRequired ? 'required' : ''"
          :name="`'${bodyPart.name}'`"
          :key="bodyPart.id"
          tag="div"
        >
          <m-body-part-option-configurator
            class="_options-list"
            :name="bodyPart.code"
            :value="bodyPartsValues[bodyPart.id]"
            :options="getBodyPartOptions(bodyPart.id)"
            :max-values="bodyPart.maxValues"
            type="bodypart"
            :disabled="disabled"
            @input="onBodyPartValueInput($event, bodyPart, bodyPart)"
          />

          <div class="_error-text">
            {{ errors[0] }}
          </div>
        </validation-provider>
      </div>

      <slot name="bottom-helper-text" :body-part="bodyPart" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { ValidationProvider, extend } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';

import { Bodypart, BodypartOption, Dictionary } from 'src/modules/budsies';

import MBodyPartOptionConfigurator from './m-bodypart-option-configurator.vue';
import MCheckbox from './m-checkbox.vue';

extend('required', {
  ...required,
  message: 'The {_field_} field is required'
});

export default Vue.extend({
  name: 'MBodyPartsSection',
  components: {
    MBodyPartOptionConfigurator,
    MCheckbox,
    ValidationProvider
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    productId: {
      type: Number,
      required: true
    },
    value: {
      type: Object as PropType<Record<string, BodypartOption | BodypartOption[] | undefined>>,
      required: true
    }
  },
  data (): Record<string, any> {
    const showDetailedBodyParts: Dictionary<boolean> = {};

    return {
      showDetailedBodyParts
    };
  },
  computed: {
    bodyParts (): Bodypart[] {
      if (!this.productId) {
        return [];
      }

      const bodyParts = this.$store.getters['budsies/getProductBodyparts'](this.productId);

      if (!bodyParts.length) {
        return [];
      }

      return bodyParts;
    },
    bodyPartsValues: {
      get (): Record<string, BodypartOption | BodypartOption[] | undefined> {
        return this.value;
      },
      set (value: Record<string, BodypartOption | BodypartOption[] | undefined>): void {
        this.$emit('input', value);
      }
    },
    detailingFlagText (): Dictionary<string | undefined> {
      const detailingFlagText: Dictionary<string | undefined> = {};

      this.bodyParts.forEach((bodyPart) => {
        detailingFlagText[bodyPart.id] = bodyPart.detailingFlagText;
      });

      return detailingFlagText;
    },
    canBeDetailed (): Dictionary<boolean> {
      const canBeDetailed: Dictionary<boolean> = {};

      this.bodyParts.forEach((bodyPart) => {
        canBeDetailed[bodyPart.id] = !!bodyPart.childrenBodyparts && bodyPart.childrenBodyparts.length > 0;
      });

      return canBeDetailed;
    },
    childrenBodyParts (): Dictionary<Bodypart[]> {
      const childrenBodyParts: Dictionary<Bodypart[]> = {};

      this.bodyParts.forEach((bodyPart) => {
        childrenBodyParts[bodyPart.id] = bodyPart.childrenBodyparts || [];
      });

      return childrenBodyParts;
    }
  },
  methods: {
    fillShowDetailedBodyPartsInitialValues (): void {
      this.bodyParts.forEach((bodyPart) => {
        const isChildBodyPartSelected = !!this.childrenBodyParts[bodyPart.id].find((bodyPart) => this.value[bodyPart.id]);

        Vue.set(this.showDetailedBodyParts, bodyPart.id, isChildBodyPartSelected);
      });
    },
    getBodyPartOptions (id: string): BodypartOption[] {
      return this.$store.getters['budsies/getBodypartOptions'](id);
    },
    onBodyPartValueInput (value: BodypartOption | BodypartOption[], bodyPart: Bodypart, mainBodyPart: Bodypart): void {
      const valueWithoutConflictingBodyPartsValues = this.removeConflictingBodyPartsValues(
        { ...this.value },
        bodyPart,
        mainBodyPart
      );

      this.bodyPartsValues = { ...valueWithoutConflictingBodyPartsValues, [bodyPart.id]: value };
    },
    onShowDetailedBodyPartsChange (value: boolean, bodyPartId: string): void {
      Vue.set(this.showDetailedBodyParts, bodyPartId, value);
    },
    removeConflictingBodyPartsValues (
      bodyPartsValues: Record<string, BodypartOption | BodypartOption[] | undefined>,
      updatedBodyPart: Bodypart,
      mainBodyPart: Bodypart
    ): Record<string, BodypartOption | BodypartOption[] | undefined> {
      if (updatedBodyPart.id === mainBodyPart.id) {
        this.childrenBodyParts[mainBodyPart.id].forEach((childBodyPart) => {
          if (!bodyPartsValues[childBodyPart.id]) {
            return bodyPartsValues;
          }

          delete bodyPartsValues[childBodyPart.id];
        });

        return bodyPartsValues;
      }

      if (!this.childrenBodyParts[mainBodyPart.id].find((bodyPart) => bodyPart.id === updatedBodyPart.id)) {
        return bodyPartsValues;
      }

      if (!bodyPartsValues[mainBodyPart.id]) {
        return bodyPartsValues;
      }

      delete bodyPartsValues[mainBodyPart.id];
      return bodyPartsValues;
    },
    canShowDetailedBodyParts (bodyPartId: string): boolean {
      return this.showDetailedBodyParts[bodyPartId] && this.canBeDetailed[bodyPartId];
    }
  },
  watch: {
    'bodyParts.length': {
      immediate: true,
      handler: function (val) {
        if (val === 0) {
          return;
        }

        this.fillShowDetailedBodyPartsInitialValues();
      }
    }
  }
})

</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.m-body-parts-section {
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

  ._options-list {
    margin: (--body-part-options-list-margin, var(--spacer-sm) 0 0);
  }

  ._body-part {
    margin: var(--body-part-margin, var(--spacer-base) 0 0);
  }

  ._error-text {
    color: var(--c-danger-variant);
    font-size: var(--font-xs);
    margin-top: var(--spacer-xs);
    height: calc(var(--font-xs) * 1.2);
  }

  @include for-desktop {
    ._detailed-body-parts-container {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}
</style>
