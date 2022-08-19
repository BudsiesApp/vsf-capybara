<template>
  <div class="m-modal-order-error">
    <SfModal :visible="isVisible" class="_modal" @close="closeModal" :title="$t('Payment Error :(')">
      <div
        v-if="isFormSubmitted"
        class="_successfully-submitted"
      >
        {{ $t('Thanks! Our support team will contact you soon to help figure out this payment issue.') }}
      </div>

      <template v-else>
        <SfHeading :title="$t('Payment Error :(')" :level="1" class="desktop-only" />

        <p>
          {{ $t('Uh oh! We got error with your payment.') }}
        </p>

        <p class="_error-message" v-if="errorReason">
          {{ errorReason }}
        </p>

        <p>
          {{ $t('Could you please check your payment info or') }}
          <span class="_try-different-method" @click="closeModal">
            {{ $t('try a different payment method?') }}
          </span>
        </p>

        <div class="_form-container">
          {{ $t('Not sure what\'s causing error? We\'re here to help take your order') }}

          <MNotifyCustomerSupportForm
            class="_form"
            :prefilled-email="customerEmail"
            :prefilled-name="customerFullName"
            :action="onFormSubmit"
            @successfully-submitted="onFormSuccessfullySubmitted"
          />

          {{ $t('We\'ll look into your error and call or email you back with an alternate method of payment.') }}
        </div>
      </template>
    </SfModal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { SfModal, SfHeading } from '@storefront-ui/vue';
import { Order } from '@vue-storefront/core/modules/order/types/Order';

import MNotifyCustomerSupportForm from '../m-notify-customer-support-form.vue';

export default Vue.extend({
  name: 'MModalOrderError',
  components: {
    MNotifyCustomerSupportForm,
    SfModal,
    SfHeading
  },
  props: {
    isVisible: {
      type: Boolean,
      default: false,
      required: true
    },
    modalData: {
      type: Object,
      default: () => ({}),
      required: true
    }
  },
  data () {
    return {
      isFormSubmitted: false
    }
  },
  computed: {
    order (): Order | undefined {
      return this.modalData.payload?.order as Order;
    },
    customerEmail (): string | undefined {
      return this.order?.personalDetails.emailAddress;
    },
    customerFullName (): string | undefined {
      if (!this.order) {
        return;
      }

      return `${this.order.personalDetails.firstName} ${this.order.personalDetails.lastName}`;
    },
    errorReason (): string | undefined {
      return this.modalData.payload?.error;
    }
  },
  methods: {
    closeModal (): void {
      this.$emit('close', this.modalData.name);
      this.isFormSubmitted = false;
    },
    onFormSubmit (name: string, email: string, phone?: string): Promise<void> {
      return this.$store.dispatch('budsies/creditCardProcessingErrorNotifications', {
        customerEmail: email,
        customerName: name,
        customerPhone: phone,
        errorReason: this.errorReason
      })
    },
    onFormSuccessfullySubmitted (): void {
      this.isFormSubmitted = true;
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.m-modal-order-error {
  ._modal {
    --modal-content-padding: var(--spacer-lg);
    --modal-width: auto;
  }

  ._try-different-method {
    text-decoration: underline;
    font-weight: bold;
    cursor: pointer;
  }

  ._form-container {
    margin-top: var(--spacer-xl);
  }

  ._error-message {
    color: var(--c-warning);
  }

  ._successfully-submitted {
    text-align: center;
  }

  ._form {
    margin-bottom: var(--spacer-sm);
  }

  @include for-desktop {
    ._modal {
      --modal-width: 60rem;
    }

    ._form {
      padding: 0 var(--spacer-base);
    }
  }
}
</style>
