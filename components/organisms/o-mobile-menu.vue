<template>
  <div
    class="o-mobile-menu"
    v-show="isMobileMenu"
    @click.self="onMenuCloseHandler"
    ref="mobile-menu"
  >
    <MMenu
      class="_mobile-menu mobile-only"
      @close="onMenuCloseHandler"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

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
        document.documentElement.style.overflow = 'hidden';

        this.$nextTick(() => {
          disableBodyScroll(this.$refs['mobile-menu']);
        })
      } else {
        document.documentElement.style.overflow = '';

        clearAllBodyScrollLocks();
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
  z-index: 250;
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.5);

  ._mobile-menu {
    position: relative;
    opacity: 1;
    visibility: visible;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    top: 0;
    height: 100%;
    max-width: 80%;
    --mega-menu-aside-menu-height: auto;

    &::v-deep {
      .sf-mega-menu__menu {
        overflow: visible;
      }
    }
  }
}
</style>
