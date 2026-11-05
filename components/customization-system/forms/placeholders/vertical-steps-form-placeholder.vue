<template>
  <div class="vertical-steps-form-placeholder">
    <div class="_title _placeholder" />

    <div
      class="_step -first"
    >
      <SfDivider class="_step-divider" />

      <div
        class="_step-title _placeholder"
      />

      <div class="_content">
        <div class="_step-subtitle _placeholder" />

        <div class="_input-block _placeholder" />
      </div>
    </div>

    <div
      class="_step"
    >
      <SfDivider class="_step-divider" />

      <div
        class="_step-title _placeholder"
      />

      <div class="_content">
        <div class="_step-subtitle _placeholder" />

        <div class="_input-block _placeholder" />

        <div class="_step-subtitle _placeholder" />

        <div class="_input-block _placeholder" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { SfDivider } from '@storefront-ui/vue';
import { defineComponent } from 'vue';

export default defineComponent({
  components: {
    SfDivider
  },
  name: 'VerticalStepsFormPlaceholder'
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "theme/css/mixins/form-placeholder-item.scss";

$section-height: 160px;

.vertical-steps-form-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;

  ._title {
    margin-top: var(--spacer-lg);
    height: 42px;
    width: $section-height * 2;
  }

  ._input-block {
    width: 100%;
    height: $section-height;
    margin-top: var(--spacer-xs);
  }

  ._step {
    margin-top: var(--spacer-lg);
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

    ._content {
      max-width: 720px;
      width: 100%;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    &.-first {
      margin-top: var(--spacer-xl);

      ._input-block {
        height: $section-height * 2;
      }
    }
  }

  ._step-divider {
    display: none;
    width: 100%;
    margin-top: 0;
  }

  ._step-title {
    display: inline-block;
    margin-top: var(--spacer-xl);
    width: $section-height / 2;
    height: 28px;
  }

  ._step-subtitle {
    width: $section-height;
    height: 32px;
    margin-top: var(--spacer-base);
  }

  ._placeholder {
    @include form-placeholder-item;
  }

  @media (min-width: $tablet-min) {
    ._step-divider {
      display: block;
    }
  }
}
</style>
