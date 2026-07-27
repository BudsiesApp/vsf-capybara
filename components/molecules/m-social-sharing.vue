<template>
  <div
    class="sharing-buttons"
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
import Vue from 'vue';

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
      type: String,
      required: true
    }
  },
  computed: {
    shareEmailHref (): string {
      const lineBreak = encodeURIComponent('\r\n');
      const emailText = this.sharingDescription + lineBreak + lineBreak + 'Link:' + lineBreak + this.sharingUrl;
      return `mailto:?subject=${this.eMailSubject}&body=${emailText}`;
    },
    sharePinterestHref (): string {
      return `https://pinterest.com/pin/create/button/?media=${this.image}` +
      `&description=${this.sharingDescription}&url=${this.sharingUrl}`;
    },
    shareTwitterHref (): string {
      return `https://twitter.com/share?text=${this.twitterDescription}&url=${this.sharingUrl}`;
    },
    shareFacebookHref (): string {
      return `https://www.facebook.com/sharer.php?u=${this.sharingUrl}`;
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
}
</style>
