<template>
  <div class="m-expandable-section" :class="{ '-expanded': isExpanded }">
    <div
      class="_header"
      role="button"
      :tabindex="0"
      :aria-expanded="isExpanded"
      :aria-controls="bodyId"
      @click="toggle"
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
    expanded: {
      type: Boolean,
      default: false
    }
  },
  setup (props) {
    const isExpanded = ref(props.expanded);
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
  ._header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    user-select: none;
  }

  ._title {
    font-weight: var(--font-semibold);
  }

  ._chevron {
    flex-shrink: 0;
    transition: rotate 300ms ease-in-out;
  }

  ._body {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 300ms ease-in-out;
    will-change: grid-template-rows;
    visibility: hidden;
  }

  ._body-inner {
    overflow: hidden;
    min-height: 0;
  }

  &.-expanded {
    ._chevron {
      rotate: 180deg;
    }

    ._body {
      grid-template-rows: 1fr;
      visibility: visible;
      margin-top: var(--spacer-sm);
    }
  }
}
</style>
