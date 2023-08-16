<template>
  <div
    class="sharing-buttons"
    :class="skinClass"
  >
    <a class="sharing-button -email" :href="shareEmailHref" target="_blank" />
    <a
      class="sharing-button -pinterest"
      :href="sharePinterestHref"
      target="_blank"
      v-if="sharePinterestHref"
    />
    <a class="sharing-button -twitter" :href="shareTwitterHref" target="_blank" />
    <a class="sharing-button -facebook" :href="shareFacebookHref" target="_blank" />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import getCurrentThemeClass from 'theme/helpers/get-current-theme-class';

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
      const lineBreak = encodeURIComponent('\r\n');
      const emailText = this.sharingDescription + lineBreak + lineBreak + 'Link:' + lineBreak + this.sharingUrl;
      return `mailto:?subject=${this.eMailSubject}&body=${emailText}`;
    },
    sharePinterestHref (): string | undefined {
      if (!this.image) {
        return;
      }

      return `http://pinterest.com/pin/create/button/?media=${this.image}` +
      `&description=${this.sharingDescription}&url=${this.sharingUrl}`;
    },
    shareTwitterHref (): string {
      return `http://twitter.com/share?text=${this.twitterDescription}&url=${this.sharingUrl}`;
    },
    shareFacebookHref (): string {
      return `http://www.facebook.com/sharer.php?u=${this.sharingUrl}`;
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
