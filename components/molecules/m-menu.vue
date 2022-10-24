<template>
  <div class="m-menu sf-mega-menu bg-white">
    <SfMegaMenu
      ref="menu"
      :title="title"
      :visible="visible"
    >
      <SfMegaMenuColumn :title="$t('Custom Plush Products')">
        <SfList>
          <SfListItem
            v-for="item in customPlushProductsItems"
            :key="item.label"
          >
            <router-link
              :to="item.link"
              @click.native="$emit('close')"
            >
              <SfMenuItem :label="item.label" />
            </router-link>
          </SfListItem>
        </SfList>
      </SfMegaMenuColumn>

      <SfMegaMenuColumn :title="$t('Other Custom Products')">
        <SfList>
          <SfListItem
            v-for="item in otherCustomProductsItems"
            :key="item.label"
          >
            <router-link
              :to="item.link"
              @click.native="$emit('close')"
            >
              <SfMenuItem :label="item.label" />
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
              :to="item.link"
              :target="item.target"
              @click.native="$emit('close')"
            >
              <SfMenuItem :label="item.label" />
            </router-link>
          </SfListItem>
        </SfList>
      </SfMegaMenuColumn>
    </SfMegaMenu>
  </div>
</template>
<script>
import { SfMegaMenu, SfList, SfMenuItem } from '@storefront-ui/vue';

export default {
  components: { SfMegaMenu, SfList, SfMenuItem },
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
      customPlushProductsItems: [
        {
          label: this.$t('Mascots'),
          link: '/mascot-stuffed-animals/'
        },
        {
          label: this.$t('Book Authors'),
          link: '/book-character-dolls/'
        },
        {
          label: this.$t('Brands & Logos'),
          link: '/branded-stuffed-animals/'
        },
        {
          label: this.$t('Non Profits'),
          link: '/non-profit-stuffed-animals/'
        },
        {
          label: this.$t('Shows & Events'),
          link: '/party-stuffed-animals/'
        },
        {
          label: this.$t('Promotional'),
          link: '/promotional-stuffed-animals/'
        },
        {
          label: this.$t('Art & Designs'),
          link: '/design-stuffed-animals/'
        },
        {
          label: this.$t('Crowdfund'),
          link: '/crowdfund-stuffed-animals/'
        }
      ],
      otherCustomProductsItems: [
        {
          label: this.$t('Custom Pillows'),
          link: '/custom-pillows/'
        },
        {
          label: this.$t('Custom Keychains'),
          link: '/custom-keychains/'
        }
      ],
      usefulLinksItems: [
        {
          label: this.$t('About'),
          link: '/about/'
        },
        {
          label: this.$t('How To Order'),
          link: '/how-to-order/'
        },
        {
          label: this.$t('Reviews'),
          link: '/reviews/'
        },
        {
          label: this.$t('Pricing'),
          link: '/custom-plush-pricing/'
        }
      ]
    }
  },
  async mounted () {
    await this.$nextTick();
    this.$refs.menu.active = this.$refs.menu.items;
    this.$refs.menu._computedWatchers.isMobile = undefined;
  }
}
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

  .sf-mega-menu__menu {
    @include for-desktop {
      flex-wrap: wrap;
      flex: 0 1 auto;
    }
  }

  .sf-mega-menu__content {
    @include for-desktop {
      --mega-menu-content-padding: var(--spacer-xl) var(--spacer-sm);
    }
  }

  .sf-bar {
    display: none;
  }
}
</style>
