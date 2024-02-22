<template>
  <SfTab
    class="storyblok-tab layout-regular-component"
    :title="itemData.title"
    ref="tab"
  >
    <template>
      <editor-block-icons :item="itemData" />

      <sb-render
        v-for="(_item) in itemData.items"
        :key="_item._uid"
        :parent-scope-id="scopeId"
        class="box _item"
        :item="_item"
      />
    </template>
  </SfTab>
</template>

<script lang="ts">
import { Blok } from 'src/modules/vsf-storyblok-module/components'

import { TabItemData } from './interfaces/tab-item-data.interface';
import SfTab from '@storefront-ui/vue/src/components/organisms/SfTabs/_internal/SfTab.vue';

export default Blok.extend({
  name: 'StoryblokTab',
  components: {
    SfTab
  },
  computed: {
    itemData (): TabItemData {
      return this.item as TabItemData;
    },
    scopeId (): string {
      return (this.$options as any)._scopeId;
    },
    isActive: {
      get (): boolean {
        return this.getTab().isActive;
      },
      set (value: boolean) {
        this.getTab().isActive = value;
      }
    }
  },
  mounted (): void {
    this.$on('toggle', this.onTabToggle);
  },
  methods: {
    getTab (): InstanceType<typeof SfTab> {
      return this.$refs.tab;
    },
    onTabToggle (): void {
      this.$parent.$emit('toggle', (this as any)._uid);
    }
  }
})

</script>
