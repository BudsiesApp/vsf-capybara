<template>
  <div class="m-modal-address-validation">
    <SfModal :visible="isVisible" @close="closeModal" class="m-modal-address-validation">
      <SfHeading
        class="sf-heading--left"
        :title="getModalTitle"
        :level="3"
      />

      <span class="_subtitle">
        {{ getModalSubtitle }}
      </span>

      <div class="_container" :class="{ '-single': isFixMode || isSubpremisesMode }">
        <div v-if="!isSubpremisesMode && !isConfirmMode" class="_column">
          <SfHeading
            class="sf-heading--left _column-title"
            :title="$t('Address You Entered')"
            :level="4"
          />

          <AAddressCard
            :address="enteredAddress"
          />
        </div>

        <div v-if="!isFixMode && !isSubpremisesMode && !isConfirmMode" class="_column">
          <SfHeading
            class="sf-heading--left _column-title"
            :title="$t('Suggested Address')"
            :level="4"
          />

          <AAddressCard
            :address="suggestedAddress"
          />
        </div>

        <div v-if="isConfirmMode" class="_radio-group">
          <SfRadio
            v-model="selectedAddressType"
            value="entered"
            name="address-selection"
            class="_radio"
          >
            <template #label>
              <div class="_radio-label">
                <span class="_radio-title">{{ $t('Address You Entered') }}</span>
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
            class="_radio"
          >
            <template #label>
              <div class="_radio-label">
                <span class="_radio-title">{{ $t('Suggested Address') }}</span>
                <AAddressCard
                  :address="suggestedAddress"
                />
              </div>
            </template>
          </SfRadio>
        </div>

        <div v-if="isSubpremisesMode" class="_column">
          <SfHeading
            class="sf-heading--left _column-title"
            :title="$t('Suggested Address')"
            :level="4"
          />

          <AAddressCard
            :address="suggestedAddress"
          />

          <SfInput
            v-model.trim="unitNumber"
            class="_unit-input"
            name="unit-number"
            :label="$t('Apartment, suite, unit, etc.')"
          />
        </div>
      </div>

      <div class="_buttons">
        <SfButton
          v-if="isConfirmMode"
          class="_button"
          @click="useSelectedAddress"
        >
          {{ $t('Use Selected') }}
        </SfButton>

        <SfButton
          v-if="isFixMode"
          class="sf-button--outline _button"
          @click="useEnteredAddress"
        >
          {{ $t('Use Entered Address') }}
        </SfButton>

        <SfButton
          v-if="isFixMode"
          class="_button"
          @click="changeAddress"
        >
          {{ $t('Change Address') }}
        </SfButton>

        <SfButton
          v-if="isSubpremisesMode"
          class="sf-button--outline _button"
          @click="useWithoutUnit"
        >
          {{ $t('No Unit / Use Without Unit') }}
        </SfButton>

        <SfButton
          v-if="isSubpremisesMode"
          class="_button"
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
import { defineComponent, ref, computed, PropType, SetupContext } from '@vue/composition-api';
import { SfModal, SfHeading, SfButton, SfInput, SfRadio } from '@storefront-ui/vue';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import BaseAddressDetails from '@vue-storefront/core/modules/checkout/types/BaseAddressDetails';

import AAddressCard from '../../atoms/a-address-card.vue';

interface ModalData {
  name: string,
  payload?: {
    verdict: 'CONFIRM' | 'FIX' | 'CONFIRM_ADD_SUBPREMISES',
    enteredAddress?: Partial<BaseAddressDetails>,
    suggestedAddress?: Partial<BaseAddressDetails>
  }
}

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
      type: Object as PropType<ModalData>,
      default: () => ({})
    }
  },
  setup (props, { emit }: SetupContext) {
    const unitNumber = ref('');
    const selectedAddressType = ref<'entered' | 'suggested'>('suggested');

    const enteredAddress = computed(() => {
      return props.modalData?.payload?.enteredAddress || {};
    });

    const suggestedAddress = computed(() => {
      return props.modalData?.payload?.suggestedAddress || {};
    });

    const isConfirmMode = computed<boolean>(() => {
      return props.modalData?.payload?.verdict === 'CONFIRM';
    });

    const isFixMode = computed<boolean>(() => {
      return props.modalData?.payload?.verdict === 'FIX';
    });

    const isSubpremisesMode = computed<boolean>(() => {
      return props.modalData?.payload?.verdict === 'CONFIRM_ADD_SUBPREMISES';
    });

    const getModalTitle = computed<string>(() => {
      if (isFixMode.value) {
        return 'Address Could Not Be Validated';
      }

      if (isSubpremisesMode.value) {
        return 'Please Provide Unit Number';
      }

      return 'Confirm Shipping Address';
    });

    const getModalSubtitle = computed<string>(() => {
      if (isFixMode.value) {
        return 'The address you entered could not be validated. Please review and correct it.';
      }

      if (isSubpremisesMode.value) {
        return 'We found your address but need the unit or apartment number to ensure accurate delivery.';
      }

      return 'We found a suggested address that may be more accurate. Please select which address to use.';
    });

    const closeModal = () => {
      EventBus.$emit('modal-hide', props.modalData.name);
      emit('close', props.modalData.name);
      unitNumber.value = '';
    };

    const useEnteredAddress = () => {
      EventBus.$emit('address-selected', {
        type: 'entered',
        address: enteredAddress.value
      });

      closeModal();
    };

    const useSuggestedAddress = () => {
      EventBus.$emit('address-selected', {
        type: 'suggested',
        address: suggestedAddress.value
      });
      closeModal();
    };

    const useSelectedAddress = () => {
      if (selectedAddressType.value === 'entered') {
        useEnteredAddress();
      } else {
        useSuggestedAddress();
      }
    };

    const changeAddress = () => {
      EventBus.$emit('change-address');
      closeModal();
    };

    const useWithoutUnit = () => {
      EventBus.$emit('address-selected', {
        type: 'entered',
        address: enteredAddress.value
      });

      closeModal();
    };

    const useUpdatedAddress = () => {
      const addressWithUnit = {
        ...suggestedAddress.value,
        streetAddress: `${suggestedAddress.value.streetAddress} ${unitNumber.value}`.trim()
      };

      EventBus.$emit('address-selected', {
        type: 'with-unit',
        address: addressWithUnit
      });

      closeModal();
    };

    return {
      unitNumber,
      selectedAddressType,
      enteredAddress,
      suggestedAddress,
      isConfirmMode,
      isFixMode,
      isSubpremisesMode,
      getModalTitle,
      getModalSubtitle,
      closeModal,
      useSelectedAddress,
      useEnteredAddress,
      useSuggestedAddress,
      changeAddress,
      useWithoutUnit,
      useUpdatedAddress
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.m-modal-address-validation {
  --modal-width: auto;

  ._subtitle {
    display: block;
    margin: var(--spacer-xs) 0 0 0;
    line-height: 1.4;
    font-size: var(--font-sm);
  }

  ._container {
    display: flex;
    flex-direction: column;
    gap: var(--spacer-lg);
    margin: var(--spacer-lg) 0;

    @include for-desktop {
      flex-direction: row;
      gap: var(--spacer-xl);
    }

    &.-single {
      flex-direction: column;

      ._column {
        @include for-desktop {
          max-width: 100%;
        }
      }
    }
  }

  ._column {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  ._column-title {
    --heading-title-font-size: var(--font-base);
    --heading-title-font-weight: var(--font-semibold);
    --heading-title-margin: 0 0 var(--spacer-sm) 0;
    --heading-padding: 0;
  }

  ._buttons {
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

  ._button {
    @include for-mobile {
      width: 100%;
    }
  }

  ._radio-group {
    display: flex;
    gap: var(--spacer-sm);
    margin: var(--spacer-lg) 0;
  }

  ._radio {
    --radio-container-padding: var(--spacer-sm) var(--spacer-sm) var(--spacer-sm) var(--spacer-xs);

    &:hover {
      --radio-border: 2px solid var(--c-primary-lighten);
    }
  }

  ._radio-label {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  ._radio-title {
    font-weight: var(--font-semibold);
    font-size: var(--font-base);
    margin-bottom: var(--spacer-xs);
    display: block;
  }

  ._unit-input {
    margin: var(--spacer-base) 0 0;
  }
}
</style>
