<template>
  <div class="a-ordered-heading">
    <SfHeading>
      <template #title="{title}">
        <component
          :is="`h${level}`"
          class="sf-heading__title"
          :class="level > 1 && `sf-heading__title--h${level}`"
        >
          {{ `${order}. ${title}` }}
        </component>
      </template>
    </SfHeading>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { SfHeading } from '@storefront-ui/vue';

export default Vue.extend({
  name: 'AOrderedHeading',
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
    },
    order: {
      type: Number,
      required: true
    }
  },
  components: {
    SfHeading
  }
})
</script>
