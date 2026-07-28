<template>
  <div class="m-modal-authentication">
    <SfModal
      :visible="isVisible"
      @close="closeModal"
      ref="modal"
    >
      <div
        class="_content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="authentication-modal-heading"
        tabindex="-1"
      >
        <h2
          id="authentication-modal-heading"
          ref="heading"
          class="sr-only"
          tabindex="-1"
        >
          {{ showRegisterForm ? $t('Create an account') : $t('Sign In') }}
        </h2>

        <MLogin
          ref="form"
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
      </div>
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
      this.focusHeading();
    },
    focusHeading () {
      const heading = this.$refs.heading as HTMLElement | undefined;

      if (!heading) {
        return;
      }

      heading.focus();
    }
  },
  watch: {
    async isVisible (value: boolean) {
      if (!value) {
        return;
      }

      await this.$nextTick();
      this.focusHeading();
    },
    isUserLoggedIn (newValue) {
      if (newValue) {
        this.closeModal();
      }
    }
  }
});
</script>

<style lang="scss" scoped>
.m-modal-authentication {
  ._content {
    &:focus-visible {
      outline: none;
    }
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
}
</style>
