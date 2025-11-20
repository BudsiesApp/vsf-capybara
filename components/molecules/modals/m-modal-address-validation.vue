<template>
  <div class="m-modal-address-validation">
    <SfModal :visible="isVisible" @close="closeModal" class="address-validation">
      <SfHeading
        class="sf-heading--left"
        :title="getModalTitle"
        :level="3"
      />

      <span class="address-validation__subtitle">
        {{ getModalSubtitle }}
      </span>

      <div class="address-validation__container" :class="{ 'address-validation__container--single': isFixMode || isSubpremisesMode }">
        <div v-if="!isSubpremisesMode && !isConfirmMode" class="address-validation__column">
          <SfHeading
            class="sf-heading--left address-validation__column-title"
            :title="$t('Address You Entered')"
            :level="4"
          />

          <AAddressCard
            :address="enteredAddress"
          />
        </div>

        <div v-if="!isFixMode && !isSubpremisesMode && !isConfirmMode" class="address-validation__column">
          <SfHeading
            class="sf-heading--left address-validation__column-title"
            :title="$t('Suggested Address')"
            :level="4"
          />

          <AAddressCard
            :address="suggestedAddress"
            :is-suggested="true"
          />
        </div>

        <div v-if="isConfirmMode" class="address-validation__radio-group">
          <SfRadio
            v-model="selectedAddressType"
            value="entered"
            name="address-selection"
            class="address-validation__radio"
          >
            <template #label>
              <div class="address-validation__radio-label">
                <span class="address-validation__radio-title">{{ $t('Address You Entered') }}</span>
                <AAddressCard
                  :address="enteredAddress"
                />
              </div>
            </template>
          </SfRadio>

          <SfRadio
            v-model="selectedAddressType"
            value="suggested"
            name="address-selection"
            class="address-validation__radio"
          >
            <template #label>
              <div class="address-validation__radio-label">
                <span class="address-validation__radio-title">{{ $t('Suggested Address') }}</span>
                <AAddressCard
                  :address="suggestedAddress"
                  :is-suggested="true"
                />
              </div>
            </template>
          </SfRadio>
        </div>

        <div v-if="isSubpremisesMode" class="address-validation__column">
          <SfHeading
            class="sf-heading--left address-validation__column-title"
            :title="$t('Suggested Address')"
            :level="4"
          />

          <AAddressCard
            :address="suggestedAddress"
            :is-suggested="true"
          />

          <SfInput
            v-model.trim="unitNumber"
            class="address-validation__unit-input"
            name="unit-number"
            :label="$t('Apartment, suite, unit, etc.')"
          />
        </div>
      </div>

      <div class="address-validation__buttons">
        <SfButton
          v-if="isConfirmMode"
          class="sf-button address-validation__button"
          @click="useSelectedAddress"
        >
          {{ $t('Use Selected') }}
        </SfButton>

        <SfButton
          v-if="isFixMode"
          class="sf-button sf-button--outline address-validation__button"
          @click="useEnteredAddress"
        >
          {{ $t('Use Entered Address') }}
        </SfButton>

        <SfButton
          v-if="isFixMode"
          class="sf-button address-validation__button"
          @click="changeAddress"
        >
          {{ $t('Change Address') }}
        </SfButton>

        <SfButton
          v-if="isSubpremisesMode"
          class="sf-button sf-button--outline address-validation__button"
          @click="useWithoutUnit"
        >
          {{ $t('No Unit / Use Without Unit') }}
        </SfButton>

        <SfButton
          v-if="isSubpremisesMode"
          class="sf-button address-validation__button"
          :disabled="!unitNumber"
          @click="useUpdatedAddress"
        >
          {{ $t('Use Updated Address') }}
        </SfButton>
      </div>
    </SfModal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { SfModal, SfHeading, SfButton, SfInput, SfRadio } from '@storefront-ui/vue';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';

import AAddressCard from '../../atoms/a-address-card.vue';

export default defineComponent({
  name: 'MModalAddressValidation',
  components: {
    SfModal,
    SfHeading,
    SfButton,
    SfInput,
    SfRadio,
    AAddressCard
  },
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    modalData: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      unitNumber: '',
      selectedAddressType: 'suggested'
    };
  },
  computed: {
    enteredAddress () {
      return this.modalData?.payload?.enteredAddress || {};
    },
    suggestedAddress () {
      return this.modalData?.payload?.suggestedAddress || {};
    },
    isConfirmMode (): boolean {
      return this.modalData?.payload?.verdict === 'CONFIRM';
    },
    isFixMode (): boolean {
      return this.modalData?.payload?.verdict === 'FIX';
    },
    isSubpremisesMode (): boolean {
      return this.modalData?.payload?.verdict === 'CONFIRM_ADD_SUBPREMISES';
    },
    getModalTitle (): string {
      if (this.isFixMode) {
        return 'Address Could Not Be Validated';
      }

      if (this.isSubpremisesMode) {
        return 'Please Provide Unit Number';
      }

      return 'Confirm Shipping Address';
    },
    getModalSubtitle (): string {
      if (this.isFixMode) {
        return 'The address you entered could not be validated. Please review and correct it.';
      }

      if (this.isSubpremisesMode) {
        return 'We found your address but need the unit or apartment number to ensure accurate delivery.';
      }

      return 'We found a suggested address that may be more accurate. Please select which address to use.';
    }
  },
  methods: {
    closeModal () {
      EventBus.$emit('modal-hide', this.modalData.name);
      this.$emit('close', this.modalData.name);
    },
    useSelectedAddress () {
      if (this.selectedAddressType === 'entered') {
        this.useEnteredAddress();
      } else {
        this.useSuggestedAddress();
      }
    },
    useEnteredAddress () {
      EventBus.$emit('address-selected', {
        type: 'entered',
        address: this.enteredAddress
      });

      this.closeModal();
    },
    useSuggestedAddress () {
      EventBus.$emit('address-selected', {
        type: 'suggested',
        address: this.suggestedAddress
      });
      this.closeModal();
    },
    changeAddress () {
      EventBus.$emit('change-address');
      this.closeModal();
    },
    useWithoutUnit () {
      EventBus.$emit('address-selected', {
        type: 'entered',
        address: this.enteredAddress
      });

      this.closeModal();
    },
    useUpdatedAddress () {
      const addressWithUnit = {
        ...this.suggestedAddress,
        streetAddress: `${this.suggestedAddress.streetAddress} ${this.unitNumber}`.trim()
      };

      EventBus.$emit('address-selected', {
        type: 'with-unit',
        address: addressWithUnit
      });

      this.closeModal();
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.address-validation {
  --modal-width: auto;

  &__subtitle {
    display: block;
    margin: var(--spacer-xs) 0 0 0;
    line-height: 1.4;
    font-size: var(--font-sm);
  }

  &__container {
    display: flex;
    flex-direction: column;
    gap: var(--spacer-lg);
    margin: var(--spacer-lg) 0;

    @include for-desktop {
      flex-direction: row;
      gap: var(--spacer-xl);
    }

    &--single {
      flex-direction: column;

      .address-validation__column {
        @include for-desktop {
          max-width: 100%;
        }
      }
    }
  }

  &__column {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  &__column-title {
    --heading-title-font-size: var(--font-base);
    --heading-title-font-weight: var(--font-semibold);
    --heading-title-margin: 0 0 var(--spacer-sm) 0;
    --heading-padding: 0;
  }

  &__buttons {
    display: flex;
    flex-direction: column;
    gap: var(--spacer-sm);
    margin-top: var(--spacer-lg);

    @include for-desktop {
      flex-direction: row;
      justify-content: flex-end;
      gap: var(--spacer-base);
    }
  }

  &__button {
    @include for-mobile {
      width: 100%;
    }
  }

  &__radio-group {
    display: flex;
    gap: var(--spacer-sm);
    margin: var(--spacer-lg) 0;
  }

  &__radio {
    --radio-container-padding: var(--spacer-sm) var(--spacer-sm) var(--spacer-sm) var(--spacer-xs);

    &:hover {
      --radio-border: 2px solid var(--c-primary-lighten);
    }
  }

  &__radio-label {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  &__radio-title {
    font-weight: var(--font-semibold);
    font-size: var(--font-base);
    margin-bottom: var(--spacer-xs);
    display: block;
  }

  &__unit-input {
    margin: var(--spacer-base) 0 0;
  }
}
</style>
