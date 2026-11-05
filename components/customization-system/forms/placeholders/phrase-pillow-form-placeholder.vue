<template>
  <div class="phrase-pillow-form-placeholder">
    <div class="_header -show-for-medium-up">
      <div class="_main-header _placeholder" />

      <div
        class="_subtitle _placeholder"
      />
    </div>

    <div class="_form-content">
      <div class="_live-preview-section">
        <div class="_live-preview-content _placeholder" />
      </div>

      <div class="_customization-section">
        <div class="_customizer-steps">
          <div class="_customizer-steps-navigation _placeholder" />

          <div class="_customizer-step">
            <div class="_step-title _placeholder" />

            <div class="_step-content -small _placeholder" />

            <div class="_step-title _placeholder" />

            <div class="_step-content _placeholder" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PhrasePillowFormPlaceholder'
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "theme/css/mixins/form-placeholder-item.scss";

$medium-breakpoint: 641px;
$section-height: 160px;

.phrase-pillow-form-placeholder {
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  ._main-header {
    width: $section-height * 2;
    height: 42px;
    margin: 0 auto;
  }

  ._subtitle {
    width: $section-height * 3;
    height: 26px;
    margin: 0 auto;
  }

  ._placeholder {
    @include form-placeholder-item;
  }

  ._subtitle {
    margin-top: var(--spacer-base);
  }

  ._form-content,
  ._customizer-steps {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  ._customization-section {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    padding-left: 0;
    padding-right: 0;

    ._customizer-step {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      flex: 1;
      padding: var(--spacer-base) 0.8em 0.8em;

      flex-basis: 0;
      overflow: hidden;
    }

    ._step-container {
      padding: 0 0.8em 0;
    }
  }

  ._live-preview-section {
    width: 100%;
    padding: 0.8em;
    box-sizing: border-box;
  }

  ._customizer-steps-navigation {
    height: 44px;
  }

  ._step-title {
    margin: 0 auto;
    height: 24px;
    min-height: 24px;
    width: $section-height * 1.5;
    margin-top: var(--spacer-base);

    &:first-child {
      margin-top: 0;
    }
  }

  ._live-preview-content {
     padding-bottom: 66%;
  }

  ._step-content {
    height: $section-height * 2;
    min-height: $section-height * 2;
    width: 100%;
    margin: var(--spacer-base) var(--spacer-sm) 0;

    &.-small {
      height: $section-height / 2;
      min-height: $section-height / 2;
    }
  }

  @media (max-width: $medium-breakpoint - 1px) {
    .-show-for-medium-up {
      display: none !important;
    }
  }

  @media (min-width: $medium-breakpoint) {
    .-show-for-small-only {
      display: none !important;
    }

    ._form-content {
      flex-direction: row;
      padding-top: 3.5em;
    }

    ._live-preview-section {
      flex: 0.96 1;
      height: auto;
    }

    ._live-preview-content {
       padding-bottom: 90%;
    }

    ._customization-section {
      flex: 1;
      height: auto;
      padding: 0.8em;

      ._customizer-step {
        padding: var(--spacer-base) 0.4em 0.4em;

        flex-basis: 100%;
        overflow: visible;
      }

      ._form {
        height: auto;
      }
    }
  }
}
</style>
