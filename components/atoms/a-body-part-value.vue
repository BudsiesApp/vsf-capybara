<template>
  <li
    class="a-body-part-value"
    :class="{'-color-value': isColorValue}"
    :key="option.value"
  >
    <input
      :id="inputId"
      :name="name"
      :type="inputType"
      :value="option"
      v-model="selectedOption"
      :disabled="disabled"
      @click="$emit('change', { event: $event, option })"
    >
    <label
      :for="inputId"
    >
      <div class="_icon-wrapper">
        <div
          class="_icon"
          :style="iconStyle"
        />
      </div>

      <div class="_name">
        {{ option.label }}
      </div>
    </label>
  </li>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { getThumbnailPath } from '@vue-storefront/core/helpers/index';

import { BodypartOption, BodyPartValueContentType } from 'src/modules/budsies';

const BODYPART_ITEM_WIDTH = 145;

export default Vue.extend({
  name: 'ABodyPartValue',
  props: {
    inputType: {
      type: String as PropType<'checkbox' | 'radio'>,
      required: true
    },
    option: {
      type: Object as PropType<BodypartOption>,
      required: true
    },
    parentComponentInstanceId: {
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
    selectedOption: {
      get (): BodypartOption | BodypartOption[] {
        return this.value;
      },
      set (value: BodypartOption | BodypartOption[]) {
        this.$emit('input', value);
      }
    },
    iconStyle (): string | Record<string, string | number> {
      if (this.option.contentTypeId === BodyPartValueContentType.IMAGE && this.option.image) {
        const thumb = getThumbnailPath(
          this.option.image,
          BODYPART_ITEM_WIDTH * 2,
          BODYPART_ITEM_WIDTH * 2,
          this.type
        );

        return {
          'background-image': `url(${thumb})`
        }
      }

      if (
        this.option.contentTypeId === BodyPartValueContentType.COLOR &&
        this.option.color
      ) {
        return {
          'background-color': this.option.color
        }
      }

      return '';
    },
    isColorValue (): boolean {
      return this.option.contentTypeId === BodyPartValueContentType.COLOR;
    },
    inputId (): string {
      return `body_part_value_${this.parentComponentInstanceId}_${this.option.id}`;
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

$bodypart-item-width: 145px;
$color-selector-selected-border-color: #51a7f9;

.a-body-part-value {
  box-sizing: border-box;
  width: 33.33%;
  padding: 0 var(--spacer-sm);
  max-width: $bodypart-item-width;

  ._icon {
    background-position: center center;
    background-repeat: no-repeat;
    background-size: contain;
    border-radius: 50%;
    padding-top: 100%;
    width: 100%;
    position: relative;
    z-index: 0;
  }

  ._name {
    font-size: var(--font-xs);
    font-weight: var(--font-medium);
    margin-top: var(--spacer-sm);
  }

  > input {
    display: block;
    height: 0;
    opacity: 0;
    width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  > label {
    height: auto;
    margin: 0;
    min-height: 0;
    padding: 0;
    width: 100%;
    cursor: pointer;
  }

  > input:checked + label ._icon::before {
    background: rgba(52, 184, 147, 0.7);
    border-radius: 100%;
    content: "";
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 1;
  }

  > input:checked + label ._icon::after {
    background: url('/assets/images/sprite/ico-tick-green.png') no-repeat center #fff;
    border: 2px solid #38b677;
    border-radius: 100%;
    content: "";
    height: 24px;
    position: absolute;
    right: 0;
    top: 0;
    width: 24px;
    z-index: 2;
  }

  &.-color-value {
    width: 25.1%;

    ._icon-wrapper {
      border-radius: 50%;
      border: 4px solid transparent;
      width: 100%;
      height: 0;
      position: relative;
      padding-top: 100%;
    }

    ._icon {
      border: 1px solid #ccc;
      height: 100%;
      position: absolute;
      box-sizing: border-box;
      padding-top: 0;
      top: 0;
    }

    input:checked {
      & + label {
        ._icon-wrapper {
          border-color: $color-selector-selected-border-color;
        }

        ._icon::before,
        ._icon::after {
          content: none;
        }
      }
    }
  }

  @media (min-width: $tablet-min) {
    width: $bodypart-item-width;

    &.-color-value {
      width: 90px;
    }
  }
}
</style>
