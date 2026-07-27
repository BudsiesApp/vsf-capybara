<template>
  <div class="m-expandable-section" :class="{ '-expanded': isExpanded }">
    <component
      :is="titleTag"
      class="_header"
    >
      <button
        class="_trigger"
        type="button"
        :aria-expanded="isExpanded ? 'true' : 'false'"
        :aria-controls="bodyId"
        @click.stop="toggle"
      >
        <slot name="title">
          <span class="_title">{{ title }}</span>
        </slot>

        <span aria-hidden="true" class="_chevron">
          <span class="_chevron-bar _chevron-bar-left" />
          <span class="_chevron-bar _chevron-bar-right" />
        </span>
      </button>
    </component>

    <div :id="bodyId" class="_body">
      <div class="_body-inner">
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

let instanceId = 0;

export default defineComponent({
  name: 'MExpandableSection',
  props: {
    title: {
      type: String,
      default: ''
    },
    titleTag: {
      type: String,
      default: 'div'
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
    margin: 0;
    padding: 0;
  }

  ._trigger {
    display: flex;
    align-items: center;
    justify-content: var(--expandable-section-header-hor-align, space-between);
    width: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    user-select: none;
  }

  ._title {
    font-weight: var(--font-semibold);
    font-size: var(--expandable-section-title-font-size);
  }

  ._chevron {
    position: var(--chevron-position, relative);
    width: var(--chevron-size, 1.25rem);
    height: var(--chevron-size, 1.25rem);
    flex-shrink: 0;
    cursor: pointer;
    transition: rotate 300ms ease-in-out;
  }

  ._chevron-bar {
    position: absolute;
    top: 50%;
    background: var(--chevron-background, transparent);
    transition: transform 300ms cubic-bezier(0.25, 1.7, 0.35, 0.8);

    &::after {
      content: "";
      display: block;
      width: calc(var(--chevron-size, 1.25rem) / 2);
      height: calc(var(--chevron-size, 1.25rem) / 10);
      background: var(--chevron-color, var(--c-black));
    }
  }

  ._chevron-bar-left {
    left: calc(var(--chevron-size, 1.25rem) / 10);
    transform: translate3d(
      var(--chevron-translateX, 0),
      var(--chevron-translateY, -50%),
      0
    )
      rotate(var(--chevron-rotate, 45deg));
  }

  ._chevron-bar-right {
    right: calc(var(--chevron-size, 1.25rem) / 10);
    transform: translate(
      var(--chevron-translateX, 0),
      var(--chevron-translateY, -50%)
    )
      rotate(calc(var(--chevron-rotate, 45deg) * -1));
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
      margin-top: var(--expandable-section-body-margin-top, var(--spacer-sm));
      transition: grid-template-rows 300ms ease-in-out, visibility 0s linear 0s;
    }
  }
}
</style>
