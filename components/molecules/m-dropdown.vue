
<template>
  <SfDropdown
    class="m-dropdown"
    :is-open="isOpen"
    :title="title"
    ref="dropdown"
    @click:close="$emit('click:close')"
  >
    <div class="_content">
      <slot />
    </div>
  </SfDropdown>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks
} from 'body-scroll-lock';
import { SfDropdown } from '@storefront-ui/vue';
import { mapMobileObserver, unMapMobileObserver } from '@storefront-ui/vue/src/utilities/mobile-observer';

import { isServer } from '@vue-storefront/core/helpers';

export default Vue.extend({
  name: 'MDropdown',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    }
  },
  components: {
    SfDropdown
  },
  computed: {
    ...mapMobileObserver()
  },
  beforeDestroy (): void {
    this.enableBodyScroll();
    unMapMobileObserver();
  },
  methods: {
    enableBodyScroll () {
      const scrollableContainer = this.getScrollableContainer();

      if (!scrollableContainer) {
        clearAllBodyScrollLocks();
        return;
      }

      enableBodyScroll(scrollableContainer);
    },
    getScrollableContainer (): HTMLElement | undefined {
      const dropdown = this.$refs.dropdown as InstanceType<typeof SfDropdown> | undefined;
      if (!dropdown) {
        return;
      }

      return dropdown.$el.querySelector('.sf-dropdown__container') as HTMLElement | undefined;
    },
    toggleBodyScrollLock (): void {
      const scrollableContainer = this.getScrollableContainer();

      if (!scrollableContainer) {
        clearAllBodyScrollLocks();
        return;
      }

      if (this.isOpen && this.isMobile) {
        disableBodyScroll(scrollableContainer);
      } else {
        enableBodyScroll(scrollableContainer);
      }
    }
  },
  watch: {
    isOpen: {
      handler (): void {
        if (isServer) {
          return;
        }

        this.toggleBodyScrollLock();
      },
      immediate: true
    },
    isMobile: {
      handler (): void {
        if (isServer) {
          return;
        }

        this.toggleBodyScrollLock();
      },
      immediate: true
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.m-dropdown {
  ._content {
    overflow: auto;
    max-height: 100%;
  }

  ::v-deep {
    .sf-dropdown__container {
      max-height: 70vh;
      display: flex;
      flex-direction: column;
    }
  }

  @include for-desktop {
    ::v-deep {
      .sf-dropdown__container {
        max-height: unset;
        display: block;
      }
    }
  }
}
</style>
