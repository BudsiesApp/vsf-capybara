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
  position: absolute;
  top: 100%;
  left: var(--spacer-sm);
  z-index: 12;
  border-radius: 5px;

  ._mobile-menu {
    position: relative;
    opacity: 1;
    visibility: visible;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    &::v-deep {
      .sf-mega-menu__menu {
        overflow: visible;
      }
    }
  }
}
</style>
