<template>
  <div class="m-modal-authentication">
    <SfModal :visible="isVisible" @close="closeModal" ref="modal">
      <transition
        name="fade"
        mode="out-in"
        @after-enter="onTransitionAfterEnter"
      >
        <MLogin
          v-if="modalData.payload === 'login'"
          @form-switched="onFormSwitched"
          @login-success="closeModal"
        />

        <MRegister
          v-if="modalData.payload === 'register'"
          @form-switched="onFormSwitched"
          @login-success="closeModal"
        />

        <MResetPassword
          v-if="modalData.payload === 'forgot-pass'"
          @form-switched="onFormSwitched"
        />
      </transition>
    </SfModal>
  </div>
</template>

<script>
import { SfModal } from '@storefront-ui/vue';
import { mapActions } from 'vuex';

import { ModalList } from 'theme/store/ui/modals'

import MLogin from 'theme/components/molecules/m-login'
import MRegister from 'theme/components/molecules/m-register'
import MResetPassword from 'theme/components/molecules/m-reset-password'

export default {
  name: 'MModalAuthentication',
  components: { SfModal, MLogin, MRegister, MResetPassword },
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
    },
    onFormSwitched (to) {
      this.openModal({ name: ModalList.Auth, payload: to })
    }
  }
};
</script>
