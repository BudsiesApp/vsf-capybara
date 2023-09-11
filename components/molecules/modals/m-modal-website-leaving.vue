<template>
  <div class="m-modal-leaving">
    <SfModal
      class="_modal"
      :visible="isVisible"
      @close="closeModal"
    >
      <div class="_content">
        <div class="_column -image">
          <img src="/assets/images/website-leaving-image.png" class="_image">
        </div>

        <div class="_column">
          <SfHeading
            :title="$t('I’M SORRY!!')"
            :level="1"
            class="_title"
          />

          <SfHeading
            :title="$t('Why are you leaving me?')"
            :level="3"
            class="_subtitle"
          />

          <router-link
            class="_link"
            v-for="link in linkItems"
            :key="link.label"
            :to="link.url"
            @click.native="closeModal"
          >
            {{ link.label }}
          </router-link>
        </div>
      </div>
    </SfModal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { SfModal, SfHeading } from '@storefront-ui/vue';

export default Vue.extend({
  name: 'MModalWebsiteLeaving',
  components: {
    SfModal,
    SfHeading
  },
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    modalData: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      linkItems: [
        {
          label: this.$t('I don\'t have a good drawing'),
          url: '/info/drawing/'
        },
        {
          label: this.$t('I don\'t have kids'),
          url: '/info/customers/'
        },
        {
          label: this.$t('It\'s too expensive '),
          url: '/info/price/'
        },
        {
          label: this.$t('I\'ll get it as a gift later'),
          url: '/info/gift/'
        },
        {
          label: this.$t('I need help'),
          url: '/info/help/'
        }
      ]
    }
  },
  methods: {
    closeModal () {
      this.$emit('close', this.modalData.name)
    }
  }
})
</script>

<style lang="scss" scoped>
.m-modal-leaving {
  ._modal {
    --modal-content-padding: var(--spacer-lg);
    --modal-width: auto;
  }

  ._title {
    margin-bottom: var(--spacer-sm);
  }

  ._subtitle {
    margin-bottom: var(--spacer-base);
  }

  ._link {
    color: var(--c-primary);
    background: var(--c-light-variant);
    padding: var(--spacer-xs);
    border: 2px solid var(--c-primary);
    transition: 150ms;
    margin-top: var(--spacer-xs);

    &:hover {
      background: var(--c-light);
      box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
    }
  }

  ._content {
    display: flex;
  }

  ._column {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    flex: 2;
    margin-left: var(--spacer-lg);

    &.-image {
      flex: 1;
      margin-left: 0;
    }
  }

  ._image {
    max-width: 100%;
    object-fit: contain;
  }
}
</style>
