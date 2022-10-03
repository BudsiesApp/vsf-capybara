<template>
  <div class="m-menu sf-mega-menu bg-white">
    <SfList>
      <SfListItem
        v-for="item in menuItems"
        :key="item.label"
        class="_list-item"
      >
        <router-link
          :to="item.link"
          class="_link"
          @click.native="$emit('close')"
        >
          {{ item.label }}
        </router-link>
      </SfListItem>
    </SfList>
  </div>
</template>
<script>
import { SfList } from '@storefront-ui/vue';

export default {
  components: { SfList },
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
      menuItems: [
        {
          label: this.$t('About'),
          link: '/about/'
        },
        {
          label: this.$t('Custom Plush'),
          link: '/stuffed-animals/'
        },
        {
          label: this.$t('Custom Pillows'),
          link: '/custom-pillows/'
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

  ._list-item {
    --list-item-color: var(--c-white);
    --list-item-border: none;
    --list-item-padding: var(--spacer-xs) var(--spacer-sm);
    background-color: var(--c-primary);
    font-family: var(--font-family-primary);

    &:hover {
      background-color: var(--c-light);
    }

    &:first-child {
      border-top-left-radius: 5px;
      border-top-right-radius: 5px;
    }

    &:last-child {
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
    }
  }

  ._link {
    color: var(--c-white);
  }
}
</style>
