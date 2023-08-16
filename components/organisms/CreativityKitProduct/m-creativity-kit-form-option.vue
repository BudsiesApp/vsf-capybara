<template>
  <div
    class="m-creativity-kit-form-option"
    :class="{'-selected': isSelected, '-disabled': disabled}"
  >
    <div class="_wrapper">
      <div class="_check-mark" />

      <label class="_label">
        <input
          type="radio"
          class="_input"
          :name="name"
          :value="option"
          :disabled="disabled"
          v-model="selectedValue"
        >

        <div class="_content">
          <img class="_image" :src="option.image">

          <div class="_overlay" v-show="!isSelected">
            <SfButton class="_button">
              {{ $t('Select') }}
            </SfButton>
          </div>
        </div>
      </label>

      <span class="_hint" v-if="option.isDefault">
        <span class="_hint-text">
          {{ $t('Best Value') }}
        </span>
      </span>
    </div>

    <div class="_body">
      <div class="_price">
        {{ option.price | price() }}
      </div>

      <div class="_info">
        {{ option.name }}

        <br>

        {{ option.valueText }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { SfButton } from '@storefront-ui/vue';

export interface CreativityKitFormOption {
  image: string,
  price: number,
  isDefault: boolean,
  name: string,
  valueText: string,
  bundleOptionId: number,
  optionValueId: string
}

export default Vue.extend({
  name: 'MCreativityKitFormOption',
  props: {
    value: {
      type: Object as PropType<CreativityKitFormOption | undefined>,
      default: undefined
    },
    option: {
      type: Object as PropType<CreativityKitFormOption>,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  components: {
    SfButton
  },
  computed: {
    selectedValue: {
      get (): CreativityKitFormOption | undefined {
        return this.value;
      },
      set (value: CreativityKitFormOption): void {
        this.$emit('input', value);
      }
    },
    isSelected (): boolean {
      return !!this.value && this.value.optionValueId === this.option.optionValueId;
    }
  }
})
</script>

<style lang="scss" scoped>
@import "theme/css/base/_breakpoints.scss";

.m-creativity-kit-form-option {
  $border-color-unchecked: #dbdbdb;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  position: relative;

  &.-selected {
    ._label,
    ._check-mark {
      border-color: var(--c-primary);
    }

    ._check-mark {
      &::after {
        transform: scale(1);
      }
    }
  }

  &.-disabled {
    pointer-events: none;
  }

  ._wrapper {
    display: flex;
    justify-content: center;
    position: relative;
  }

  ._overlay {
    display: none;
    pointer-events: none;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.3);
  }

  ._label {
    position: relative;
    border-radius: 15%;
    overflow: hidden;
    cursor: pointer;
    border: 3px solid $border-color-unchecked;
    transition: border-color ease 0.3s;

    ._input {
      visibility: hidden;
      position: absolute;
    }
  }

  ._content {
    display: flex;
  }

  ._body {
    width: 100%;
    margin-top: var(--spacer-sm);
  }

  ._price {
    font-weight: var(--font-bold);
    font-size: var(--font-xl);
  }

  ._info {
    margin-top: var(--spacer-xs);
  }

  ._image {
    width: 100%;
  }

  ._check-mark {
    box-sizing: border-box;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 24px;
    height: 24px;
    border: 3px solid $border-color-unchecked;
    border-radius: 50%;
    background: var(--c-white);
    transform: translateY(-50%);
    z-index: 2;
    transition: border-color ease 0.3s;

    &::after {
      content: "";
      position: absolute;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--c-primary);
      z-index: 2;
      transform: scale(0);
      transition: transform ease 0.3s;
    }
  }

  ._hint {
    position: absolute;
    top: -35px;
    right: -35px;
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: #a3c914;
    color: var(--c-white);
    font-size: var(--font-xs);
    font-weight: var(--font-bold);
    line-height: 1.2;
    letter-spacing: 0.01em;
    text-transform: uppercase;
    transform: rotate(-40deg);

    &::after {
      position: absolute;
      right: 100%;
      top: 50%;
      border: solid transparent;
      border-width: 7px 16px;
      border-right-color: #a3c914;
      margin: -7px -1px 0 0;
      content: "";
    }
  }

  ._hint-text {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    transform: translateY(-50%) rotate(33deg);
  }

  @include for-desktop {
    ._label {
      &:hover {
        ._overlay {
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    }
  }
}
</style>
