<template>
  <div
    class="m-suggestions-list"
  >
    <SfInput
      ref="input"
      :value="value"
      :label="label"
      :name="name"
      :autocomplete="autocomplete"
      :disabled="disabled"
      :required="required"
      :valid="valid"
      :error-message="errorMessage"
      class="m-suggestions-list__input"
      @input="updateSearch"
      @focus.prevent="activate()"
      @blur.prevent="deactivate()"
      @keyup.esc="deactivate()"
      @keydown.down.prevent="pointerForward()"
      @keydown.up.prevent="pointerBackward()"
      @keydown.enter.prevent="selectPointed()"
    />

    <div
      v-if="isActive && suggestions.length > 0"
      class="m-suggestions-list__dropdown"
    >
      <ul
        class="m-suggestions-list__options"
        role="listbox"
      >
        <li
          v-for="(suggestion, index) in suggestions"
          :key="suggestion.id"
          :class="{
            'm-suggestions-list__option': true,
            'm-suggestions-list__option--active': index === pointer
          }"
          role="option"
          :aria-selected="index === pointer"
          @mouseenter="pointer = index"
          @mousedown.prevent="selectSuggestion(suggestion.id)"
        >
          {{ suggestion.description }}
        </li>
      </ul>

      <slot name="bottom" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from '@vue/composition-api';
import { SfInput } from '@storefront-ui/vue';

import { AutocompleteSuggestion } from 'src/modules/address/types/autocomplete';
import { use1PasswordDisable } from 'src/themes/petsies-capybara/helpers/use-1password-disable';

export default defineComponent({
  name: 'MSuggestionsList',
  components: {
    SfInput
  },
  props: {
    value: {
      type: String,
      required: true
    },
    suggestions: {
      type: Array as PropType<AutocompleteSuggestion[]>,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      required: true
    },
    required: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    valid: {
      type: Boolean,
      default: true
    },
    errorMessage: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    autocomplete: {
      type: String,
      default: 'off'
    }
  },
  setup (props, { emit }) {
    const input = ref<InstanceType<typeof SfInput> | null>(null);
    const isActive = ref<boolean>(false);
    const pointer = ref<number>(-1);

    const getInputElement = (): HTMLInputElement | null => {
      const _input: InstanceType<typeof SfInput> | null = (input as any).value;

      if (!_input) {
        return null;
      }

      return _input.$el.querySelector('input');
    };

    use1PasswordDisable(getInputElement);

    const activate = (): void => {
      if (props.disabled) return;
      isActive.value = true;
    };

    const deactivate = (): void => {
      isActive.value = false;
      pointer.value = -1;
    };

    const updateSearch = (value: string): void => {
      emit('input', value);
      if (!isActive.value) {
        activate();
      }
    };

    const pointerForward = (): void => {
      if (props.loading || props.suggestions.length === 0) return;

      if (pointer.value < props.suggestions.length - 1) {
        pointer.value++;
      }
    };

    const pointerBackward = (): void => {
      if (props.loading || props.suggestions.length === 0) return;

      if (pointer.value > 0) {
        pointer.value--;
      } else {
        pointer.value = -1;
      }
    };

    const selectSuggestion = (id: string): void => {
      emit('select', id);
      deactivate();
    };

    const selectPointed = (): void => {
      if (pointer.value >= 0 && pointer.value < props.suggestions.length) {
        selectSuggestion(props.suggestions[pointer.value].id);
      }
    };

    watch(() => props.suggestions, () => {
      pointer.value = -1;
    });

    return {
      input,
      isActive,
      pointer,
      activate,
      deactivate,
      updateSearch,
      pointerForward,
      pointerBackward,
      selectPointed,
      selectSuggestion
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.m-suggestions-list {
  position: relative;

  &__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 10;
    margin-top: calc(var(--spacer-sm) * -1);
  }

  &__options {
    max-height: 300px;
    overflow-x: hidden;
    overflow-y: auto;
    box-shadow: 0 4px 11px rgba(var(--c-dark-base), 0.1);
    background-color: var(--c-white);
    list-style: none;
    margin: 0;
    padding: 0;

    // For Firefox
    scrollbar-color: var(--c-dark-variant) var(--c-white);
    scrollbar-width: thin;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 1em;
      background: var(--c-dark-variant);
    }

    // Hack for detect iOS Safari dark mode
    @media (prefers-color-scheme: dark) {
      @supports (-webkit-touch-callout: none) {
        background-color: var(--ios-select-dropdown-background);
      }
    }
  }

  &__option {
    white-space: normal;
    padding: calc(var(--spacer-xs) * 1.1);
    border-bottom: 1px solid var(--c-light);
    min-height: 20px;
    font-size: var(--font-sm);
    cursor: pointer;
    transition: background-color 150ms ease-in-out;

    &--loading {
      cursor: default;
      text-align: center;
      color: var(--c-text-muted);
    }

    &--active {
      background-color: rgba(var(--c-gray-base), 0.1);
    }

    &:not(&--loading):hover {
      background-color: rgba(var(--c-gray-base), 0.1);
    }

    // Hack for detect iOS Safari dark mode
    @media (prefers-color-scheme: dark) {
      @supports (-webkit-touch-callout: none) {
        background-color: var(--ios-select-dropdown-background);
        border-color: var(--ios-select-option-border-color);
        color: var(--c-white);

        &--active,
        &:not(&--loading):hover {
          background-color: var(--ios-select-option-active-background);
          color: var(--c-white);
        }
      }
    }
  }
}
</style>
