<template>
  <div class="m-spinner-button">
    <SfButton
      ref="button"
      :class="buttonClass"
      :aria-disabled="isDisabled"
      :title="title"
      :type="buttonType"
      :aria-label="ariaLabel"
      @click="onClick"
    >
      <ALoadingSpinner v-show="showSpinner" />
      <span :style="{visibility: showSpinner ? 'hidden' : 'visible'}">
        <slot />
      </span>
    </SfButton>
  </div>
</template>

<script lang="ts">
import Vue, { Ref, ref } from 'vue';
import { SfButton } from '@storefront-ui/vue';
import ALoadingSpinner from 'theme/components/atoms/a-loading-spinner.vue';

export default Vue.extend({
  name: 'MSpinnerButton',
  props: {
    buttonClass: {
      type: String,
      default: 'color-primary'
    },
    showSpinner: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    ariaLabel: {
      type: String,
      default: ''
    },
    buttonType: {
      type: String,
      default: 'button'
    }
  },
  components: {
    ALoadingSpinner,
    SfButton
  },
  setup () {
    const button: Ref<InstanceType<typeof SfButton> | null> = ref(null);

    function focus (): boolean {
      const buttonElement = button.value?.$el;

      if (!(buttonElement instanceof HTMLElement)) {
        return false;
      }

      buttonElement.focus();

      return true;
    }

    return {
      button,
      focus
    };
  },
  computed: {
    isDisabled (): boolean {
      return this.showSpinner || this.disabled;
    }
  },
  methods: {
    onClick() {
      if (this.isDisabled) {
        return;
      }

      this.$emit('click');
    }
  }
});
</script>

<style lang="scss" scoped>
.m-spinner-button {
  .a-loading-spinner {
    --loader-overlay-background: transparent;
    --loader-spinner-stroke: var(--c-white);

    position: absolute;
    width: var(--spinner-button-width, var(--font-sm));
    height: var(--spinner-button-height, var(--font-sm));
  }

  .sf-button {
    &.-icon-button {
      --button-background: var(--c-button-background-disabled);
      --button-border-radius: 50%;

      display: var(--spinner-button-display, flex);
    }

    &.sf-button--text {
      display: var(--spinner-button-display, flex);
      justify-content: flex-end;
      align-items: center;

      .a-loading-spinner {
        --loader-spinner-stroke: var(--c-primary);
      }
    }
  }
}
</style>
