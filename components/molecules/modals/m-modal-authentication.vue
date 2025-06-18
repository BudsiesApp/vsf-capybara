<template>
  <div class="m-modal-authentication">
    <SfModal :visible="isVisible" @close="closeModal" ref="modal">
      <transition
        name="fade"
        mode="out-in"
        @after-enter="onTransitionAfterEnter"
      >
        <MLogin :email.sync="email" />
      </transition>
    </SfModal>
  </div>
</template>

<script>
import { SfModal } from '@storefront-ui/vue';
import { mapActions } from 'vuex';

import MLogin from 'theme/components/molecules/m-login'

export default {
  name: 'MModalAuthentication',
  components: { SfModal, MLogin },
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    modalData: {
      type: Object,
      default: () => ({}),
      required: true
    }
  },
  data () {
    return {
      email: ''
    };
  },
  computed: {
    isUserLoggedIn () {
      return this.$store.getters['user/isLoggedIn'];
    }
  },
  methods: {
    ...mapActions('ui', {
      openModal: 'openModal'
    }),
    closeModal () {
      this.$emit('close', this.modalData.name)
    },
    onTransitionAfterEnter () {
      const modalComponent = this.$refs.modal;

      if (!modalComponent) {
        return;
      }

      modalComponent.updateDirectivesData();
    }
  },
  watch: {
    isUserLoggedIn (newValue) {
      if (newValue) {
        this.closeModal();
      }
    }
  }
};
</script>
