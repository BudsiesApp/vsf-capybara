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
        <div v-if="!isSubpremisesMode" class="address-validation__column">
          <SfHeading
            class="sf-heading--left address-validation__column-title"
            :title="$t('Address You Entered')"
            :level="4"
          />

          <div class="address-validation__address-card">
            <p class="address-validation__street">
              {{ enteredAddress.streetAddress }}
            </p>

            <p class="address-validation__location">
              {{ enteredAddress.city }}, {{ enteredAddress.state }} {{ enteredAddress.zipCode }}
            </p>

            <p class="address-validation__country">
              {{ enteredAddress.country }}
            </p>
          </div>
        </div>

        <div v-if="!isFixMode && !isSubpremisesMode" class="address-validation__column">
          <SfHeading
            class="sf-heading--left address-validation__column-title"
            :title="$t('Suggested Address')"
            :level="4"
          />

          <div class="address-validation__address-card address-validation__address-card--suggested">
            <p class="address-validation__street">
              {{ suggestedAddress.streetAddress }}
            </p>

            <p class="address-validation__location">
              {{ suggestedAddress.city }}, {{ suggestedAddress.state }} {{ suggestedAddress.zipCode }}
            </p>

            <p class="address-validation__country">
              {{ suggestedAddress.country }}
            </p>
          </div>
        </div>

        <div v-if="isSubpremisesMode" class="address-validation__column">
          <SfHeading
            class="sf-heading--left address-validation__column-title"
            :title="$t('Suggested Address')"
            :level="4"
          />

          <div class="address-validation__address-card address-validation__address-card--suggested">
            <p class="address-validation__street">
              {{ suggestedAddress.streetAddress }}
            </p>

            <p class="address-validation__location">
              {{ suggestedAddress.city }}, {{ suggestedAddress.state }} {{ suggestedAddress.zipCode }}
            </p>

            <p class="address-validation__country">
              {{ suggestedAddress.country }}
            </p>
          </div>

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
          v-if="!isFixMode && !isSubpremisesMode"
          class="sf-button sf-button--outline address-validation__button"
          @click="useEnteredAddress"
        >
          {{ $t('Use Original Address') }}
        </SfButton>

        <SfButton
          v-if="!isFixMode && !isSubpremisesMode"
          class="sf-button address-validation__button"
          @click="useSuggestedAddress"
        >
          {{ $t('Use Suggested Address') }}
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
import { SfModal, SfHeading, SfButton, SfInput } from '@storefront-ui/vue';

export default defineComponent({
  name: 'MModalAddressValidation',
  components: {
    SfModal,
    SfHeading,
    SfButton,
    SfInput
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
      unitNumber: ''
    };
  },
  computed: {
    enteredAddress () {
      return this.modalData?.payload?.enteredAddress || {};
    },
    suggestedAddress () {
      return this.modalData?.payload?.suggestedAddress || {};
    },
    isFixMode (): boolean {
      return this.modalData?.payload?.verdict === 'FIX';
    },
    isSubpremisesMode (): boolean {
      return this.modalData?.payload?.verdict === 'CONFIRM_ADD_SUBPREMISE';
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
      this.$emit('close', this.modalData.name);
    },
    useEnteredAddress () {
      (this as any).$bus.$emit('address-selected', {
        type: 'entered',
        address: this.enteredAddress
      });

      this.closeModal();
    },
    useSuggestedAddress () {
      (this as any).$bus.$emit('address-selected', {
        type: 'suggested',
        address: this.suggestedAddress
      });
      this.closeModal();
    },
    changeAddress () {
      (this as any).$bus.$emit('change-address');
      this.closeModal();
    },
    useWithoutUnit () {
      (this as any).$bus.$emit('address-selected', {
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

      (this as any).$bus.$emit('address-selected', {
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

  &__address-card {
    border: 1px solid var(--c-light);
    border-radius: var(--border-radius);
    padding: var(--spacer-base);
    flex-grow: 1;

    &--suggested {
      border-color: var(--c-primary);
    }

    p {
      margin: 0 0 var(--spacer-2xs) 0;
      line-height: 1.6;
      color: var(--c-text);

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  &__name {
    font-weight: var(--font-semibold);
  }

  &__street {
    font-size: var(--font-base);
  }

  &__location {
    font-size: var(--font-base);
  }

  &__country {
    font-size: var(--font-sm);
    color: var(--c-text-muted);
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

  &__unit-input {
    margin: var(--spacer-base) 0 0;
  }
}
</style>
