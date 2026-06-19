<template>
  <div id="app">
    <a-organization-schema />
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
import AOrganizationSchema from './components/atoms/a-organization-schema.vue'
import { ModalList } from './store/ui/modals';

import { FileProcessingRepositoryFactory, ImageHandlerService, itemFactory } from 'src/modules/file-storage'
import { ErrorConverterService } from 'src/modules/budsies'
import { isServer } from '@vue-storefront/core/helpers'
import { isStoryblokPreview } from 'src/modules/vsf-storyblok-module';
import { SN_PROMOTION_PLATFORM } from 'src/modules/promotion-platform/types/StoreMutations';
import { FETCH_AVAILABLE_CURRENCIES_ACTION, FETCH_CURRENCY_RATES_ACTION } from 'src/modules/currency';
import { createGoogleAddressValidationProvider } from 'src/modules/address';

const windowObject = isServer ? {} : window;
const errorConverterService = new ErrorConverterService();
const fileProcessingRepositoryFactory = new FileProcessingRepositoryFactory(
  itemFactory
);
const imageHandlerService = new ImageHandlerService(
  config.images.imageHandlerServiceUrl
);
const qaPhotosHandlerService = new ImageHandlerService(
  config.images.qaPhotosHandlerServiceUrl
);
const addressValidationProviderService = createGoogleAddressValidationProvider();

export default {
  components: {
    AOrganizationSchema,
    DefaultLayout,
    MinimalLayout
  },
  computed: {
    layout () {
      return `${get(this.$route, 'meta.layout', 'default')}-layout`;
    }
  },
  async serverPrefetch () {
    try {
      const loadingPromises = [
        this.$store.dispatch('backend-settings/fetchSettings'),
        this.$store.dispatch(FETCH_AVAILABLE_CURRENCIES_ACTION),
        this.$store.dispatch(FETCH_CURRENCY_RATES_ACTION)
      ];

      if (this.$store.hasModule(SN_PROMOTION_PLATFORM)) {
        loadingPromises.push(
          this.$store.dispatch(`${SN_PROMOTION_PLATFORM}/fetchDefaultActiveCampaignData`)
        );
      }

      await Promise.all(loadingPromises);
    } catch (error) {
      this.$ssrContext.output.cacheTags.add(`no-cache`);
      await this.$router.push({ name: 'error' });
    }
  },
  provide: {
    ErrorConverterService: errorConverterService,
    FileProcessingRepositoryFactory: fileProcessingRepositoryFactory,
    ImageHandlerService: imageHandlerService,
    QaPhotosHandlerService: qaPhotosHandlerService,
    WindowObject: windowObject,
    AddressValidationProviderService: addressValidationProviderService
  },
  methods: {
    onUserLeavingWebsite () {
      if (isStoryblokPreview()) {
        return;
      }

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
  background-color: var(--c-white);
}

*:focus-visible {
  outline: var(--c-black) auto 1px;
  outline: -webkit-focus-ring-color auto 1px;
  outline: AccentColor auto 1px;
  outline-offset: -1px;
}

main {
  &:focus-visible {
    outline: none;
  }
}

body {
  @import "./css/components";

  --overlay-z-index: 1;
  --sidebar-aside-z-index: 2;
  --sidebar-z-index: 2;
  --bottom-navigation-height: 3.75rem;
  --bar-height: 3.125rem;
  --notification-font-size: var(--font-sm);
  background-color: var(--c-white);
  font-family: var(--font-family-primary);
  font-weight: var(--font-normal);
  line-height: #{$line-height-base};
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  color: var(--c-text);

  a {
    text-decoration: none;
    color: var(--c-link);
    cursor: pointer;

    &:hover {
      color: var(--c-link-hover);
    }
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

  > .content {
    min-height: 70vh;
    justify-content: stretch;
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
