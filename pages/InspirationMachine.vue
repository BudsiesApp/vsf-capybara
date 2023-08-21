<template>
  <div id="inspiration-machine">
    <div class="_top-block">
      <SfHeading :title="$t('Inspiration Machine')" :level="1" />

      <SfHeading
        :title="$t('A Super Fun Activity to Do With Your Kids!')"
        :level="2"
        class="_subtitle"
      />

      <p class="_text">
        {{ $t('Not sure what to draw for your awesome Budsies creation!? Our Inspiration Machine is here to help! Simply make your selections at each step and we’ll provide you with a helpful DIY kit to inspire your own amazing art.') }}
      </p>

      <p class="_text">
        {{ $t('Bonus: You\'ll also receive a free digital copy of our exclusive drawing & storybook “Dongler\'s Dinner Quest”!') }}
      </p>
    </div>

    <div class="_content">
      <SfSteps
        :active="currentStep"
        :steps="steps"
        :can-go-back="true"
        @change="onChangeStep"
        class="_steps"
        v-if="showSteps"
      >
        <SfStep :name="$t('Type')">
          <SfHeading
            :level="2"
            :title="$t('Select Your Creature Type')"
          />

          <inspiration-machine-theme-step
            class="_step"
            v-model="selectedThemeId"
            :themes="availableThemes"
            @selected-item-click="nextStep"
          />
        </SfStep>

        <SfStep :name="$t('Character')">
          <SfHeading
            :level="2"
            :title="$t('Select Your Character')"
          />

          <inspiration-machine-character-step
            class="_step"
            v-model="selectedCharacterId"
            :characters="availableCharacters"
            @selected-item-click="nextStep"
          />
        </SfStep>

        <SfStep :name="$t('Extras')">
          <SfHeading
            :level="2"
            :title="$t('Select Your Extras')"
          />

          <inspiration-machine-extras-step
            class="_step"
            v-model="selectedExtrasIds"
            :extras="availableExtras"
            @extras-selected="nextStep"
          />
        </SfStep>

        <SfStep :name="$t('Download Guide')">
          <SfHeading
            :level="2"
            :title="$t('YAY! Your Inspiration Kit is Being Compiled!')"
          />

          <inspiration-machine-download-guide-step
            class="_step"
            :character-id="selectedCharacterId"
            :extra-ids="selectedExtrasIds"
            @skip-request-kit-button-click="onSkipRequestKitButtonClick"
            @request-kit-form-submitted="onRequestKitFormSubmitted"
          />
        </SfStep>
      </SfSteps>

      <inspiration-machine-download-kit
        v-else-if="showDownloadPage"
        storybook-download-url="/assets/donglers_dinner_quest.pdf"
        class="_download"
        :character-id="selectedCharacterId"
        :extra-ids="selectedExtrasIds"
        :is-send-to-email="isSendToEmail"
      />
    </div>

    <div class="_bottom-block">
      <SfHeading
        :title="$t('How Does the Inspiration Machine Work?')"
        :level="2"
      />

      <p class="_text">
        {{ $t('Our helpful machine guides your family\'s imagination journey. We help you decide what you would like to draw as your Budsies character and which accessories you\'d like your character to have.') }}
      </p>

      <p class="_text">
        {{ $t('The Inspiration Machine is a fun activity to do both by yourself or with your kiddos.') }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';

import { SfHeading, SfSteps } from '@storefront-ui/vue';

import { InspirationMachineCharacterStep, InspirationMachineDownloadGuideStep, InspirationMachineDownloadKit, InspirationMachineExtrasStep, InspirationMachineThemeStep, SN_INSPIRATION_MACHINE, SelectableItem, Theme, actions, getters } from 'src/modules/inspiration-machine';
import { InjectType } from 'src/modules/shared';

interface InjectedServices {
  window: Window
}

export default (Vue as VueConstructor<Vue & InjectedServices>).extend({
  name: 'InspirationMachine',
  inject: {
    window: { from: 'WindowObject' }
  } as unknown as InjectType<InjectedServices>,
  components: {
    InspirationMachineThemeStep,
    InspirationMachineCharacterStep,
    InspirationMachineExtrasStep,
    InspirationMachineDownloadGuideStep,
    InspirationMachineDownloadKit,
    SfHeading,
    SfSteps
  },
  data () {
    return {
      currentStep: 0,
      isDataLoaded: false,
      selectedThemeId: undefined,
      selectedCharacterId: undefined,
      selectedExtrasIds: [] as number[],
      isSendToEmail: true,
      showDownloadPage: false
    }
  },
  computed: {
    availableThemes (): Theme[] {
      return this.$store.getters[`${SN_INSPIRATION_MACHINE}/${getters.GET_THEMES}`];
    },
    availableCharacters (): SelectableItem[] {
      if (!this.selectedTheme) {
        return [];
      }

      return this.selectedTheme.characters;
    },
    availableExtras (): SelectableItem[] {
      return this.$store.getters[`${SN_INSPIRATION_MACHINE}/${getters.GET_EXTRAS}`];
    },
    selectedTheme (): Theme | undefined {
      return this.availableThemes.find((theme) => theme.id === this.selectedThemeId);
    },
    showSteps (): boolean {
      return this.isDataLoaded && !this.showDownloadPage;
    },
    steps (): string[] {
      return [
        this.$t('Type').toString(),
        this.$t('Character').toString(),
        this.$t('Extras').toString(),
        this.$t('Download Guide').toString()
      ]
    }
  },
  async beforeMount (): Promise<void> {
    if (this.availableThemes.length && this.availableExtras.length) {
      this.isDataLoaded = true;
      return
    }

    await this.loadData();
  },
  methods: {
    async loadData (): Promise<void> {
      this.isDataLoaded = false;

      await Promise.all([
        this.$store.dispatch(`${SN_INSPIRATION_MACHINE}/${actions.FETCH_THEMES}`),
        this.$store.dispatch(`${SN_INSPIRATION_MACHINE}/${actions.FETCH_EXTRAS}`)
      ]);

      this.isDataLoaded = true;
    },
    onChangeStep (nextStep: number): void {
      if (nextStep < this.currentStep) {
        this.currentStep = nextStep;

        this.scrollToTop();
      }
    },
    onSkipRequestKitButtonClick (): void {
      this.isSendToEmail = false;
      this.showDownloadPage = true;
    },
    onRequestKitFormSubmitted (): void {
      this.isSendToEmail = true;
      this.showDownloadPage = true;
    },
    nextStep (): void {
      if (this.currentStep === 3) {
        return;
      }

      this.currentStep += 1;

      this.scrollToTop();
    },
    scrollToTop (): void {
      this.window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  },
  watch: {
    selectedThemeId (
      newValue: number | undefined
    ) {
      this.selectedCharacterId = undefined;

      if (!newValue) {
        return;
      }

      this.nextStep();
    },
    selectedCharacterId (
      newValue: number | undefined
    ) {
      if (!newValue) {
        return;
      }

      this.nextStep();
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

#inspiration-machine {
  $content-background: #eee;
  $content-border-radius: 5px;
  --steps-content-padding: var(--spacer-xl) var(--spacer-sm);

  box-sizing: border-box;
  padding: var(--spacer-lg) var(--spacer-sm) 0;

  ._subtitle {
    margin-top: var(--spacer-lg);
  }

  ._text {
    margin: var(--spacer-base) 0 0;
    text-align: center;
  }

  ._content {
    margin-top: var(--spacer-lg);
  }

  ._download {
    padding: var(--spacer-xl) var(--spacer-sm);
    border-top: 1px solid var(--c-secondary);
    border-bottom: 1px solid var(--c-secondary);
  }

  ._bottom-block {
    margin-top: var(--spacer-lg);
  }

  ._step {
    margin-top: var(--spacer-base);
  }

  @media (min-width: $tablet-min) {
    max-width: 71.25rem;
    width: 100%;
    margin: 0 auto;
  }
}
</style>
