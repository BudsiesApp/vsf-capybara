<template>
  <div class="m-modal-leaving">
    <SfModal :visible="isVisible" @close="closeModal">
      <SfHeading :title="$t('WHAT? You\'re Leaving!')" :level="1" />

      <SfHeading :title="$t('but, but, but... why?')" :level="3" />

      <div class="_content">
        <div class="_column">
          <img src="/assets/images/hilariously-surprised-dogs.jpg" alt="" class="_image">
        </div>

        <div class="_column">
          <router-link
            v-for="link in linkItems"
            :key="link.label"
            :to="link.url"
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
    ._content {
        display: flex;
    }

    ._column {
        flex-grow: 1;
    }
}
</style>
