<template>
  <div id="raffle-page">
    <MBlockStory
      :story-slug="storySlug"
      class="_intro-block"
      v-if="storySlug"
    />

    <div class="_raffle-content">
      <div class="_registration-section" v-if="showRegistrationSection">
        <raffle-registration-form
          :capacity="currentState.capacity"
          :next-drawing-date="currentState.nextDrawing"
          @show-previous-winning-tickets-button-click="onShowPreviousWinningTicketsButtonClick"
        />
      </div>

      <div class="_pending-section" v-else-if="participantState === 'registered'">
        <raffle-pending
          :participant-data="participantData"
          @show-previous-winning-tickets-button-click="onShowPreviousWinningTicketsButtonClick"
        />
      </div>

      <div class="_winner-section" v-else-if="participantState === 'winner'">
        <raffle-winner :token="participantData.token" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import config from 'config';
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
    participantState (): 'not-registered' | 'registered' | 'winner' {
      if (!!this.participantData && !this.participantData.canPurchaseSpecComm) {
        return 'registered';
      } else if (!!this.participantData && this.participantData.canPurchaseSpecComm) {
        return 'winner'
      } else {
        return 'not-registered';
      }
    },
    showRegistrationSection (): boolean {
      return this.participantState === 'not-registered' && !!this.currentState;
    },
    currentState (): CurrentState | undefined {
      return this.$store.getters[`${SN_RAFFLE}/${getters.GET_CURRENT_STATE}`];
    },
    storySlug (): string | undefined {
      if (this.participantState === 'not-registered') {
        return 'raffle_landing_top';
      } else {
        return undefined;
      }
    }
  },
  beforeRouteEnter (to, from, next): void {
    if (!config.budsies.enableRaffle) {
      next({
        name: 'specialty-commissions-creation'
      });

      return;
    }

    next();
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

  ._intro-block + ._raffle-content {
    margin-top: var(--spacer-xl);
  }

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
