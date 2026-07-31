<template>
  <div
    class="promotion-platform-image-banner-wrapper layout-regular-component"
    :class="cssClasses"
    :style="styles"
  >
    <editor-block-icons :item="itemData" />

    <div
      class="promotion-platform-image-banner-container"
      v-if="shouldShowImageBanner"
    >
      <component class="_wrapper" :is="wrapperComponent" v-bind="wrapperAttributes">
        <BaseImage
          :src="desktopImage"
          :alt="$t('Promotional campaign banner')"
          class="show-for-medium-up"
        />

        <BaseImage
          :src="mobileImage"
          :alt="$t('Promotional campaign banner')"
          class="show-for-small-only"
        />
      </component>
    </div>
  </div>
</template>

<script lang="ts">
import { CampaignContent } from 'src/modules/promotion-platform/types/CampaignContent.interface';
import { Blok } from 'src/modules/vsf-storyblok-module/components'

import { BaseImage } from 'src/modules/budsies';
import { ImageBanner } from 'src/modules/promotion-platform/types/ImageBanner.interface';

import PromoCampaignBannerData from './interfaces/promo-campaign-banner-data.interface';

export default Blok.extend({
  name: 'StoryblokPromoCampaignBannerRenderer',
  components: {
    BaseImage
  },
  data () {
    return {
      isMounted: false
    }
  },
  computed: {
    itemData (): PromoCampaignBannerData {
      return this.item as PromoCampaignBannerData;
    },
    campaignContent (): CampaignContent | undefined {
      return this.$store.getters['promotionPlatform/campaignContent'];
    },
    promoCampaignId (): string | undefined {
      if (!this.campaignContent || !this.campaignContent.image_banner) {
        return;
      }

      return this.campaignContent.image_banner.campaign_id;
    },
    imageBannerContent (): ImageBanner | undefined {
      return this.campaignContent?.image_banner;
    },
    shouldShowImageBanner (): boolean {
      if (!this.imageBannerContent || !this.isMounted) {
        return false;
      }

      if (this.itemData.campaign_id &&
        this.promoCampaignId &&
        +this.itemData.campaign_id !== +this.promoCampaignId
      ) {
        return false;
      }

      return true;
    },
    wrapperAttributes (): Record<string, string | undefined> {
      if (!this.imageBannerContent?.link_url) {
        return {};
      }

      return {
        to: this.imageBannerContent.link_url,
        target: this.imageBannerContent.target_blank ? '_blank' : '_self',
        'aria-label': this.imageBannerContent.target_blank
          ? `${this.$t('Promotional campaign banner')} ${this.$t('opens in new tab')}`
          : undefined
      };
    },
    wrapperComponent (): string {
      if (!this.imageBannerContent?.link_url) {
        return 'div';
      }

      return 'router-link';
    },
    desktopImage (): string {
      return this.imageBannerContent?.desktop_img_url || '';
    },
    mobileImage (): string {
      return this.imageBannerContent?.mobile_img_url || '';
    }
  },
  async mounted () {
    await this.$nextTick()
    this.isMounted = true;
    this.onComponentContentUpdate(this.shouldShowImageBanner);
  },
  watch: {
    shouldShowImageBanner () {
      this.onComponentContentUpdate(this.shouldShowImageBanner);
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "src/modules/vsf-storyblok-module/components/defaults/mixins";
@import "src/modules/vsf-storyblok-module/css/image-modifiers";

.promotion-platform-image-banner-wrapper {
  .promotion-platform-image-banner-container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 15px;
  }

  @include image-modifiers("promotion-platform-image-banner-container ::v-deep img");

  .show-for-medium-up {
    display: none;
  }

  ::v-deep {
    img {
      max-width: 100%;
    }
  }

  @media (min-width: $tablet-min) {
    .show-for-medium-up {
      display: inherit;
    }

    .show-for-small-only {
      display: none;
    }
  }

  @include display-property-handling;
}
</style>
