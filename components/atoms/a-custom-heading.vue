<template>
  <div class="a-custom-heading">
    <SfHeading :title="title" :level="level" :subtitle="subtitle" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { SfHeading } from '@storefront-ui/vue';

export default Vue.extend({
  name: 'ACustomHeading',
  components: {
    SfHeading
  },
  props: {
    level: {
      type: Number,
      default: 2
    },
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    }
  }
})
</script>

<style lang="scss" scoped>
.a-custom-heading {
  overflow: hidden;
  padding: var(--heading-padding, var(--spacer-xs) 0 0 0);

  ::v-deep {
    .sf-heading__title {
      display: flex;
      justify-content: center;
      align-items: center;
      white-space: nowrap;

      &::before,
      &::after {
        background: var(--heading-title-color, var(--c-text));
        content: "";
        height: 1px;
        width: 100%;
      }

      &::before {
        margin-right: var(--spacer-sm);
      }

      &::after {
        margin-left: var(--spacer-sm);
      }
    }
  }
}
</style>
