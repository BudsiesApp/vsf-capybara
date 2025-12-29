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
        :title="$t('Custom Pet Lookalikes')"
      >
        <SfList>
          <SfListItem
            v-for="item in customProductsItems"
            :key="item.label"
            class="_menu-item"
            @mouseenter.native="hoveredItem = item"
            @mouseleave.native="hoveredItem = null"
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
        :title="$t('Household')"
      >
        <SfList>
          <SfListItem
            v-for="item in householdItems"
            :key="item.label"
            class="_menu-item"
            @mouseenter.native="hoveredItem = item"
            @mouseleave.native="hoveredItem = null"
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
        :title="$t('Apparel and Accessories')"
      >
        <SfList>
          <SfListItem
            v-for="item in accessoriesItems"
            :key="item.label"
            class="_menu-item"
            @mouseenter.native="hoveredItem = item"
            @mouseleave.native="hoveredItem = null"
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
            :class="item.class ? item.class : ''"
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

      <template #aside>
        <BaseImage
          v-if="hoveredItemThumbnail"
          :src="hoveredItemThumbnail"
          :aspect-ratio="1.0"
          alt=""
          class="_menu-item-thumbnail desktop-only"
        />
      </template>
    </SfMegaMenu>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import { SfIcon, SfMegaMenu, SfList, SfMenuItem } from '@storefront-ui/vue';

import { productThumbnailPath, getThumbnailPath } from '@vue-storefront/core/helpers'

import { BaseImage } from 'src/modules/budsies';

export default Vue.extend({
  components: {
    BaseImage,
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
    const productThumbnailData = {
      ForeversCat: {
        image: '/s/t/stuffed_animal_of_your_cat.jpg'
      },
      Figurines: {
        image: '/f/i/figurine-husky.png'
      },
      FeltedMagnets: {
        image: '/y/e/yes_3462694_the_miami_aussie_ig_1.jpeg'
      }
    };

    return {
      customProductsItems: [
        {
          label: this.$t('Petsies Stuffed Animals'),
          url: '/forevers-pet-plush/',
          thumbnail: getThumbnailPath(productThumbnailPath(productThumbnailData.ForeversCat), 320, 320)
        },
        {
          label: this.$t('Petsies Huggables'),
          url: '/huggables/',
          thumbnail: getThumbnailPath(productThumbnailPath(productThumbnailData.Figurines), 320, 320)
        },
        {
          label: this.$t('Golf Club Headcovers'),
          url: '/golf-headcovers/',
          thumbnail: getThumbnailPath(productThumbnailPath(productThumbnailData.FeltedMagnets), 320, 320)
        },
        {
          label: this.$t('Bobbleheads & Figurines'),
          url: '/pet-bobblehead-figurines/',
          thumbnail: getThumbnailPath(productThumbnailPath(productThumbnailData.Figurines), 320, 320)
        },
        {
          label: this.$t('Magnets'),
          url: {
            name: 'felted-magnets-creation-page'
          },
          thumbnail: getThumbnailPath(productThumbnailPath(productThumbnailData.FeltedMagnets), 320, 320)
        },
        {
          label: this.$t('Ornaments'),
          url: {
            name: 'felted-ornaments-creation-page'
          },
          thumbnail: getThumbnailPath(productThumbnailPath(productThumbnailData.Figurines), 320, 320)
        }
      ],
      householdItems: [
        {
          label: this.$t('Pet Shaped Pillows'),
          url: '/pet-pillow/',
          thumbnail: getThumbnailPath(productThumbnailPath(productThumbnailData.ForeversCat), 320, 320)
        },
        {
          label: this.$t('Square Photo Pillows'),
          url: {
            name: 'category',
            params: {
              slug: 'photo-pillows-designs'
            }
          },
          thumbnail: getThumbnailPath(productThumbnailPath(productThumbnailData.Figurines), 320, 320)
        },
        {
          label: this.$t('Pet Photo Blankets'),
          url: {
            name: 'cut-out-blankets'
          },
          thumbnail: getThumbnailPath(productThumbnailPath(productThumbnailData.FeltedMagnets), 320, 320)
        },
        {
          label: this.$t('Renaissance Blankets'),
          url: {
            name: 'renaissance-blankets'
          },
          thumbnail: getThumbnailPath(productThumbnailPath(productThumbnailData.ForeversCat), 320, 320)
        },
        {
          label: this.$t('Pet Portraits'),
          url: {
            name: 'photo-portraits-creation-page'
          },
          thumbnail: getThumbnailPath(productThumbnailPath(productThumbnailData.Figurines), 320, 320)
        }
      ],
      accessoriesItems: [
        {
          label: this.$t('Socks'),
          url: {
            name: 'printed-socks-creation-page'
          },
          thumbnail: getThumbnailPath(productThumbnailPath(productThumbnailData.FeltedMagnets), 320, 320)
        },
        {
          label: this.$t('Pajamas'),
          url: {
            name: 'pajamas-creation'
          },
          thumbnail: getThumbnailPath(productThumbnailPath(productThumbnailData.ForeversCat), 320, 320)
        },
        // {
        //   label: this.$t('Hawaiian Shirts'),
        //   url: {
        //     name: 'hawaiian-shirts-creation'
        //   }
        // },
        {
          label: this.$t('Golf Shirts'),
          url: {
            name: 'golf-shirts-creation'
          },
          thumbnail: getThumbnailPath(productThumbnailPath(productThumbnailData.Figurines), 320, 320)
        },
        // {
        //   label: this.$t('Face Masks'),
        //   url: {
        //     name: 'printed-masks-creation-page'
        //   }
        // },
        {
          label: this.$t('Pet Keychains'),
          url: {
            name: 'printed-keychains-creation-page'
          },
          thumbnail: getThumbnailPath(productThumbnailPath(productThumbnailData.ForeversCat), 320, 320)
        },
        {
          label: this.$t('Tumblers'),
          url: {
            name: 'tumblers-creation'
          },
          thumbnail: getThumbnailPath(productThumbnailPath(productThumbnailData.Figurines), 320, 320)
        }
      ],
      otherProductsItems: [
        {
          label: this.$t('Gift Cards'),
          url: {
            name: 'gift-cards'
          },
          class: 'mobile-only'
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
          label: this.$t('Gift Add-ons'),
          url: {
            name: 'category',
            params: {
              slug: 'petsies-accessories'
            }
          }
        },
        {
          label: this.$t('Bulk Orders'),
          url: '/bulk-custom-stuffed-animal-manufacture/'
        }
      ],
      usefulLinksItems: [
        {
          label: this.$t('Pricing'),
          url: '/pricing/'
        },
        {
          label: this.$t('About'),
          url: '/about-petsies/'
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
      ],
      hoveredItem: null
    }
  },
  computed: {
    hoveredItemThumbnail () {
      if (!this.hoveredItem) {
        return;
      }

      return this.hoveredItem.thumbnail;
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
      flex: 4;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
    }

    .sf-mega-menu__aside {
       --mega-menu-section-flex: 1;
       --mega-menu-aside-content-padding: var(--spacer-xl) var(--spacer-xl) 0 0;
    }

    .sf-mega-menu-column {
      --mega-menu-margin: var(--spacer-xl) var(--spacer-xl) 0 0;
      --list-item-margin: var(--spacer-base) 0 0 0;

      white-space: nowrap;
    }

    ._menu-item {
      position: relative;
      display: flex;
      align-items: center;

      &:hover {
        ._menu-item-thumbnail {
          display: block;
        }
      }
    }
  }

  @media (min-width: 1256px) {
    .sf-mega-menu__menu {
      grid-template-columns: 1fr 1fr 1fr 1fr;
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
