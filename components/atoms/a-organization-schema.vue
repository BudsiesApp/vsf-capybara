<template>
  <script
    v-if="showOrganizationSchema"
    type="application/ld+json"
    v-html="organizationDataString"
  />
</template>

<script lang="ts">
import {
  computed,
  defineComponent
} from '@vue/composition-api';

import { currentStoreView } from '@vue-storefront/core/lib/multistore';
import getHostFromHeaders from '@vue-storefront/core/helpers/get-host-from-headers.function';

import { socialServices } from 'theme/interfaces/social-services';

interface OrganizationData {
  '@context': string,
  '@type': string,
  name: string,
  logo: string,
  url: string,
  sameAs: string[]
}

export default defineComponent({
  name: 'AOrganizationSchema',
  setup (_, context) {
    const isHomepage = computed<boolean>(() => {
      return ['', '/'].includes(context.root.$route.path);
    });

    const storeUrl = computed<string>(() => {
      const host = context.ssrContext
        ? getHostFromHeaders((context.ssrContext.server.request as any).headers)
        : window.location.host;

      return `https://${host}`;
    });

    const storeImageUrl = computed<string>(() => {
      return `${storeUrl.value}/assets/organization-logo.png`;
    });

    const organizationData = computed<OrganizationData | null>(() => {
      const storeView = currentStoreView();

      const baseData: OrganizationData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: storeView.name || '',
        logo: storeImageUrl.value,
        url: storeUrl.value,
        sameAs: socialServices.map(service => service.url)
      };

      return baseData;
    });

    const organizationDataString = computed<string>(() => {
      return organizationData.value ? JSON.stringify(organizationData.value) : '';
    });

    const showOrganizationSchema = computed<boolean>(() => {
      return !!organizationData.value && isHomepage.value;
    });

    return {
      organizationData,
      organizationDataString,
      showOrganizationSchema
    };
  }
});
</script>
