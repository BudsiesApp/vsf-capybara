<template>
  <div
    class="storyblok-tabs layout-regular-component"
    :style="styles"
    :class="cssClasses"
  >
    <editor-block-icons :item="itemData" />

    <SfTabs class="_tabs">
      <Tab
        v-for="tab in tabs"
        :key="tab._uid"
        :item="tab"
      />
    </SfTabs>
  </div>
</template>

<script lang="ts">
import { SfTabs } from '@storefront-ui/vue';

import { Blok } from 'src/modules/vsf-storyblok-module/components'

import { TabsData } from './interfaces/tabs-data.interface';
import { TabItemData } from './interfaces/tab-item-data.interface';

import Tab from './Tab.vue';

export default Blok.extend({
  name: 'StoryblokTabs',
  components: {
    SfTabs,
    Tab
  },
  computed: {
    itemData (): TabsData {
      return this.item as TabsData;
    },
    tabs (): TabItemData[] {
      return this.itemData.tabs;
    }
  }
})

</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "src/modules/vsf-storyblok-module/components/defaults/mixins";

.storyblok-tabs {
  @include display-property-handling;

  ._tabs {
    ::v-deep {
      .sf-tabs__title {
        pointer-events: all;
      }
    }
  }
}
</style>
