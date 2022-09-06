<template>
  <div class="o-mobile-menu">
    <MMenu
      v-show="isMobileMenu"
      class="_mobile-menu mobile-only"
      @close="onMenuCloseHandler"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

import MMenu from '../molecules/m-menu.vue';

export default Vue.extend({
  name: 'OMobileMenu',
  components: {
    MMenu
  },
  computed: {
    ...mapState('ui', ['isMobileMenu'])
  },
  methods: {
    onMenuCloseHandler (): void {
      this.$store.commit('ui/closeMenu')
    }
  },
  watch: {
    isMobileMenu (): void {
      if (this.isMobileMenu) {
        // we can't add this style to body because sfui also add/remove overflow to body and there may be conflict
        document.documentElement.style.overflow = 'hidden'
      } else {
        document.documentElement.style.overflow = ''
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.o-mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 12;
  height: 100%;

  ._mobile-menu {
    position: relative;
    opacity: 1;
    visibility: visible;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    top: var(--bottom-navigation-height);
    height: calc(100% - var(--bottom-navigation-height));
    --mega-menu-aside-menu-height: auto;

    &::v-deep {
      .sf-mega-menu__menu {
        overflow: visible;
      }
    }
  }
}
</style>
