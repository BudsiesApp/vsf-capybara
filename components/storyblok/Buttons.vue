<template>
  <div class="storyblok-buttons layout-regular-component" :style="styles" :class="cssClasses">
    <editor-block-icons :item="itemData" />

    <Button
      v-for="button in buttons"
      :key="button._uid"
      class="_button-item"
      :item="button"
    />
  </div>
</template>

<script lang="ts">
import { Blok } from 'src/modules/vsf-storyblok-module/components'

import Button from './Button.vue';

import ButtonItemData from './interfaces/button-item-data.interface';
import ButtonsData from './interfaces/buttons-data.interface';

export default Blok.extend({
  name: 'StoryblokButtons',
  components: {
    Button
  },
  computed: {
    itemData (): ButtonsData {
      return this.item as ButtonsData;
    },
    buttons (): ButtonItemData[] {
      return this.itemData.button_items;
    }
  }
})

</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "src/modules/vsf-storyblok-module/components/defaults/mixins";

.storyblok-buttons {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: center;
  gap: $storyblok-layout-standard-top-margin;
  width: 100%;

  ._button-item {
    display: inline-block;
  }

  &.-align-left {
    justify-content: start;
  }

  &.-align-center {
    justify-content: center;
  }

  &.-align-right {
    justify-content: end;
  }

  @include display-property-handling;
}
</style>
