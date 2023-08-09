<template>
  <div id="raffle-page">
    <div class="_registration-section" v-if="showRegistrationSection">
      <raffle-registration-form
        :capacity="currentState.capacity"
        :next-drawing-date="currentState.nextDrawing"
      />
    </div>

    <div class="_pending-section" v-if="showPendingSection">
      <raffle-pending :participant-data="participantData" />
    </div>

    <div class="_winner-section" v-if="showWinnerSection">
      <raffle-winner :token="participantData.token" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';

import { getters, actions, RafflePending, RaffleRegistrationForm, RaffleWinner, SN_RAFFLE } from 'src/modules/raffle';
import ParticipantData from 'src/modules/raffle/models/participant-data.model';

import CurrentState from 'src/modules/raffle/models/current-state.model';

export default defineComponent({
  components: {
    RafflePending,
    RaffleRegistrationForm,
    RaffleWinner
  },
  data () {
    return {
      isDataLoaded: false
    }
  },
  computed: {
    isRaffleModuleSynced (): boolean {
      return this.$store.getters[`${SN_RAFFLE}/${getters.GET_IS_SYNCED}`];
    },
    participantData (): ParticipantData | undefined {
      return this.$store.getters[`${SN_RAFFLE}/${getters.GET_PARTICIPANT_DATA}`];
    },
    showRegistrationSection (): boolean {
      return !this.participantData && !!this.currentState;
    },
    showWinnerSection (): boolean {
      return !!this.participantData && this.participantData.isWinner;
    },
    showPendingSection (): boolean {
      return !!this.participantData && !this.participantData.isWinner;
    },
    currentState (): CurrentState | undefined {
      return this.$store.getters[`${SN_RAFFLE}/${getters.GET_CURRENT_STATE}`];
    }
  },
  beforeMount (): void {
    void this.loadRaffleData();
  },
  methods: {
    async loadRaffleData (): Promise<void> {
      this.isDataLoaded = false;

      await Promise.all([
        this.$store.dispatch(`${SN_RAFFLE}/${actions.FETCH_CURRENT_STATE}`),
        this.$store.dispatch(`${SN_RAFFLE}/${actions.FETCH_WINNING_TICKETS}`)
      ]);

      this.isDataLoaded = true;
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
