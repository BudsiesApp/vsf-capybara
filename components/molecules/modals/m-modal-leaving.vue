<template>
  <div class="m-modal-leaving">
    <SfModal
      class="_modal"
      :visible="isVisible"
      @close="closeModal"
    >
      <SfHeading
        :title="$t('WHAT? You\'re Leaving!')"
        :level="1"
        class="_title"
      />

      <SfHeading
        :title="$t('but, but, but... why?')"
        :level="3"
        class="_subtitle"
      />

      <div class="_content">
        <div class="_column">
          <img src="/assets/images/hilariously-surprised-dogs.jpg" alt="" class="_image">
        </div>

        <div class="_column">
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
  name: 'MModalLeaving',
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
          label: this.$t('Just browsing... love your work!'),
          url: '/info/gifts/'
        },
        {
          label: this.$t('I don\'t know which picture to use'),
          url: '/info/photo/'
        },
        {
          label: this.$t('It\'s too expensive '),
          url: '/info/pricing/'
        },
        {
          label: this.$t('I need help with ordering'),
          url: '/info/ordering/'
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

    &:hover {
      background: var(--c-light);
      box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
    }
  }

  ._content {
    display: flex;
  }

  ._column {
    width: 50%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
   }
}
</style>
