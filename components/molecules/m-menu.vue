<template>
  <div class="m-menu sf-mega-menu bg-white">
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
      <SfMegaMenuColumn
        :title="menuColumn.title"
        :key="menuColumn.title"
        :class="menuColumn.classes"
        v-for="menuColumn in menuItems"
      >
        <SfList>
          <SfListItem
            v-for="item in menuColumn.items"
            :key="item.title"
          >
            <router-link
              :to="item.url"
              @click.native="$emit('close')"
            >
              <SfMenuItem :label="item.title" icon="" />
            </router-link>
          </SfListItem>
        </SfList>
      </SfMegaMenuColumn>
    </SfMegaMenu>
  </div>
</template>
<script lang="ts">
import Vue, { PropType } from 'vue';
import { SfIcon, SfMegaMenu, SfList, SfMenuItem } from '@storefront-ui/vue';
import { NavigationColumn } from 'src/modules/vsf-storyblok-module';

export default Vue.extend({
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
    },
    menuItems: {
      type: Array as PropType<NavigationColumn[]>,
      required: true
    }
  },
  async mounted () {
    await this.$nextTick();

    const menu: any = this.$refs.menu;
    menu.active = menu.items;
    menu._computedWatchers.isMobile = undefined;
  },
  methods: {
    getScrollingElement () {
      return (this.$refs['menu'] as Vue).$el;
    }
  }
})
</script>
<style lang="scss">
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
.m-menu {
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

  ._item-link {
    &.-active {
      --menu-item-font-weight: bold;
    }
  }

  .sf-menu-item {
    --menu-item-label-color: var(--c-dark);
  }

  .sf-mega-menu {
    @include for-mobile {
      overflow: auto;
    }
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

  @include for-desktop {
    .sf-mega-menu__content {
      --mega-menu-content-padding: 0 var(--spacer-sm) var(--spacer-xl) var(--spacer-sm);
    }

    .sf-mega-menu__menu {
      flex-wrap: wrap;
      flex: 0 1 auto;
    }

    .sf-mega-menu-column {
      --mega-menu-margin: var(--spacer-xl) var(--spacer-2xl) 0 0;
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
