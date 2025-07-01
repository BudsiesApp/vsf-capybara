<template>
  <div class="m-modal-authentication">
    <SfModal :visible="isVisible" @close="closeModal" ref="modal">
      <transition
        name="fade"
        mode="out-in"
        @after-enter="onTransitionAfterEnter"
      >
        <MLogin
          v-if="!showRegisterForm"
          :email.sync="email"
          @registration-required="onRegistrationRequired"
        />
      </transition>

      <transition
        name="fade"
        mode="out-in"
        @after-enter="onTransitionAfterEnter"
      >
        <MRegister
          v-if="showRegisterForm"
          :email="email"
          :registration-token="registrationToken"
        />
      </transition>
    </SfModal>
  </div>
</template>

<script>
import { SfModal } from '@storefront-ui/vue';
import { mapActions } from 'vuex';

import MLogin from 'theme/components/molecules/m-login'
import MRegister from 'theme/components/molecules/m-register'

export default {
  name: 'MModalAuthentication',
  components: {
    MLogin,
    MRegister,
    SfModal
  },
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
      email: '',
      registrationToken: '',
      showRegisterForm: false
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
    onRegistrationRequired ({ registrationToken }) {
      this.registrationToken = registrationToken;
      this.showRegisterForm = true;
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
