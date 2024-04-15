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
        :title="$t('Plush Products')"
      >
        <SfList>
          <SfListItem
            v-for="item in customProductsItems"
            :key="item.label"
          >
            <router-link
              :to="item.url"
              @click.native="$emit('close')"
            >
              <SfMenuItem :label="item.label" icon="" />
            </router-link>
          </SfListItem>
        </SfList>
      </SfMegaMenuColumn>

      <SfMegaMenuColumn
        :title="$t('Apparel')"
      >
        <SfList>
          <SfListItem
            v-for="item in accessoriesItems"
            :key="item.label"
          >
            <router-link
              :to="item.url"
              @click.native="$emit('close')"
            >
              <SfMenuItem :label="item.label" icon="" />
            </router-link>
          </SfListItem>
        </SfList>
      </SfMegaMenuColumn>

      <SfMegaMenuColumn
        :title="$t('Household & Accessories')"
      >
        <SfList>
          <SfListItem
            v-for="item in householdItems"
            :key="item.label"
          >
            <router-link
              :to="item.url"
              @click.native="$emit('close')"
            >
              <SfMenuItem :label="item.label" icon="" />
            </router-link>
          </SfListItem>
        </SfList>
      </SfMegaMenuColumn>

      <SfMegaMenuColumn
        :title="$t('Other Products')"
      >
        <SfList>
          <SfListItem
            v-for="item in otherProductsItems"
            :key="item.label"
          >
            <router-link
              class="_item-link"
              :to="item.url"
              :class="{'-active': item.isActive && item.isActive()}"
              @click.native="$emit('close')"
            >
              <SfMenuItem :label="item.label" icon="" />
            </router-link>
          </SfListItem>
        </SfList>
      </SfMegaMenuColumn>

      <SfMegaMenuColumn
        :title="$t('Other Useful Links')"
        class="mobile-only"
      >
        <SfList>
          <SfListItem
            v-for="item in usefulLinksItems"
            :key="item.label"
          >
            <router-link
              class="_item-link"
              :to="item.url"
              :target="item.target"
              @click.native="$emit('close')"
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
import Vue from 'vue';
import { SfIcon, SfMegaMenu, SfList, SfMenuItem } from '@storefront-ui/vue';

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
    }
  },
  data () {
    return {
      customProductsItems: [
        {
          label: this.$t('Budsies'),
          url: '/budsies-services/'
        },
        {
          label: this.$t('Selfies'),
          url: '/selfies-services/'
        },
        {
          label: this.$t('Puppets'),
          url: '/custom-puppets/'
        },
        {
          label: this.$t('Petsies'),
          url: '/petsies/'
        },
        {
          label: this.$t('Specialty Commissions'),
          url: '/commissions/'
        }
      ],
      householdItems: [
        {
          label: this.$t('Pillows'),
          url: '/custom-pillows/'
        },
        {
          label: this.$t('Blankets'),
          url: {
            name: 'cut-out-blankets'
          }
        },
        {
          label: this.$t('Keychains'),
          url: {
            name: 'printed-keychains-creation-page'
          }
        },
        {
          label: this.$t('Bobbleheads & Figurines'),
          url: '/bobblehead-figurines/'
        }
        // {
        //   label: this.$t('Pet Portraits'),
        //   url: {
        //     name: 'photo-portraits-creation-page'
        //   }
        // }
      ],
      accessoriesItems: [
        {
          label: this.$t('Socks'),
          url: {
            name: 'printed-socks-creation-page'
          }
        },
        {
          label: this.$t('Pajamas'),
          url: '/pajamas/index/create/'
        },
        {
          label: this.$t('Shirts'),
          url: '/custom-shirts/'
        }
      ],
      otherProductsItems: [
        {
          label: this.$t('Gift Cards'),
          url: '/giftcards/'
        },
        {
          label: this.$t('Gift Boxes'),
          url: {
            name: 'giftbox'
          },
          isActive: () => {
            return this.$route.name === 'configurable-product' &&
             this.$route.params?.parentSku === 'gift_box';
          }
        },
        {
          label: this.$t('Budsies Pals'),
          url: '/budsiespals/'
        },
        {
          label: this.$t('Bulk Orders'),
          url: '/plush-production/'
        }
      ],
      usefulLinksItems: [
        {
          label: this.$t('Pricing'),
          url: '/pricing/'
        },
        {
          label: this.$t('About'),
          url: '/about/'
        },
        {
          label: this.$t('FAQ\'s'),
          url: '//support.budsies.com/',
          target: '_blank'
        },

        {
          label: this.$t('Blog'),
          url: '/blog/',
          target: '_blank'
        },
        {
          label: this.$t('Reviews'),
          url: '/reviews/'
        }
      ]
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
