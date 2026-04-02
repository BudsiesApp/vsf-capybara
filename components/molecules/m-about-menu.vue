<template>
  <div class="m-about-menu sf-mega-menu bg-white">
    <SfIcon
      class="desktop-only _close-icon"
      icon="cross"
      size="var(--font-sm)"
      color="gray-secondary"
      @click.native="$emit('close')"
    />

    <SfMegaMenu
      ref="menu"
      :title="title"
      :visible="visible"
    >
      <SfMegaMenuColumn :title="$t('About')">
        <SfList>
          <SfListItem
            v-for="item in aboutItems"
            :key="item.label"
          >
            <router-link
              :to="item.link"
              @click.native="emitClose"
            >
              <SfMenuItem :label="item.label" icon="" />
            </router-link>
          </SfListItem>
        </SfList>
      </SfMegaMenuColumn>
    </SfMegaMenu>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  nextTick,
  onMounted,
  ref
} from '@vue/composition-api';
import { SfIcon, SfMegaMenu, SfList, SfMenuItem } from '@storefront-ui/vue';

interface AboutItem {
  label: string,
  link: string
}

export default defineComponent({
  name: 'MAboutMenu',
  components: {
    SfIcon,
    SfMegaMenu,
    SfList,
    SfMenuItem
  },
  props: {
    visible: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: ''
    }
  },
  setup (_, { emit, refs, root }) {
    const menu = ref<any>(null);
    const aboutItems: AboutItem[] = [
      {
        label: root.$t('Who We Are').toString(),
        link: '/about/'
      },
      {
        label: root.$t('Fulfillment').toString(),
        link: '/fulfillment/'
      }
    ];

    const emitClose = (): void => {
      emit('close');
    };

    onMounted(async () => {
      await nextTick();

      menu.value = refs.menu;
      menu.value.active = menu.value.items;
      menu.value._computedWatchers.isMobile = undefined;
    });

    return {
      aboutItems,
      emitClose,
      menu
    };
  }
});
</script>

<style lang="scss">
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.m-about-menu {
  padding: 0;
  position: absolute;
  left: 0;
  width: 100%;
  top: 100%;
  z-index: 1;
  opacity: 0;
  visibility: hidden;
  transition: 0.2s;

  .router-link-active {
    --menu-item-font-weight: bold;
  }

  .sf-menu-item {
    --menu-item-label-color: var(--c-dark);
  }

  .sf-mega-menu {
    @include for-mobile {
      overflow: auto;
    }
  }

  .sf-mega-menu-column__title {
    display: none;
  }

  .sf-bar {
    display: none;
  }

  ._close-icon {
    cursor: pointer;
    position: absolute;
    right: var(--spacer-sm);
    top: var(--spacer-base);
    z-index: 3;
  }

  .sf-mega-menu-column__header {
    display: none;
  }

  @include for-desktop {
    .sf-mega-menu__content {
      --mega-menu-content-padding: 0 var(--spacer-sm) var(--spacer-xl) var(--spacer-sm);
    }

    .sf-mega-menu__menu {
      flex-wrap: wrap;
      flex: 0 1 auto;
    }

    .sf-mega-menu-column {
      --mega-menu-margin: calc(var(--spacer-base) - var(--spacer-xs)) var(--spacer-2xl) 0 0;
      --list-item-margin: var(--spacer-base) 0 0 0;
    }
  }

  @media (min-width: $desktop-min) and (max-height: $tablet-min) {
    --menu-item-font-size: var(--font-sm);
    --mega-menu-column-title-font-size: var(--font-sm);

    .sf-mega-menu__content {
      --mega-menu-content-padding: 0 var(--spacer-sm) var(--spacer-base) var(--spacer-sm);
    }

    .sf-mega-menu-column {
      --mega-menu-margin: var(--spacer-base) var(--spacer-2xl) 0 0;
      --list-item-margin: var(--spacer-sm) 0 0 0;
      --mega-menu-column-title-margin: 0 0 var(--spacer-sm) 0;
    }
  }
}
</style>
