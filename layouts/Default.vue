<template>
  <div
    class="default-layout"
    :class="{ 'storyblok-preview-mode': isStoryblokPreviewMode }"
  >
    <MLoader />

    <LazyHydrate
      never
      :trigger-hydration="shouldHydrateMobileMenu"
    >
      <OMobileMenu :menu-items="mobileMenuItems" />
    </LazyHydrate>

    <div id="viewport">
      <div class="_floating-elements">
        <PromotionPlatformBanner />
        <OTopNavigation />

        <LazyHydrate
          when-visible
        >
          <OHeader
            :navigation-items="headerItems"
            class="_main-header"
          />
        </LazyHydrate>
      </div>

      <div class="content">
        <slot />
      </div>

      <LazyHydrate when-visible>
        <OFooter
          class="default-layout_footer"
          :class="{ '-show-for-medium-up': hideFooterOnMobile }"
          :navigation-columns="footerItems"
        />
      </LazyHydrate>

      <LazyHydrate never :trigger-hydration="shouldHydrateModals">
        <OModal />
      </LazyHydrate>

      <ONotification />
      <MCookieNotification details-link="/privacy-policy" />
      <MOfflineBadge />
    </div>
    <vue-progress-bar />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import OHeader from 'theme/components/organisms/o-header';
import OFooter from 'theme/components/organisms/o-footer';
import OModal from 'theme/components/organisms/o-modal';
import OTopNavigation from 'theme/components/organisms/o-top-navigation';
import MLoader from 'theme/components/molecules/m-loader';
import ONotification from 'theme/components/organisms/o-notification';
import OMobileMenu from 'theme/components/organisms/o-mobile-menu';
import MCookieNotification from 'theme/components/molecules/m-cookie-notification';
import MOfflineBadge from 'theme/components/molecules/m-offline-badge';
import { isServer } from '@vue-storefront/core/helpers';
import Head from 'theme/head';
import config from 'config';
import { ModalList } from 'theme/store/ui/modals';
import getCurrentThemeClass from 'theme/helpers/get-current-theme-class';
import LazyHydrate from 'vue-lazy-hydration';
import { isStoryblokPreview, useStoryblokPageLayout } from 'src/modules/vsf-storyblok-module';

import PromotionPlatformBanner from 'src/modules/promotion-platform/components/Banner.vue';
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
  components: {
    PromotionPlatformBanner,
    OHeader,
    OFooter,
    MLoader,
    ONotification,
    MCookieNotification,
    MOfflineBadge,
    OTopNavigation,
    OModal,
    OMobileMenu,
    LazyHydrate
  },
  props: {
    previewPageLayoutStory: {
      type: Object,
      default: undefined
    }
  },
  setup ({ previewPageLayoutStory }, context) {
    return {
      ...useStoryblokPageLayout(context.root.$store, previewPageLayoutStory)
    }
  },
  data () {
    return {
      quicklink: null,
      shouldHydrateMobileMenu: false,
      shouldHydrateModals: false
    };
  },
  computed: {
    ...mapGetters('ui', ['activeModals']),
    quicklinkEnabled () {
      return (
        typeof config.quicklink !== 'undefined' && config.quicklink.enabled
      );
    },
    isStoryblokPreviewMode () {
      return isStoryblokPreview();
    },
    hideFooterOnMobile () {
      return this.$route.name === 'phrase-pillow-customize';
    },
    skinClass () {
      return getCurrentThemeClass();
    }
  },
  beforeMount () {
    this.$router.afterEach(() => {
      if (!isServer && this.quicklinkEnabled) {
        this.quicklink.listen();
      }
    });

    this.$bus.$on('offline-order-confirmation', this.onOrderConfirmation);
  },
  async mounted () {
    if (!isServer && this.quicklinkEnabled) {
      this.quicklink = require('quicklink');
      this.quicklink.listen();
    }
    this.$store.dispatch('ui/checkWebpSupport');

    await this.$nextTick();

    this.shouldHydrateMobileMenu = true;
  },
  beforeDestroy () {
    this.$bus.$off('offline-order-confirmation', this.onOrderConfirmation);
  },
  methods: {
    ...mapActions('ui', {
      openModal: 'openModal'
    }),
    onOrderConfirmation (payload) {
      this.openModal({ name: ModalList.OrderConfirmation, payload });
    }
  },
  watch: {
    activeModals (value) {
      if (value && !!value.length) {
        this.shouldHydrateModals = true;
      }
    }
  },
  metaInfo: Head
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.default-layout {
  $medium-breakpoint: 641px;

  &.storyblok-preview-mode {
    ::v-deep {
      a,
      button {
        pointer-events: none;
      }
    }
  }

  ._floating-elements {
    position: sticky;
    top: 0;
    z-index: 200;
    display: flex;
    flex-direction: column;
    max-height: 100vh;

    ._main-header {
      flex-grow: 1;
      flex-direction: column;
      overflow: hidden;
    }
  }

  @media (max-width: $medium-breakpoint - 1px) {
    .-show-for-medium-up {
      display: none !important;
    }
  }

  @include for-desktop {
    ._floating-elements {
      ._main-header {
        overflow: visible;
      }
    }
  }
}
</style>
