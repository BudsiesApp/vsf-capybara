<template>
  <div
    class="collapsible-block layout-regular-component"
    :class="cssClasses"
    :style="styles"
  >
    <editor-block-icons :item="itemData" />

    <MExpandableSection
      :title="itemData.title"
      :title-tag="titleTag"
    >
      <div class="_content">
        <sb-render
          v-for="bodyItem in itemData.body"
          :key="bodyItem._uid"
          :parent-scope-id="scopeId"
          class="layout-regular-component"
          :item="bodyItem"
        />
      </div>
    </MExpandableSection>
  </div>
</template>

<script lang="ts">
import { Blok } from 'src/modules/vsf-storyblok-module/components';
import MExpandableSection from 'src/themes/petsies-capybara/components/molecules/m-expandable-section.vue';
import CollapsibleBlockData from './interfaces/collapsible-block-data.interface';

export default Blok.extend({
  name: 'StoryblokCollapsibleBlock',
  components: {
    MExpandableSection
  },
  computed: {
    itemData (): CollapsibleBlockData {
      return this.item as CollapsibleBlockData;
    },
    titleTag (): string {
      const titleLevel = Number(this.itemData.heading_type);

      if (titleLevel >= 1 && titleLevel <= 6) {
        return `h${titleLevel}`;
      }

      return 'h3';
    },
    scopeId (): string {
      return (this.$options as any)._scopeId;
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "src/modules/vsf-storyblok-module/components/defaults/mixins";

.collapsible-block {
  @include display-property-handling;

  ._content {
    @include storyblok-sub-elements-layout;
  }

  .m-expandable-section {
    --expandable-section-body-padding: 0;
    --expandable-section-body-margin-top: var(--spacer-base);
    --expandable-section-title-font-size: var(--h3-font-size);

    --expandable-section-border: var(--c-divider) solid 1px;
    --expandable-section-padding: var(--spacer-sm) 0;
  }

  & + & {
    margin-top: 0;
  }

  &.-editor-preview-mode {
    ::v-deep .m-expandable-section {
      ._header {
        pointer-events: none;
      }

      ._body {
        grid-template-rows: 1fr !important;
        visibility: visible !important;
        margin-top: var(--expandable-section-body-margin-top, var(--spacer-base));
      }
    }
  }
}
</style>
