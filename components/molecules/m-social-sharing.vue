<template>
  <div
    class="sharing-buttons"
    :class="skinClass"
  >
    <a
      class="sharing-button -email"
      :href="shareEmailHref"
      target="_blank"
      rel="noopener noreferrer"
      :title="$t('Share via {service}', {service: 'Email'}).toString()"
      :aria-label="$t('Share via {service}', {service: 'Email'}) + ' ' + $t('opens in new tab')"
    />
    <a
      class="sharing-button -pinterest"
      :href="sharePinterestHref"
      :title="$t('Share on {service}', {service: 'Pinterest'}).toString()"
      :aria-label="$t('Share on {service}', {service: 'Pinterest'}) + ' ' + $t('opens in new tab')"
      target="_blank"
      rel="noopener noreferrer"
      v-if="sharePinterestHref"
    />
    <a
      class="sharing-button -twitter"
      :href="shareTwitterHref"
      :title="$t('Share on {service}', {service: 'Twitter'}).toString()"
      :aria-label="$t('Share on {service}', {service: 'Twitter'}) + ' ' + $t('opens in new tab')"
      target="_blank"
      rel="noopener noreferrer"
    />
    <a
      class="sharing-button -facebook"
      :href="shareFacebookHref"
      :title="$t('Share on {service}', {service: 'Facebook'}).toString()"
      :aria-label="$t('Share on {service}', {service: 'Facebook'}) + ' ' + $t('opens in new tab')"
      target="_blank"
      rel="noopener noreferrer"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import getCurrentThemeClass from 'theme/helpers/get-current-theme-class';
import { buildPinterestShareUrl } from 'theme/helpers/storyblok-asset-sink-values';

export default Vue.extend({
  name: 'MSocialSharing',
  props: {
    sharingUrl: {
      type: String,
      required: true
    },
    sharingDescription: {
      type: String,
      required: true
    },
    eMailSubject: {
      type: String,
      required: true
    },
    twitterDescription: {
      type: String,
      required: true
    },
    image: {
      type: String as PropType<string | undefined>,
      default: undefined
    }
  },
  computed: {
    shareEmailHref (): string {
      const emailText = `${this.sharingDescription}\r\n\r\nLink:\r\n${this.sharingUrl}`;
      return `mailto:?subject=${encodeURIComponent(this.eMailSubject)}&body=${encodeURIComponent(emailText)}`;
    },
    sharePinterestHref (): string | undefined {
      if (!this.image) {
        return;
      }

      return buildPinterestShareUrl(this.image, this.sharingDescription, this.sharingUrl);
    },
    shareTwitterHref (): string {
      return `https://twitter.com/share?text=${encodeURIComponent(this.twitterDescription)}&url=${encodeURIComponent(this.sharingUrl)}`;
    },
    shareFacebookHref (): string {
      return `https://www.facebook.com/sharer.php?u=${encodeURIComponent(this.sharingUrl)}`;
    },
    skinClass (): string {
      return getCurrentThemeClass();
    }
  }
})
</script>

<style lang="scss" scoped>
.sharing-buttons {

  .sharing-button {
    background: url('/assets/images/sharing.png') no-repeat;
    background-position: 0;
    display: inline-block;
    height: 30px;
    width: 30px;

    &.-pinterest {
      background-position: -30px 0;

      &:hover {
        background-position: -30px -30px;
      }
    }

    &.-twitter {
      background-position: -60px 0;

      &:hover {
        background-position: -60px -30px;
      }
    }

    &.-facebook {
      background-position: -90px 0;

      &:hover {
        background-position: -90px -30px;
      }
    }

    &.-email {
      background-position: 0 0;

      &:hover {
        background-position: 0 -30px;
      }
    }
  }

  &.-skin-budsies {
    .sharing-button {
      height: 63px;
      width: 60px;

      &.-facebook {
        background-position: 0 0;

        &:hover {
          background-position: 0 -63px;
        }
      }

      &.-pinterest {
        background-position: -60px 0;

        &:hover {
          background-position: -60px -63px;
        }
      }

      &.-twitter {
        background-position: -120px 0;

        &:hover {
          background-position: -120px -63px;
        }
      }

      &.-email {
        background-position: -302px 0;

        &:hover {
          background-position: -302px -63px;
        }
      }
    }
  }
}
</style>
