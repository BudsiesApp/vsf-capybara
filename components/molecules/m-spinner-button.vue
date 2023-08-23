<template>
  <div class="m-spinner-button">
    <SfButton
      :class="buttonClass"
      :disabled="showSpinner"
      @click="$emit('click')"
    >
      <ALoadingSpinner v-show="showSpinner" />
      <span :style="{visibility: showSpinner ? 'hidden' : 'visible'}">
        <slot />
      </span>
    </SfButton>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
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
    }
  },
  components: {
    ALoadingSpinner,
    SfButton
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
      --button-background: var(--c-primary);
      --button-border-radius: 50%;

      display: var(--spinner-button-display, flex);
    }
  }
}
</style>
