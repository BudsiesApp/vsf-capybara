<template>
  <div class="m-expandable-section" :class="{ '-expanded': isExpanded }">
    <div
      class="_header"
      role="button"
      :tabindex="0"
      :aria-expanded="isExpanded ? 'true' : 'false'"
      :aria-controls="bodyId"
      @click.stop="toggle"
      @keydown.enter.prevent="toggle"
      @keydown.space.prevent="toggle"
    >
      <slot name="title">
        <span class="_title">{{ title }}</span>
      </slot>

      <SfChevron class="_chevron" />
    </div>

    <div :id="bodyId" class="_body">
      <div class="_body-inner">
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api';
import { SfChevron } from '@storefront-ui/vue';

let instanceId = 0;

export default defineComponent({
  name: 'MExpandableSection',
  components: {
    SfChevron
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    initiallyExpanded: {
      type: Boolean,
      default: false
    }
  },
  setup (props) {
    const isExpanded = ref(props.initiallyExpanded);
    const id = `expandable-section-${instanceId++}`;
    const bodyId = `${id}-body`;

    function toggle () {
      isExpanded.value = !isExpanded.value;
    }

    return {
      isExpanded,
      toggle,
      bodyId
    };
  }
});
</script>

<style lang="scss" scoped>
.m-expandable-section {
  border-bottom: var(--expandable-section-border, none);
  padding: var(--expandable-section-padding, 0);

  ._header {
    display: flex;
    align-items: center;
    justify-content: var(--expandable-section-header-hor-align, space-between);
    cursor: pointer;
    user-select: none;
  }

  ._title {
    font-weight: var(--font-semibold);
    font-size: var(--expandable-section-title-font-size);
  }

  ._chevron {
    flex-shrink: 0;
    transition: rotate 300ms ease-in-out;
  }

  ._body {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 300ms ease-in-out, visibility 0s linear 300ms, margin-top 300ms linear;
    will-change: grid-template-rows, margin-top;
    visibility: hidden;
    padding: var(--expandable-section-body-padding, 0);
  }

  ._body-inner {
    overflow: hidden;
    min-height: 0;
  }

  &.-expanded {
    >._header {
      ._chevron {
        rotate: 180deg;
      }
    }

    >._body {
      grid-template-rows: 1fr;
      visibility: visible;
      margin-top: var(--spacer-sm);
      transition: grid-template-rows 300ms ease-in-out, visibility 0s linear 0s;
    }
  }
}
</style>
