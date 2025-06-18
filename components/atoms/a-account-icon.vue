<template>
  <SfButton
    class="sf-button--pure a-account-icon"
    @click="goToAccount"
  >
    <SfIcon
      icon="account"
      size="xs"
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
    ...mapGetters('user', ['isLoggedIn'])
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
          PageName.SIGN_UP
        ].includes(this.$route.name)) {
          return;
        }

        this.openModal({ name: ModalList.Auth, payload: 'login' })
      }
    }
  }
};
</script>
