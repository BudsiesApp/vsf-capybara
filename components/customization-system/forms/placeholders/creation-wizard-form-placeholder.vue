<template>
  <div class="creation-wizard-form-placeholder">
    <div class="_content">
      <div class="_steps-container">
        <div class="_steps">
          <div class="_steps-navigation _placeholder" />

          <div class="sf-step">
            <div class="_step-title _placeholder" />

            <div class="_customization-option _placeholder" />
            <div class="_customization-option _placeholder" />
            <div class="_customization-option _placeholder" />

            <div class="_step-actions-container">
              <div class="_step-action _placeholder" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CreationWizardFormPlaceholder'
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "theme/css/mixins/form-placeholder-item.scss";

.creation-wizard-form-placeholder {
  --steps-content-padding: var(--spacer-base) 0 0;

  text-align: center;

  ._placeholder {
    @include form-placeholder-item;
  }

  ._content {
    display: flex;
    justify-content: center;
    position: relative;
    margin-top: var(--spacer-base);
  }

  ._steps-container {
    display: flex;
    justify-content: center;
    flex-grow: 1;
  }

  ._steps {
    flex-grow: 1;
  }

  ._steps-navigation {
    height: 44px;
    width: 100%;
    max-width: 760px;
    margin: 0 auto;
  }

  .sf-step {
    max-width: 760px;
    margin-left: auto;
    margin-right: auto;
  }

  ._step-title,
  ._customization-option,
  ._step-actions-container {
    padding-left: var(--spacer-sm);
    padding-right: var(--spacer-sm);
  }

  ._step-title {
    height: 24px;
    width: 240px;
    margin: var(--spacer-xl) auto 0;
  }

  ._customization-option {
    height: 120px;
    width: 100%;
    margin-top: var(--spacer-base);
  }

  ._step-actions-container {
    display: flex;
    justify-content: center;
    margin-top: var(--spacer-base);
  }

  ._step-action {
    height: 48px;
    width: 200px;
  }

  @include for-desktop {
    ._steps {
      max-width: 960px;
    }
  }
}
</style>
