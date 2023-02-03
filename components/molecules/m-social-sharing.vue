<template>
  <div
    class="sharing-buttons"
  >
    <a class="sharing-button -email" :href="shareEmailHref" target="_blank" />
    <a class="sharing-button -pinterest" :href="sharePinterestHref" target="_blank" />
    <a class="sharing-button -twitter" :href="shareTwitterHref" target="_blank" />
    <a class="sharing-button -facebook" :href="shareFacebookHref" target="_blank" />
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
      return `http://pinterest.com/pin/create/button/?media=${this.image}` +
      `&description=${this.sharingDescription}&url=${this.sharingUrl}`;
    },
    shareTwitterHref (): string {
      return `http://twitter.com/share?text=${this.twitterDescription}&url=${this.sharingUrl}`;
    },
    shareFacebookHref (): string {
      return `http://www.facebook.com/sharer.php?u=${this.sharingUrl}`;
    }
  }
})
</script>

<style lang="scss" scoped>
.sharing-buttons {

  .sharing-button {
    background-repeat: no-repeat;
    background-position: 0;
    background-size: 100%;
    display: inline-block;
    height: 30px;
    width: 30px;
    opacity: 0.8;

    &:hover {
      opacity: 1;
    }

    &.-pinterest {
      background-image: url('/assets/sharing/pinterest.png');
    }

    &.-twitter {
      background-image: url('/assets/sharing/twitter.png');
    }

    &.-facebook {
      background-image: url('/assets/sharing/facebook.png');
    }

    &.-email {
      background-image: url('/assets/sharing/email.png');
    }
  }
}
</style>
