<template>
  <div
    class="o-mobile-menu"
    v-show="show"
    @click.self="onMenuCloseHandler"
    ref="mobile-menu"
  >
    <transition name="slide" @after-leave="show = false">
      <MMenu
        v-show="isMobileMenu"
        class="_mobile-menu mobile-only"
        @close="onMenuCloseHandler"
      />
    </transition>
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
  data () {
    return {
      show: false
    };
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
        this.show = true;

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

  .slide-enter-active,
  .slide-leave-active {
      transition: all 0.25s linear 0s;
  }

  .slide-enter,
  .slide-leave-to  {
      transform: translateX(-100%);
  }

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
