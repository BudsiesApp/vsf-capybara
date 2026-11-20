<template>
  <div
    v-if="showOrganizationSchema"
    style="display: none;"
  >
    <script
      type="application/ld+json"
      v-html="schemaDataString"
    />
  </div>
</template>

<script lang="ts">
import { useRoute, useStore } from '@vue-storefront/core/application-services';
import { useRequestServices } from '@vue-storefront/core/request-services';
import config from 'config';
import {
  computed,
  defineComponent
} from 'vue';
import { currentStoreView } from '@vue-storefront/core/lib/multistore';

import { GET_SOCIAL_PROFILES_GETTER } from 'src/modules/social-profiles';
import type { SocialProfile } from 'src/modules/social-profiles';

interface OrganizationSchema {
  '@type': 'Organization',
  '@id': string,
  name: string,
  url: string,
  logo: string,
  sameAs?: string[],
  description: string
}

interface WebSiteSchema {
  '@type': 'WebSite',
  '@id': string,
  url: string,
  name: string,
  inLanguage: string,
  publisher: { '@id': string },
  copyrightHolder: { '@id': string },
  copyrightYear: string
}

interface SchemaData {
  '@context': string,
  '@graph': (OrganizationSchema | WebSiteSchema)[]
}

export default defineComponent({
  name: 'AOrganizationSchema',
  setup (_, context) {
    const currentRoute = useRoute();
    const store = useStore();
    const request = useRequestServices();
    const profiles = computed<SocialProfile[]>(() => store.getters[GET_SOCIAL_PROFILES_GETTER]);
    const isHomepage = computed<boolean>(() => {
      return ['', '/'].includes(currentRoute.path);
    });

    const storeUrl = computed<string>(() => {
      return `https://${request.host}`;
    });

    const storeImageUrl = computed<string>(() => {
      return `${storeUrl.value}/assets/organization-logo.png`;
    });

    const schemaData = computed<SchemaData | null>(() => {
      const storeView = currentStoreView();

      if (!storeView.name) {
        return null;
      }

      const organizationId = `${storeUrl.value}/#organization`;
      const websiteId = `${storeUrl.value}/#website`;

      const organizationSchema: OrganizationSchema = {
        '@type': 'Organization',
        '@id': organizationId,
        name: storeView.name,
        url: storeUrl.value,
        logo: storeImageUrl.value,
        description: config.seo.defaultDescription
      };
      const urls = profiles.value.map(profile => profile.url);
      if (urls.length) {
        organizationSchema.sameAs = urls;
      }

      const websiteSchema: WebSiteSchema = {
        '@type': 'WebSite',
        '@id': websiteId,
        url: storeUrl.value,
        name: config.seo.defaultTitle,
        inLanguage: storeView.i18n?.defaultLocale || 'en-US',
        publisher: { '@id': organizationId },
        copyrightHolder: { '@id': organizationId },
        copyrightYear: new Date().getFullYear().toString()
      };

      return {
        '@context': 'https://schema.org',
        '@graph': [organizationSchema, websiteSchema]
      };
    });

    const schemaDataString = computed<string>(() => {
      if (!schemaData.value) {
        return '';
      }

      return JSON.stringify(schemaData.value).replace(/</g, '\\u003c');
    });

    const showOrganizationSchema = computed<boolean>(() => {
      return !!schemaData.value && isHomepage.value;
    });

    return {
      schemaData,
      schemaDataString,
      showOrganizationSchema
    };
  }
});
</script>
