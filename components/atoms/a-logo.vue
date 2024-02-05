<template>
  <router-link
    :to="localizedRoute('/')"
    :title="$t('Home Page')"
    :style="style"
    class="a-logo"
  >
    <BaseImage
      :src="logoSrc"
      :aspect-ratio="aspectRatio"
      :alt="$t(defaultTitle)"
      class="sf-header__logo"
    />
  </router-link>
</template>

<script>
import config from 'config';
import { currentStoreView } from '@vue-storefront/core/lib/multistore';
import { BaseImage } from 'src/modules/budsies';

import get from 'lodash-es/get';

export default {
  components: { BaseImage },
  computed: {
    aspectRatio () {
      return 3.85;
    },
    style () {
      return { '--aspect-ratio': this.aspectRatio.toString() }
    },
    defaultTitle () {
      return get(currentStoreView(), 'seo.defaultTitle', config.seo.defaultTitle);
    },
    logoSrc () {
      return '/assets/logo.png';
    }
  }
};
</script>
<style lang="scss" scoped>
.a-logo {
  --image-height: var(--header-logo-height, 2.125rem);

  display: inline-flex;
  flex: 1;
  max-width: calc(var(--image-height) * var(--aspect-ratio, 2.22));

  .base-image {
    --image-placeholder-background-color: transparent;
  }
}
</style>
