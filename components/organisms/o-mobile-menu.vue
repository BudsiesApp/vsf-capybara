<template>
  <div
    class="o-mobile-menu"
    v-show="show"
    @click.self="onMenuCloseHandler"
  >
    <transition name="slide" @after-leave="show = false">
      <MMenu
        ref="mobile-menu"
        v-show="isMobileMenu"
        :menu-items="menuItems"
        class="_mobile-menu mobile-only"
        @close="onMenuCloseHandler"
      />
    </transition>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { mapState } from 'vuex'
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

import MMenu from '../molecules/m-menu.vue';
import { NavigationColumn } from 'src/modules/vsf-storyblok-module';

export default Vue.extend({
  name: 'OMobileMenu',
  props: {
    menuItems: {
      type: Array as PropType<NavigationColumn[]>,
      required: true
    }
  },
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
    },
    getMenuComponent (): InstanceType<typeof MMenu> | undefined {
      return (this.$refs['mobile-menu'] as InstanceType<typeof MMenu> | undefined);
    }
  },
  watch: {
    isMobileMenu (): void {
      if (this.isMobileMenu) {
        this.show = true;

        const scrollingElement = this.getMenuComponent()?.getScrollingElement();

        if (!scrollingElement) {
          return;
        }

        this.$nextTick(() => {
          disableBodyScroll(scrollingElement);
        })
      } else {
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
