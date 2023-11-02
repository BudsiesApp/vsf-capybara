<template>
  <div id="app">
    <component :is="layout">
      <router-view />
    </component>
  </div>
</template>

<script>
import get from 'lodash-es/get'
import config from 'config';

import DefaultLayout from './layouts/Default'
import MinimalLayout from './layouts/Minimal'
import { ModalList } from './store/ui/modals';

import { FileProcessingRepositoryFactory, ImageHandlerService, itemFactory } from 'src/modules/file-storage'
import { ErrorConverterService } from 'src/modules/budsies'
import { isServer } from '@vue-storefront/core/helpers'
import { syncCartWhenLocalStorageChange } from '@vue-storefront/core/modules/cart/helpers'
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'
import { USER_LEAVING_WEBSITE } from 'src/modules/promotion-platform';

const windowObject = isServer ? {} : window;
const errorConverterService = new ErrorConverterService();
const fileProcessingRepositoryFactory = new FileProcessingRepositoryFactory(
  itemFactory
);
const imageHandlerService = new ImageHandlerService(
  config.images.imageHandlerServiceUrl
)

export default {
  components: {
    DefaultLayout,
    MinimalLayout
  },
  computed: {
    layout () {
      return `${get(this.$route, 'meta.layout', 'default')}-layout`
    }
  },
  mounted () {
    syncCartWhenLocalStorageChange.addEventListener();
    EventBus.$on(USER_LEAVING_WEBSITE, this.onUserLeavingWebsite)
  },
  beforeDestroy () {
    syncCartWhenLocalStorageChange.removeEventListener();
    EventBus.$off(USER_LEAVING_WEBSITE, this.onUserLeavingWebsite);
  },
  serverPrefetch () {
    return this.$store.dispatch('backend-settings/fetchSettings');
  },
  provide: {
    ErrorConverterService: errorConverterService,
    FileProcessingRepositoryFactory: fileProcessingRepositoryFactory,
    ImageHandlerService: imageHandlerService,
    WindowObject: windowObject
  },
  methods: {
    onUserLeavingWebsite () {
      this.$store.dispatch('ui/openModal', { name: ModalList.WebsiteLeaving })
    }
  }
};
</script>

<style lang="scss">
@import "~@storefront-ui/vue/styles";
</style>

<style lang="scss">
@import "./css/main";

html {
  font-size: var(--font-size-base);
}

body {
  @import "./css/components";

  --overlay-z-index: 1;
  --sidebar-aside-z-index: 2;
  --sidebar-z-index: 2;
  --bottom-navigation-height: 3.75rem;
  --bar-height: 3.125rem;
  --notification-font-size: var(--font-sm);

  font-family: var(--font-family-secondary);
  font-weight: var(--font-normal);
  line-height: #{$line-height-base};
  margin: 0;
  padding: 0;
  color: var(--c-text);

  a {
    text-decoration: none;
    color: var(--c-link);
    cursor: pointer;

    &:hover {
      color: var(--c-link-hover);
    }
  }

  .truevault-polaris-privacy-notice {
    font-size: var(--font-xs);
  }
}

html,
body,
#app,
.default-layout {
  height: 100%;
}

#viewport {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  .content {
    display: flex;
    flex: 1 0 auto;
    flex-direction: column;
  }
  .o-footer {
    flex: 0 0 auto;
  }
}

@include for-desktop {
  .sidebar {
    &__microcart {
      --sidebar-aside-width: 700px;
    }
  }
}
</style>
