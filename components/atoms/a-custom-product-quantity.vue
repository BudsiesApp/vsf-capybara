<template>
  <div
    class="a-custom-product-quantity"
    :class="[
      {
        '-disabled': disabled,
      },
      skinClass,
    ]"
  >
    <button
      type="button"
      class="_handle -down"
      :aria-label="$t('Decrease quantity, currently: {value}', { value: valueText }).toString()"
      @click="decreaseQty"
    >
      -
    </button>

    <div class="_value">
      {{ valueText }}
    </div>

    <button
      type="button"
      class="_handle -up"
      :aria-label="$t('Increase quantity, currently: {value}', { value: valueText }).toString()"
      @click="increaseQty"
    >
      +
    </button>

    <input type="hidden" name="qty" :value="value">
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import getCurrentThemeClass from 'theme/helpers/get-current-theme-class';

export default Vue.extend({
  name: 'ACustomProductQuantity',
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    value: {
      type: Number,
      default: 1
    }
  },
  computed: {
    skinClass (): string {
      return getCurrentThemeClass();
    },
    valueText (): number {
      return this.value;
    }
  },
  methods: {
    decreaseQty (): void {
      if (this.disabled) {
        return;
      }

      if (this.value > 1) {
        this.$emit('input', this.value - 1);
      }
    },
    increaseQty (): void {
      if (this.disabled) {
        return;
      }

      this.$emit('input', this.value + 1);
    }
  }
});
</script>

<style lang="scss" scoped>
.a-custom-product-quantity {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    text-align: center;

    ._handle {
        flex-grow: 0;
        flex-shrink: 0;
        line-height: 28px;
        text-align: center;
        transition: background-color 0.2s;
        cursor: pointer;
        background-color: var(--c-white);
        padding: 0;

        &.-up {
            border-left-width: 0;
        }

        &.-down {
            border-right-width: 0;
        }

        &:hover,
        &:focus {
            &.-up {
                text-decoration: none;
            }

            &.-down {
                text-decoration: none;
            }
        }
    }

    ._value {
        border-radius: 0;
    }

    &.-disabled {
        opacity: 0.6;

        ._handle {
          cursor: default;
        }
    }

    &.-skin-petsies,
    &.-skin-waggables {
      ._handle {
        border: 1px solid var(--c-text);
        width: 30px;
        color: var(--c-text);

        &:hover,
        &:focus {
          background: var(--c-light);
        }
      }

      &.-disabled {
        ._handle {
          &:hover,
          &:focus {
            background: unset;
          }
        }
      }

      ._value {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 3em;
        border-top: 1px solid var(--c-text);
        border-bottom: 1px solid var(--c-text);
        height: 28px;
        font-weight: 400;
        font-size: 0.8em;
      }
    }
}
</style>
