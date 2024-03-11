<template>
  <SfTab
    :title="itemData.title"
    ref="tab"
  >
    <div
      class="storyblok-tab layout-regular-component"
      :class="cssClasses"
      :style="styles"
    >
      <editor-block-icons :item="itemData" />

      <sb-render
        v-for="(_item) in itemData.items"
        :key="_item._uid"
        :parent-scope-id="scopeId"
        class="box _item"
        :item="_item"
      />
    </div>
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
      return this.$refs.tab as InstanceType<typeof SfTab>;
    },
    onTabToggle (): void {
      this.$parent.$emit('toggle', (this as any)._uid);
    }
  }
})

</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "src/modules/vsf-storyblok-module/components/defaults/mixins";

.storyblok-tab {
  @include storyblok-sub-elements-layout;
  @include display-property-handling;

}
</style>
