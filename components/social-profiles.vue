<template>
  <div v-if="profiles.length" class="social-profiles" :class="`social-profiles--${iconSet}`">
    <a
      v-for="profile in profiles"
      :key="profile.id"
      class="social-profiles__link"
      :href="profile.url"
      :aria-label="label(profile)"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span class="social-profiles__icon">
        <img :src="icons[iconSet][profile.network]" alt="">
      </span>
      <div v-if="profile.count !== null" class="social-profiles__count">
        <SfIcon class="social-profiles__count-icon" icon="profile_fill" size="0.85em" aria-hidden="true" />
        {{ profile.count }}
      </div>
    </a>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { SfIcon } from '@storefront-ui/vue';
import { useStore } from '@vue-storefront/core/application-services';
import { currentStoreView } from '@vue-storefront/core/lib/multistore';
import { GET_SOCIAL_PROFILES_GETTER, SocialNetwork } from 'src/modules/social-profiles';
import type { SocialProfile } from 'src/modules/social-profiles';

import circledFacebook from '../assets/social-icons/circled/facebook.svg';
import circledInstagram from '../assets/social-icons/circled/instagram.svg';
import circledPinterest from '../assets/social-icons/circled/pinterest.svg';
import circledTikTok from '../assets/social-icons/circled/tiktok.svg';
import circledX from '../assets/social-icons/circled/x.svg';
import circledYouTube from '../assets/social-icons/circled/youtube.svg';
import plainFacebook from '../assets/social-icons/plain/facebook.svg';
import plainInstagram from '../assets/social-icons/plain/instagram.svg';
import plainPinterest from '../assets/social-icons/plain/pinterest.svg';
import plainTikTok from '../assets/social-icons/plain/tiktok.svg';
import plainX from '../assets/social-icons/plain/x.svg';
import plainYouTube from '../assets/social-icons/plain/youtube.svg';

type IconSet = 'circled' | 'plain';

const icons: Record<IconSet, Record<SocialNetwork, string>> = {
  circled: {
    [SocialNetwork.Facebook]: circledFacebook,
    [SocialNetwork.Instagram]: circledInstagram,
    [SocialNetwork.Pinterest]: circledPinterest,
    [SocialNetwork.TikTok]: circledTikTok,
    [SocialNetwork.X]: circledX,
    [SocialNetwork.YouTube]: circledYouTube
  },
  plain: {
    [SocialNetwork.Facebook]: plainFacebook,
    [SocialNetwork.Instagram]: plainInstagram,
    [SocialNetwork.Pinterest]: plainPinterest,
    [SocialNetwork.TikTok]: plainTikTok,
    [SocialNetwork.X]: plainX,
    [SocialNetwork.YouTube]: plainYouTube
  }
};

const names: Record<SocialNetwork, string> = {
  [SocialNetwork.Facebook]: 'Facebook',
  [SocialNetwork.Instagram]: 'Instagram',
  [SocialNetwork.Pinterest]: 'Pinterest',
  [SocialNetwork.TikTok]: 'TikTok',
  [SocialNetwork.X]: 'X',
  [SocialNetwork.YouTube]: 'YouTube'
};

export default defineComponent({
  name: 'SocialProfiles',
  components: { SfIcon },
  props: {
    iconSet: {
      type: String as PropType<IconSet>,
      default: 'circled',
      validator: (value: string) => ['circled', 'plain'].includes(value)
    }
  },
  setup () {
    const store = useStore();
    const profiles = computed<SocialProfile[]>(() => store.getters[GET_SOCIAL_PROFILES_GETTER]);

    return { profiles, icons };
  },
  methods: {
    label (profile: SocialProfile): string {
      const values = {
        brand: currentStoreView().name,
        network: names[profile.network],
        count: profile.count,
        noun: profile.network === SocialNetwork.YouTube ? this.$t('subscribers') : this.$t('followers')
      };
      return String(profile.count === null
        ? this.$t('{brand} {network} page, opens in new tab', values)
        : this.$t('{brand} {network} page, {count} {noun}, opens in new tab', values));
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

$single-row-min-width: 390px;

.social-profiles {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  justify-items: var(--social-profiles-justify-items, center);
  width: fit-content;
  max-width: 100%;
  gap: var(--spacer-xs);
  margin: var(--social-profiles-margin, 0 auto);
  padding: var(--spacer-sm) 0 0;

  @media (max-width: $single-row-min-width - 1px) {
    &:has(> :nth-child(6)) {
      grid-auto-flow: row;
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &__link {
    display: flex;
    align-items: var(--social-profiles-justify-items, center);
    flex-direction: column;
    color: var(--c-light-variant);
    font-size: var(--font-xs);

    &:focus-visible {
      outline: 2px solid white;
      outline-offset: 2px;
    }
  }

  &__icon {
    display: block;
    width: var(--social-profiles-icon-size, 30px);
    height: var(--social-profiles-icon-size, 30px);
    overflow: hidden;

    img {
      display: block;
      width: 100%;
      height: 100%;
    }
  }

  &__count {
    display: flex;
    align-items: center;
    gap: 3px;
  }

  &__count-icon {
    --icon-color: currentColor;
    flex: none;
  }

  @include for-desktop {
    gap: var(--spacer-sm);
    padding: var(--spacer-sm) 0 var(--spacer-base);

    .social-profiles__icon {
      width: var(--social-profiles-icon-size, 42px);
      height: var(--social-profiles-icon-size, 42px);
    }

    &--circled .social-profiles__icon img {
      width: calc(100% + 2px);
      height: calc(100% + 2px);
      margin: -1px;
    }
  }
}
</style>
