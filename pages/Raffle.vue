<template>
  <div id="raffle-page">
    <MBlockStory
      :story-slug="storySlug"
      v-if="storySlug"
    />

    <div class="_registration-section" v-if="showRegistrationSection">
      <raffle-registration-form
        :capacity="currentState.capacity"
        :next-drawing-date="currentState.nextDrawing"
        @show-previous-winning-tickets-button-click="onShowPreviousWinningTicketsButtonClick"
      />
    </div>

    <div class="_pending-section" v-if="showPendingSection">
      <raffle-pending
        :participant-data="participantData"
        @show-previous-winning-tickets-button-click="onShowPreviousWinningTicketsButtonClick"
      />
    </div>

    <div class="_winner-section" v-if="showWinnerSection">
      <raffle-winner :token="participantData.token" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { getters, actions, mutations, RafflePending, RaffleRegistrationForm, RaffleWinner, SN_RAFFLE, ParticipantData, CurrentState } from 'src/modules/raffle';

import { ModalList } from 'theme/store/ui/modals';

import MBlockStory from 'theme/components/molecules/m-block-story.vue';

export default Vue.extend({
  props: {
    referrerToken: {
      type: String as PropType<string | undefined>,
      default: undefined
    }
  },
  components: {
    MBlockStory,
    RafflePending,
    RaffleRegistrationForm,
    RaffleWinner
  },
  computed: {
    participantData (): ParticipantData | undefined {
      return this.$store.getters[`${SN_RAFFLE}/${getters.GET_PARTICIPANT_DATA}`];
    },
    showRegistrationSection (): boolean {
      return !this.participantData && !!this.currentState;
    },
    showWinnerSection (): boolean {
      return !!this.participantData && this.participantData.canPurchaseSpecComm;
    },
    showPendingSection (): boolean {
      return !!this.participantData && !this.participantData.canPurchaseSpecComm;
    },
    currentState (): CurrentState | undefined {
      return this.$store.getters[`${SN_RAFFLE}/${getters.GET_CURRENT_STATE}`];
    },
    storySlug (): string {
      return ''; // TODO should return appropriate story slug based on raffle state.
    }
  },
  beforeMount (): void {
    void this.loadRaffleData();

    if (!this.referrerToken) {
      return;
    }

    this.$store.commit(`${SN_RAFFLE}/${mutations.REFERRER_TOKEN_SET}`, this.referrerToken);
  },
  async serverPrefetch (): Promise<void> {
    await (this as any).loadRaffleData();
  },
  methods: {
    async loadRaffleData (): Promise<void> {
      await Promise.all([
        this.$store.dispatch(`${SN_RAFFLE}/${actions.FETCH_CURRENT_STATE}`),
        this.$store.dispatch(`${SN_RAFFLE}/${actions.FETCH_WINNING_TICKETS}`)
      ]);
    },
    onShowPreviousWinningTicketsButtonClick (): void {
      this.$store.dispatch('ui/openModal', { name: ModalList.RafflePreviousWinningTickets });
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

#raffle-page {
  padding: var(--spacer-lg) var(--spacer-base) 0;

  ._registration-section,
  ._pending-section {
    max-width: 35rem;
    margin: 0 auto;
  }

  ._pending-section {
    max-width: 45rem;
  }

  @media (min-width: $tablet-min) {
    max-width: 1272px;
    width: 100%;
    margin: 0 auto;
  }
}
</style>
