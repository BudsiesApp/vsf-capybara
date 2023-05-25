<template>
  <ul class="m-pajama-style-selector" :class="{'-disabled': disabled}">
    <li
      class="_value"
      :key="option.code"
      v-for="option in options"
    >
      <input
        :id="getInputId(option)"
        :name="name"
        type="radio"
        :value="option.code"
        v-model="selectedOption"
        :disabled="disabled"
      >
      <label
        :for="getInputId(option)"
      >
        <div class="_icon-wrapper">
          <div
            class="_icon"
            :style="getIconStyle(option)"
          />
        </div>

        <div class="_name">
          {{ option.name }}
        </div>
      </label>
    </li>
  </ul>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { getThumbnailPath } from '@vue-storefront/core/helpers/index';

import PajamaStyleOption from 'theme/components/interfaces/pajama-style-option.interface';

const OPTION_ITEM_WIDTH = 115;

export default Vue.extend({
  name: 'MPajamaStyleSelector',
  props: {
    options: {
      type: Array as PropType<PajamaStyleOption[]>,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    value: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    selectedOption: {
      get (): string | undefined {
        return this.value;
      },
      set (value: string | undefined) {
        this.$emit('input', value);
      }
    }
  },
  methods: {
    getIconStyle (option: PajamaStyleOption): Record<string, string> {
      const thumb = getThumbnailPath(
        option.image,
        OPTION_ITEM_WIDTH * 2,
        OPTION_ITEM_WIDTH * 2,
        'product'
      );

      return {
        'background-image': `url(${thumb})`
      }
    },
    getInputId (option: PajamaStyleOption): string {
      return `pajama_style_option_${option.code}`;
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

$bodypart-item-width: 115px;
$color-selector-selected-border-color: #51a7f9;

.m-pajama-style-selector {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    padding: 0;
    row-gap: 2vw;
    text-align: center;

    &.-disabled {
    ._visual-selector {
      opacity: 0.7;

      > label {
       cursor: default;
      }
    }
  }

    ._value {
      box-sizing: border-box;
      width: 33.33%;
      padding: 0 var(--spacer-sm);
      max-width: $bodypart-item-width;

      >input {
        display: block;
        height: 0;
        opacity: 0;
        width: 0;
        margin: 0;
        padding: 0;
        border: 0;
    }

    >label {
        height: auto;
        margin: 0;
        min-height: 0;
        padding: 0;
        width: 100%;
        cursor: pointer;
    }

    >input:checked+label ._icon::before {
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

    >input:checked+label ._icon::after {
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
    }

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
        text-transform: capitalize;
    }
}
</style>
