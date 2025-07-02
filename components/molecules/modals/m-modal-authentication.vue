<template>
  <div class="m-modal-authentication">
    <SfModal :visible="isVisible" @close="closeModal" ref="modal">
      <MLogin
        v-if="!showRegisterForm"
        :email.sync="email"
        @registration-required="onRegistrationRequired"
        @hook:mounted="onTransitionAfterEnter"
      />

      <MRegister
        v-if="showRegisterForm"
        :email="email"
        :registration-token="registrationToken"
        @hook:mounted="onTransitionAfterEnter"
      />
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
    reset () {
      this.email = '';
      this.registrationToken = '';
      this.showRegisterForm = false;
    },
    closeModal () {
      this.$emit('close', this.modalData.name)
      this.reset();
    },
    onRegistrationRequired (registrationToken) {
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
