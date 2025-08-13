<template>
  <form
    class="order-items-bulk-customization-form"
    @submit.prevent="onFormSubmit"
  >
    <div
      class="_step"
      v-for="item in orderItemsCustomizationFormsData"
      :key="item.id"
    >
      <SfDivider class="_step-divider" />

      <SfHeading
        class="_step-title"
        :level="3"
        :title="item.title"
      />

      <div class="_content">
        <order-item-customization-form
          class="_customization"
          :is-disabled="isFormDisabled || item.isCustomized"
          :product="item.product"
          :draft-order-item="item.draftOrderItem"
          ref="orderItemCustomization"
          :order-item-id="item.id"
          :title="item.title"
          @order-item-customization-busy-state-changed="onEntityBusyChanged"
          @order-item-customization-form-errors-changed="onOrderItemCustomizationFormErrorChanged"
        />
      </div>
    </div>

    <m-form-errors
      class="_form-errors"
      :form-errors="orderItemsErrors"
      @item-click="goToOrderItem"
    />

    <div class="_actions">
      <SfButton
        class="_submit-button color-primary"
        type="submit"
        :disabled="isSubmitButtonDisabled"
      >
        {{ $t('Confirm Customization') }}
      </SfButton>
    </div>
  </form>
</template>

<script lang="ts">
import {
  del,
  set,
  defineComponent,
  ref,
  computed,
  toRefs,
  SetupContext
} from '@vue/composition-api';
import { SfButton, SfDivider, SfHeading } from '@storefront-ui/vue';
import { Logger } from '@vue-storefront/core/lib/logger';
import { DraftOrderItem, submitOrderItemCustomizationsState, saveOrderItemCustomizationsState, useEntityBusyState } from 'src/modules/customization-system';

import { useBulkImagesUpload } from 'theme/helpers/use-bulk-images-upload';
import { OrderItemCustomizationFormData } from 'theme/interfaces/order-item-customization-form-data.interface';

import MFormErrors from 'theme/components/molecules/m-form-errors.vue';
import OrderItemCustomizationForm from 'theme/components/customization-system/forms/order-item-customization-form.vue';

function useOrderItemsBulkCustomizationActions (
  { root }: SetupContext
) {
  const isSubmitting = ref(false);

  function spawnError (errorMessage: string): void {
    root.$store.dispatch('notification/spawnNotification', {
      type: 'danger',
      message: errorMessage,
      action1: { label: root.$t('OK') }
    });
    Logger.error(errorMessage, 'bulk-customize')();
  }

  async function confirmCustomization (draftOrderItemsDictionary: Record<string, DraftOrderItem>): Promise<void> {
    if (isSubmitting.value) {
      return;
    }

    isSubmitting.value = true;
    const userToken = root.$store.getters['user/getUserToken'];
    const draftOrderItems = Object.values(draftOrderItemsDictionary);

    try {
      const saveResult = await saveOrderItemCustomizationsState(draftOrderItems, userToken);
      const savedOrderItemsIds = saveResult.success.map((item) => item.orderItemId);

      for (const saveError of saveResult.errors) {
        spawnError(saveError.errorMessage);
      }

      const submitResult = await submitOrderItemCustomizationsState(
        savedOrderItemsIds,
        userToken
      );

      for (const submitError of submitResult.errors) {
        spawnError(submitError.errorMessage);
      }
    } catch (error) {
      spawnError((error as any).message || 'An error occurred while confirming customizations');
    } finally {
      isSubmitting.value = false;
    }
  }

  return {
    isSubmitting,
    confirmCustomization
  }
}

type OrderItemCustomizationFormType = InstanceType<typeof OrderItemCustomizationForm>;

export default defineComponent({
  name: 'OrderItemsBulkCustomizationForm',
  components: {
    MFormErrors,
    OrderItemCustomizationForm,
    SfButton,
    SfDivider,
    SfHeading
  },
  props: {
    orderItemsCustomizationFormsData: {
      type: Array as () => OrderItemCustomizationFormData[],
      required: true
    }
  },
  setup (props, context) {
    const orderItemCustomization = ref<OrderItemCustomizationFormType[]>([]);
    const orderItemsErrors = ref<Record<string, string>>({});

    const { orderItemsCustomizationFormsData } = toRefs(props);

    const orderItemCustomizationByOrderItemId = computed<Record<string, OrderItemCustomizationFormType>>(() => {
      const dictionary: Record<string, OrderItemCustomizationFormType> = {};
      for (const orderItemCustomizationForm of ((orderItemCustomization as any).value as unknown as OrderItemCustomizationFormType[])) {
        dictionary[orderItemCustomizationForm.draftOrderItem.id] = orderItemCustomizationForm;
      }
      return dictionary;
    });

    function goToOrderItem (orderItemId: string): void {
      const orderItemCustomizationForm = orderItemCustomizationByOrderItemId.value[orderItemId];

      if (!orderItemCustomizationForm) {
        return;
      }

      orderItemCustomizationForm.scrollToFirstError();
    }

    const { isSomeEntityBusy, onEntityBusyChanged } =
      useEntityBusyState();

    function onOrderItemCustomizationFormErrorChanged (
      { hasError, id }: {hasError: boolean, id: string}
    ): void {
      if (!hasError) {
        del(
          orderItemsErrors.value,
          id
        );
      }
    }

    const { confirmCustomization, isSubmitting } = useOrderItemsBulkCustomizationActions(context);

    const isFormDisabled = computed(() => {
      return isSubmitting.value;
    });

    const isSubmitButtonDisabled = computed(() => {
      return isFormDisabled.value || isSomeEntityBusy.value;
    });

    async function onFormSubmit (): Promise<void> {
      (orderItemsErrors.value as unknown as Record<string, string>) = {};

      if (isFormDisabled.value) {
        return;
      }

      const orderItemsWithError: OrderItemCustomizationFormType[] = [];
      for (const item of ((orderItemCustomization as any).value as unknown as OrderItemCustomizationFormType[])) {
        const isOrderItemCustomizationsValid = await item.validateForm();

        if (!isOrderItemCustomizationsValid) {
          orderItemsWithError.push(item);
        }
      }

      for (const errorItem of orderItemsWithError) {
        set(
          orderItemsErrors.value,
          errorItem.draftOrderItem.id,
          [`${errorItem.title} form has error`]
        );
      }

      const firstOrderItemWithError = orderItemsWithError[0];
      if (firstOrderItemWithError) {
        firstOrderItemWithError.scrollToFirstError();
        return;
      }

      const draftOrderItemsDictionary: Record<string, any> = {};
      for (const customization of ((orderItemCustomization as any).value) as unknown as OrderItemCustomizationFormType[]) {
        if (customization.isCustomizationStateEmpty) {
          continue;
        }

        const customizationState = customization.getCustomizationState();
        if (customizationState) {
          draftOrderItemsDictionary[customization.draftOrderItem.id] = {
            id: customization.draftOrderItem.id,
            customization_state: customizationState,
            product_sku: customization.draftOrderItem.product_sku,
            is_customized: customization.draftOrderItem.is_customized
          };
        }
      }

      if (Object.values(draftOrderItemsDictionary).length === 0) {
        return;
      }

      await confirmCustomization(
        draftOrderItemsDictionary
      );
    }

    return {
      ...useBulkImagesUpload(context),
      isFormDisabled,
      isSubmitButtonDisabled,
      goToOrderItem,
      orderItemCustomization,
      orderItemsCustomizationFormsData,
      orderItemsErrors,
      onEntityBusyChanged,
      onFormSubmit,
      onOrderItemCustomizationFormErrorChanged
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.order-items-bulk-customization-form {
  text-align: center;

  ._step {
    margin-top: var(--spacer-lg);

    ._content {
      max-width: 720px;
      width: 100%;
      margin: var(--spacer-sm) auto 0;
    }
  }

  ._customization {
    margin-top: var(--spacer-base);
    text-align: left;
  }

  ._step-divider {
    display: none;
    margin-top: var(--spacer-lg);
  }

  ._step-title {
    display: inline-block;
    margin-top: var(--spacer-base);
  }

  ._form-errors {
    margin-top: var(--spacer-xl);
  }

  ._actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: var(--spacer-xl);
  }

  @media (min-width: $tablet-min) {
    ._step-divider {
      display: block;
    }
  }
}
</style>
