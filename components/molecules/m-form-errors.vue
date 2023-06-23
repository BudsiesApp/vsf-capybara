<template>
  <div class="m-form-errors" v-if="hasErrors">
    <ul class="_list">
      <li class="_item"
          v-for="(errors, key) in filteredErrors"
          :key="key"
          @click="$emit('item-click', key)"
      >
        {{ errors[0] }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Dictionary } from 'src/modules/budsies';
import Vue, { PropType } from 'vue';

export default Vue.extend({
  name: 'MFormErrors',
  props: {
    formErrors: {
      type: Object as PropType<Dictionary<string[]>>,
      default: () => {
        const defaultFormErrors: Dictionary<string[]> = {};
        return defaultFormErrors;
      }
    }
  },
  computed: {
    filteredErrors (): Dictionary<string[]> {
      const errors: Dictionary<string[]> = {};

      for (const key in this.formErrors) {
        const element = this.formErrors[key];

        if (!element || !element.length) {
          continue;
        }

        errors[key] = element;
      }

      return errors;
    },
    hasErrors (): boolean {
      return !!Object.keys(this.filteredErrors).length;
    }
  }
})
</script>

<style lang="scss" scoped>
.m-form-errors {
  color: var(--c-danger-variant);
  text-align: center;

  ._list {
    list-style: none;
    padding: 0;

    ._item {
      margin-top: var(--spacer-xs);
      cursor: pointer;

      &:first-child {
        margin-top: 0;
      }
    }
  }
}
</style>
