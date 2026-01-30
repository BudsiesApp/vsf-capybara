<template>
  <div class="m-educators-menu">
    <SfList>
      <SfListItem v-for="item in educatorsItems" :key="item.label">
        <router-link :to="item.url" @click.native="$emit('close')">
          <SfMenuItem :label="item.label" icon="" />
        </router-link>
      </SfListItem>
    </SfList>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { SfList, SfMenuItem } from '@storefront-ui/vue';

export default Vue.extend({
  name: 'MEducatorsMenu',
  components: {
    SfList,
    SfMenuItem
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      educatorsItems: [
        {
          label: this.$t('Classroom Budsies'),
          url: {
            name: 'simple-product',
            params: {
              parentSku: 'classroomBudsie'
            }
          }
        },
        {
          label: this.$t('Classroom Selfies'),
          url: {
            name: 'simple-product',
            params: {
              parentSku: 'classroomSelfie'
            }
          }
        }
      ]
    }
  }
});
</script>

<style lang="scss" scoped>
.m-educators-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 200px;
  background: white;
  box-shadow: 0 4px 11px rgba(0, 0, 0, 0.1);
  padding: var(--spacer-sm);
  opacity: 0;
  visibility: hidden;
  transition: 0.2s;
  z-index: 1;

  .sf-menu-item {
    --menu-item-label-color: var(--c-dark);
    --list-item-margin: var(--spacer-base) 0 0 0;
    --menu-item-text-transform: none;

    white-space: nowrap;
  }
}
</style>
