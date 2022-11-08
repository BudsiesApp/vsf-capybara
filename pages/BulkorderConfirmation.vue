<template>
  <div id="bulkorder-confirmation-page">
    <SfHeading :level="1" :title="$t('Custom Quote Request Received')" class="_title" />

    <p>
      {{
        $t('Thank you for entrusting us with your custom plush project. Your custom project requires a bit more examination from our team before we can give an accurate quote.')
      }}

      <strong>
        {{ $t('Depending on the complexity of your order, we\'ll email you your quote within 1-3 business days.') }}
      </strong>
    </p>

    <p>
      {{ $t('Our design team will now examine your image(s) and notes to develop the best quote for your specific needs. We\'ll email you if we have any clarification questions. In the meantime, we thank you for your patience. While we\'ve made tens of thousands of custom plush orders, we always pour our hearts into each project we take on.') }}

      {{ $t('You can also check out') }}

      <router-link to="/blog/" target="_blank">
        {{ $t('our fun blog') }}
      </router-link>

      {{ $t('while you wait!') }}
    </p>

    <div class="_image" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { SfHeading } from '@storefront-ui/vue';

export default Vue.extend({
  name: 'BulkorderConfirmationPage',
  components: {
    SfHeading
  }
})
</script>

<style scoped lang="scss">
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

#bulkorder-confirmation-page {
  box-sizing: border-box;
  padding: var(--spacer-2xl) 1rem 0;
  color: var(--c-black);
  line-height: 1.6;

  ._title {
    margin-bottom: var(--spacer-xl);
  }

  @media (min-width: $tablet-min) {
    max-width: 71.25rem;
    width: 100%;
    margin: 0 auto;
  }

  ._image {
    background-image: url("/assets/images/pondering-unicorn.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: auto 100%;
    height: 300px;
  }
}
</style>
