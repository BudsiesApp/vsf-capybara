<template>
  <div
    class="storyblok-remind-me-about-budsies layout-regular-component"
    :class="cssClasses"
    :style="styles"
  >
    <editor-block-icons :item="itemData" />

    <m-remind-me-about-budsies-form
      :button-text="buttonText"
      :input-placeholder="inputPlaceholder"
      :success-message="successMessage"
      :title="title"
    />
  </div>
</template>

<script lang="ts">
import { Blok } from 'src/modules/vsf-storyblok-module/components';
import MRemindMeAboutBudsiesForm from 'theme/components/molecules/m-remind-me-about-budsies-form.vue';

import RemindMeAboutBudsiesData from './interfaces/remind-me-about-budsies-data.interface';

export default Blok.extend({
  name: 'StoryblokRemindMeAboutBudsies',
  components: {
    MRemindMeAboutBudsiesForm
  },
  data () {
    return {
      email: '',
      date: null,
      isSubmitting: false,
      isSubmitted: false
    }
  },
  computed: {
    buttonText (): string {
      return this.itemData.button_text;
    },
    inputPlaceholder (): string {
      return this.itemData.input_placeholder;
    },
    itemData (): RemindMeAboutBudsiesData {
      return this.item as RemindMeAboutBudsiesData;
    },
    successMessage (): string {
      return this.itemData.success_message;
    },
    title (): string {
      return this.itemData.title;
    }
  }

})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "src/modules/vsf-storyblok-module/components/defaults/mixins";

.storyblok-remind-me-about-budsies {
  @include display-property-handling;
}
</style>
