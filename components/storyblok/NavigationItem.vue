<template>
  <div class="navigation-item">
    <sb-router-link
      :link="item.link_url"
      :is-new-window="isNewWindow"
      :class="classes"
    >
      <slot />
    </sb-router-link>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from '@vue/composition-api'

import { getUrlFromLink, NavigationItem } from 'src/modules/vsf-storyblok-module'

import { isConfigurableProductLinkActive } from 'theme/helpers/is-configurable-product-link-active.function';

export default defineComponent({
  props: {
    item: {
      type: Object as PropType<NavigationItem>,
      required: true
    }
  },
  setup ({ item }, context) {
    const isNewWindow = computed<boolean>(() => {
      return item.link_url.target === '_blank'
    });
    const classes = computed<string[]>(() => {
      const items: string[] = [];

      const link = getUrlFromLink(item.link_url);
      const router = context.root.$router;
      const currentRoute = context.root.$route;
      const resolvedRoute = router.resolve(link);

      if (isConfigurableProductLinkActive(resolvedRoute.route, currentRoute)) {
        items.push('router-link-active');
      }

      return items;
    });

    return {
      isNewWindow,
      classes
    }
  }
})
</script>
