<template>
  <div class="o-product-card">
    <SfProductCard
      :title="product.title"
      :image="product.image"
      :regular-price="product.price.regular"
      :special-price="product.price.special"
      :link="productLink"
      :link-tag="linkTag"
      :wishlist-icon="wishlistIcon"
      :image-height="imageHeight"
      :image-width="imageWidth"
      :badge-label="product.discount"
    >
      <template #image>
        <BaseImage
          :src="product.image"
          :alt="product.title"
          :width="`${imageWidth}px`"
          :aspect-ratio="imageAspectRatio"
        />
      </template>

      <template #reviews v-if="productCollectionRatingComponent">
        <component
          v-if="shouldShowProductRating"
          :is="productCollectionRatingComponent"
          :product-id="product.id"
          class="_product-rating"
        />
      </template>

      <template #title="{title}" v-if="turnaroundTime">
        <h3 class="sf-product-card__title">
          {{ title }}

          <span class="_turnaround-time">
            {{ $t('Ships in approx. {weeks} weeks', {weeks: turnaroundWeeks}) }}
          </span>
        </h3>
      </template>

      <template #price v-if="isAddedToCart">
        <a-added-to-cart class="_added-to-cart" />
      </template>
    </SfProductCard>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, inject } from 'vue';
import config from 'config';
import { SfProductCard } from '@storefront-ui/vue';

import BaseImage from 'src/modules/budsies/components/BaseImage.vue';

import AAddedToCart from 'theme/components/atoms/a-added-to-cart.vue';

export default defineComponent({
  name: 'OProductCard',
  components: {
    AAddedToCart,
    BaseImage,
    SfProductCard
  },
  props: {
    imageWidth: {
      type: Number,
      default: 216
    },
    imageHeight: {
      type: Number,
      default: 326
    },
    product: {
      type: Object,
      required: true
    },
    link: {
      type: String,
      default: undefined
    },
    linkTag: {
      type: String,
      default: undefined
    },
    wishlistIcon: {
      type: [String, Array, Boolean],
      default: 'heart'
    },
    turnaroundTime: {
      type: Number,
      default: undefined
    },
    isAddedToCart: {
      type: Boolean,
      default: false
    }
  },
  setup (props) {
    const productCollectionRatingComponent = inject('ProductCollectionRatingComponent', null);

    const productLink = computed(() => props.link ? props.link : props.product.link);
    const imageAspectRatio = computed(() => props.imageWidth / props.imageHeight);
    const turnaroundWeeks = computed(() => Math.ceil(props.turnaroundTime / 7));
    const shouldShowProductRating = computed(() => config.products.showRating && !!productCollectionRatingComponent && !!props.product.id);

    return {
      productLink,
      imageAspectRatio,
      turnaroundWeeks,
      productCollectionRatingComponent,
      shouldShowProductRating
    };
  }
});
</script>

<style lang="scss" scoped>
@import "theme/css/base/_breakpoints.scss";

$border-width: 2px;

.o-product-card {
  --o-product-card-badge-size: 50px;

  --product-card-badge-left: calc(100% - calc(var(--o-product-card-badge-size) / 2));
  --product-card-badge-top: calc(var(--o-product-card-badge-size) / 2 * -1);
  --badge-height: var(--o-product-card-badge-size);
  --badge-width: var(--o-product-card-badge-size);
  --badge-padding: 0;
  --badge-border: #{$border-width} solid var(--c-accent);
  --badge-border-radius: calc(var(--o-product-card-badge-size) / 2);
  --badge-font-weight: 800;
  --badge-background: var(--c-white);
  --badge-font-size: var(--font-sm);
  --product-card-margin: var(--spacer-xs) 0 0;

  ._turnaround-time {
    font-size: var(--font-xs);
    line-height: var(--font-sm);
    margin-top: var(--spacer-xs);
    display: inline-block;
  }

  ::v-deep .sf-badge {
    color: var(--c-accent);
    line-height: calc(var(--o-product-card-badge-size) - #{$border-width} * 2);
    pointer-events: none;
  }

  ._added-to-cart {
    margin-top: var(--spacer-xs);
  }

  @include for-tablet-up {
    --o-product-card-badge-size: 58px;
  }
}
</style>
