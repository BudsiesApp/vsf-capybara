<template>
  <SfButton
    class="sf-button--pure a-account-icon"
    :title="goToAccountText"
    @click="goToAccount"
  >
    <SfIcon
      icon="account"
      size="xs"
      color="white"
      class="sf-header__icon"
      :class="{
        'sf-header__icon--is-active': isLoggedIn
      }"
    />
  </SfButton>
</template>

<script>
import { SfIcon, SfButton } from '@storefront-ui/vue';
import { mapGetters, mapActions } from 'vuex';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'

import { AccountIconClickedEvent } from 'theme/interfaces/account-icon-clicked.event';
import { PageName } from 'theme/pages/page-name';
import { ModalList } from 'theme/store/ui/modals'

export default {
  components: { SfIcon, SfButton },
  computed: {
    ...mapGetters('user', ['isLoggedIn']),
    goToAccountText () {
      return this.isLoggedIn ? this.$t('Go to Account') : this.$t('Login');
    }
  },
  methods: {
    ...mapActions('ui', {
      openModal: 'openModal'
    }),
    goToAccount () {
      if (this.isLoggedIn) {
        this.$router.push(this.localizedRoute({ name: 'my-account' }))
        EventBus.$emit(AccountIconClickedEvent);
      } else {
        if ([
          PageName.SIGN_IN,
          PageName.SIGN_UP,
          PageName.RESTORE_PASSWORD
        ].includes(this.$route.name)) {
          return;
        }

        this.openModal({ name: ModalList.Auth, payload: 'login' })
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.a-account-icon {
  ::v-deep .sf-header__icon {
    &:hover {
      --icon-color: var(--c-secondary);
    }
  }
}
</style>
