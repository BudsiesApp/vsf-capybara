<template>
  <div class="a-creativity-kit-item">
    <SfHeading
      :level="3"
      :title="title"
      class="_title small-mobile-only"
    />

    <div class="_image-container">
      <img class="_image" :src="image">
    </div>

    <div class="_info">
      <SfHeading
        :level="3"
        :title="title"
        class="tablet-up-only"
      />

      <p class="_description">
        {{ description }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { SfHeading } from '@storefront-ui/vue';

export default Vue.extend({
  name: 'ACreativityKitItem',
  props: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    }
  },
  components: {
    SfHeading
  }
})
</script>

<style lang="scss" scoped>
@import "theme/css/base/_breakpoints.scss";

.a-creativity-kit-item {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  font-size: var(--font-base);

  ._image-container,
  ._info {
    margin-top: var(--spacer-sm);
  }

  ._image-container {
    display: flex;
  }

  ._title,
  ._info {
    flex-basis: 100%;
  }

  ._description {
    text-align: center;
  }

  @include for-tablet-up {
    .sf-heading {
      --heading-text-align: start;
    }

    flex-wrap: nowrap;
    align-items: flex-start;
    justify-content: flex-start;

    ._image-container,
    ._info {
      margin-top: 0;
    }

    ._info {
      margin-left: var(--spacer-lg);
      flex-basis: 85%;
    }

    ._image {
      width: 100%;
    }

    ._description {
      text-align: left;
    }
  }
}
</style>
