<template>
  <div class="m-modal-authentication">
    <SfModal :visible="isVisible" @close="closeModal" ref="modal">
      <MLogin
        v-if="!showRegisterForm"
        :email.sync="email"
        @otp-requested="onOtpRequested"
        @otp-submitted="resetPostAuthRedirectPath"
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

<script lang="ts">
import { useRoute } from '@vue-storefront/core/application-services';
import Vue from 'vue';
import { SfModal, StorefrontUiInstanceType } from '@storefront-ui/vue';
import { mapActions } from 'vuex';

import { useAuthorizationRouteRestoration } from 'theme/helpers/use-authorization-route-restoration';

import MLogin from 'theme/components/molecules/m-login.vue'
import MRegister from 'theme/components/molecules/m-register.vue'

export default Vue.extend({
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
  setup (_, context) {
    const currentRoute = useRoute();
    const { persistPostAuthRedirectPath, resetPostAuthRedirectPath } = useAuthorizationRouteRestoration();

    const onOtpRequested = () => {
      persistPostAuthRedirectPath(currentRoute.fullPath);
    };

    return {
      onOtpRequested,
      resetPostAuthRedirectPath
    };
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
    onRegistrationRequired (registrationToken: string) {
      this.registrationToken = registrationToken;
      this.showRegisterForm = true;
    },
    onTransitionAfterEnter () {
      const modalComponent = this.$refs.modal as StorefrontUiInstanceType<typeof SfModal> | undefined;

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
});
</script>
