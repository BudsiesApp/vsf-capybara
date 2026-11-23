<template>
  <div
    v-if="hasProfiles"
    class="storyblok-social-profiles layout-regular-component"
    :class="cssClasses"
    :style="styles"
  >
    <editor-block-icons :item="itemData" />
    <social-profiles class="_profiles" :icon-set="itemData.icon_set || 'circled'" />
  </div>
</template>

<script lang="ts">
import { Blok } from 'src/modules/vsf-storyblok-module/components';
import { GET_SOCIAL_PROFILES_GETTER } from 'src/modules/social-profiles';
import SocialProfiles from '../social-profiles.vue';
import SocialProfilesData, { SocialProfilesSize } from './interfaces/social-profiles-data.interface';

const sizes: Record<SocialProfilesSize, string> = {
  small: '16px',
  medium: '32px',
  large: '42px'
};

export default Blok.extend({
  name: 'StoryblokSocialProfiles',
  components: { SocialProfiles },
  computed: {
    itemData (): SocialProfilesData {
      return this.item as SocialProfilesData;
    },
    hasProfiles (): boolean {
      return this.$store.getters[GET_SOCIAL_PROFILES_GETTER].length > 0;
    },
    extraStyles (): Record<string, string> {
      const desktopSize = sizes[this.itemData.desktop_size || 'medium'];

      const alignment = {
        left: { items: 'flex-start', margin: '0 auto 0 0' },
        center: { items: 'center', margin: '0 auto' },
        right: { items: 'flex-end', margin: '0 0 0 auto' }
      }[this.itemData.alignment] || { items: 'flex-start', margin: '0 auto 0 0' };

      return {
        '--social-profiles-color': this.itemData.color?.color || 'var(--c-text)',
        '--social-profiles-desktop-size': desktopSize,
        '--social-profiles-mobile-size': this.itemData.mobile_size ? sizes[this.itemData.mobile_size] : desktopSize,
        '--social-profiles-justify-items': alignment.items,
        '--social-profiles-margin': alignment.margin
      };
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "src/modules/vsf-storyblok-module/components/defaults/mixins";

.storyblok-social-profiles {
  --social-profiles-icon-size: var(--social-profiles-mobile-size);

  @include for-desktop {
    --social-profiles-icon-size: var(--social-profiles-desktop-size);
  }

  ::v-deep .social-profiles__link:focus-visible {
    outline: var(--c-black) auto 1px;
    outline: -webkit-focus-ring-color auto 1px;
    outline: AccentColor auto 1px;
    outline-offset: -1px;
  }

  &.-editor-preview-mode ._profiles {
    pointer-events: none;
  }

  @include display-property-handling;
}
</style>
