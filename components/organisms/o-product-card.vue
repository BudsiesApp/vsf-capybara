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
    </SfProductCard>
  </div>
</template>

<script lang="ts">
import { SfProductCard } from '@storefront-ui/vue';

import BaseImage from 'src/modules/budsies/components/BaseImage.vue';

export default {
  name: 'OProductCard',
  components: {
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
    }
  },
  computed: {
    productLink (): string {
      return this.link ? this.link : this.product.link;
    },
    imageAspectRatio (): number {
      return this.imageWidth / this.imageHeight;
    }
  }
}
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

  ::v-deep .sf-badge {
    color: var(--c-accent);
    line-height: calc(var(--o-product-card-badge-size) - #{$border-width} * 2);
    pointer-events: none;
  }

  @include for-tablet-up {
    --o-product-card-badge-size: 58px;
  }
}
</style>
