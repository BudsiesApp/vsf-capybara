<template>
  <div
    class="m-make-your-own-dropdown"
    :class="{
      '-small': size === 'small',
      [skinClass]: true,
      '-open': isDropdownOpen
    }"
    @mouseover="toggleDropdownOnDesktop(true)"
    @mouseleave="toggleDropdownOnDesktop(false)"
  >
    <SfButton @click="toggleDropdownOnMobile(true)">
      Make your own
    </SfButton>
    <SfDropdown
      :is-open="isDropdownOpen"
      @click:close="toggleDropdownOnMobile(false)"
    >
      <SfList>
        <SfListItem v-for="action in dropdownActions" :key="action.label">
          <router-link
            @click.native="toggleDropdownOnMobile(false)"
            :to="action.url"
          >
            {{ action.label }}
          </router-link>
        </SfListItem>
      </SfList>

      <template #cancel>
        <SfButton
          class="sf-button--full-width sf-dropdown__cancel"
          @click="toggleDropdownOnMobile(false)"
        >
          Cancel
        </SfButton>
      </template>
    </SfDropdown>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { SfButton, SfDropdown, SfList } from '@storefront-ui/vue';
import {
  mapMobileObserver,
  unMapMobileObserver
} from '@storefront-ui/vue/src/utilities/mobile-observer';

import getCurrentThemeClass from 'theme/helpers/get-current-theme-class';

export default Vue.extend({
  name: 'MMakeYourOwnDropdown',
  props: {
    size: {
      type: String,
      default: ''
    }
  },
  components: {
    SfButton,
    SfDropdown,
    SfList
  },
  data () {
    return {
      dropdownActions: [
        {
          label: 'Budsies',
          url: '/budsies-services/'
        },
        {
          label: 'Selfies',
          url: '/selfies-services/'
        },
        {
          label: 'Puppets',
          url: '/custom-puppets/'
        },
        {
          label: 'Buddy Pillows',
          url: '/buddy-pillows/'
        },
        {
          label: 'Photo Pillows',
          url: '/photo-pillows/'
        },
        {
          label: this.$t('Shirts'),
          url: '/custom-shirts/'
        },
        {
          label: this.$t('Blankets'),
          url: {
            name: 'cut-out-blankets'
          }
        },
        {
          label: 'Socks',
          url: {
            name: 'printed-socks-creation-page'
          }
        },
        {
          label: 'Cartoon Pillows',
          url: '/plushie/index/cartoonPillows/'
        },
        {
          label: 'Keychains',
          url: {
            name: 'printed-keychains-creation-page'
          }
        },
        {
          label: 'Bobbleheads',
          url: '/bobbleheads/create/'
        },
        {
          label: 'Figurines',
          url: '/figurines/create/'
        },
        // {
        //   label: this.$t('Hawaiian Shirts'),
        //   url: {
        //     name: 'hawaiian-shirts-creation'
        //   }
        // },
        // {
        //   label: this.$t('Golf Shirts'),
        //   url: {
        //     name: 'golf-shirts-creation'
        //   }
        // },
        {
          label: this.$t('Pajamas'),
          url: {
            name: 'pajamas-creation'
          }
        },
        {
          label: 'Accessories',
          url: '/accessories/'
        },
        {
          label: 'Gift Boxes',
          url: {
            name: 'giftbox'
          }
        },
        {
          label: this.$t('Gift Cards'),
          url: '/purchase-gift-card/'
        }
      ],
      isDropdownOpen: false
    };
  },
  computed: {
    ...mapMobileObserver(),
    skinClass (): string {
      return getCurrentThemeClass();
    }
  },
  beforeDestroy (): void {
    unMapMobileObserver();
  },
  methods: {
    toggleDropdownOnMobile (shouldOpen: boolean) {
      if (!this.isMobile) {
        return;
      }

      this.isDropdownOpen = shouldOpen;
    },
    toggleDropdownOnDesktop (shouldOpen: boolean) {
      if (this.isMobile) {
        return;
      }

      this.isDropdownOpen = shouldOpen;
    }
  }
});
</script>

<style lang="scss" scoped>
.m-make-your-own-dropdown {
  position: relative;
  align-self: center;

  .sf-button {
    --button-font-size: var(--font-sm);
    --button-font-line-height: 1;
    --button-transition: box-shadow, border-radius 150ms ease-in-out;
  }

  .sf-dropdown {
    --dropdown-background: var(--c-primary);
    --c-link: var(--c-light-variant);
    --c-link-hover: var(--c-light-variant);
    --list-item-padding: var(--spacer-xs) var(--spacer-sm);

    .sf-list__item {
      &:hover {
        background-color: var(--c-light);
      }

      >a {
        width: 100%;
        display: block;
      }
    }
  }

  &.-small {
    .sf-button {
      --button-font-size: var(--font-2xs);
      --button-font-line-height: 1;
      --button-padding: calc(var(--spacer-2xs) * 3);
    }

    .sf-dropdown {
      left: 0;
    }
  }

  &.-skin-budsies {
    ::v-deep {
      .sf-dropdown__container {
        overflow: hidden;
        border-radius: 0 0 var(--button-border-radius-size) var(--button-border-radius-size);
      }
    }

    .sf-dropdown {
      .sf-list__item {
        &:hover {
          background-color: var(--c-primary-variant);
        }
      }
    }

    &.-open {
      .sf-button {
        --button-border-radius: var(--button-border-radius-size) var(--button-border-radius-size) 0 0;
      }
    }
  }
}
</style>
