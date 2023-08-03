<template>
  <div
    v-if="ratingEnabled"
    class="storyblok-website-rating layout-regular-component"
    :class="cssClasses"
    :style="styles"
  >
    <editor-block-icons :item="itemData" />

    <script type="application/ld+json" v-html="ratingDataString" />

    <div class="_website-rating" :data-average-rating="averageValue">
      <div class="_rating">
        Rating: {{ averageValue }} / 5
      </div>

      <div class="_rating-stars">
        <star-rating
          :rating="averageValue"
          :increment="0.5"
          :read-only="true"
          :show-rating="false"
          :star-size="35"
        />
      </div>

      <div class="_reviewsCount">
        based on {{ reviewsCount }} Google reviews
      </div>

      <div class="_links">
        <router-link
          :to="reviewsLink"
          target="_blank"
        >
          {{ reviewsLinkText }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { currentStoreView } from '@vue-storefront/core/lib/multistore';
import { Blok } from 'src/modules/vsf-storyblok-module/components';

import WebsiteRatingData from './interfaces/website-rating-data.interface';
import StarRating from 'vue-star-rating/src';

export default Blok.extend({
  name: 'StoryblokWebsiteRating',
  components: {
    StarRating
  },
  computed: {
    itemData (): WebsiteRatingData {
      return this.item as WebsiteRatingData;
    },
    ratingEnabled (): boolean {
    // value should be fetched from Magento config
      return true;
    },
    averageValue (): number {
    // value should be fetched from Magento config
      return 4.8;
    },
    reviewsCount (): number {
    // value should be fetched from Magento config
      return 149;
    },
    reviewsLink (): string {
      if (!this.itemData.link_url.url) {
        return '/reviews';
      }
      return this.itemData.link_url.url;
    },
    reviewsLinkText (): string {
      if (!this.itemData.link_text) {
        return 'Go to all reviews';
      }
      return this.itemData.link_text;
    },
    ratingDataString (): string {
      const storeView = currentStoreView();

      const data = {
        '@context': 'http://schema.org',
        '@type': 'Organization',
        'name': storeView.name,
        'image': this.getStoreImageUrl(),
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingCount': this.reviewsCount,
          'ratingValue': this.averageValue
        }
      };
      return JSON.stringify(data);
    }
  },
  methods: {
    getStoreImageUrl (): string {
      // temporarily for Petsies only
      return '/assets/logo.png';
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "src/modules/vsf-storyblok-module/components/defaults/mixins";

.storyblok-website-rating  {
  ._website-rating {
    text-align: center;

    ._rating {
      font-size: 1.5em;

      ._averageValue {
        display: inline;
      }
    }

    ._rating-stars {
      display: inline-block;
    }

    ._reviewsCount {
      font-size: 0.75em;
      font-weight: 600;
    }
  }

  &.-editor-preview-mode {
    ._links {
      pointer-events: none
    }
  }

  @include display-property-handling;
}
</style>
