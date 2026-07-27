<template>
  <form
    class="order-items-bulk-customization-form"
    @submit.prevent="onFormSubmit"
  >
    <div class="_steps">
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
            ref="orderItemCustomizationForm"
            :title="item.title"
            @order-item-customization-busy-state-changed="onEntityBusyChanged"
            @order-item-customization-form-errors-changed="onOrderItemCustomizationFormErrorChanged"
          />
        </div>
      </div>
    </div>

    <m-form-errors
      class="_form-errors"
      :form-errors="orderItemsErrors"
      @item-click="goToOrderItem"
    />

    <SfButton
      class="_save-button color-secondary"
      type="button"
      :disabled="isSubmitButtonDisabled"
      @click="saveProgress"
    >
      {{ $t('Save Progress') }}
    </SfButton>

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
import { useI18n, useStore } from '@vue-storefront/core/application-services';
import {
  del,
  set,
  defineComponent,
  ref,
  computed
} from 'vue';
import { SfButton, SfDivider, SfHeading } from '@storefront-ui/vue';
import { Logger } from '@vue-storefront/core/lib/logger';
import { DraftOrderItem, submitOrderItemCustomizationsState, saveOrderItemCustomizationsState, useEntityBusyState } from 'src/modules/customization-system';

import { useBulkImagesUpload } from 'theme/helpers/use-bulk-images-upload';
import { OrderItemCustomizationFormData } from 'theme/interfaces/order-item-customization-form-data.interface';

import MFormErrors from 'theme/components/molecules/m-form-errors.vue';
import OrderItemCustomizationForm from 'theme/components/customization-system/forms/order-item-customization-form.vue';
import { BudsieStatus } from 'src/modules/shared';

function useOrderItemsBulkCustomizationActions () {
  const applicationStore = useStore();
  const applicationI18n = useI18n();
  const isSubmitting = ref(false);

  function spawnError (errorMessage: string): void {
    applicationStore.dispatch('notification/spawnNotification', {
      type: 'danger',
      message: errorMessage,
      action1: { label: applicationI18n.t('OK') }
    });
    Logger.error(errorMessage, 'bulk-customize')();
  }

  async function saveCustomizationsState (draftOrderItems: DraftOrderItem[]): Promise<number[]> {
    if (isSubmitting.value) {
      return [];
    }

    isSubmitting.value = true;
    const userToken = applicationStore.getters['user/getUserToken'];
    let submittedIds: number[] = [];

    try {
      const saveResult = await saveOrderItemCustomizationsState(draftOrderItems, userToken);
      const savedOrderItemsIds = saveResult.success.map((item) => item.orderItemId);

      for (const saveError of saveResult.errors) {
        spawnError(saveError.errorMessage);
      }

      if (savedOrderItemsIds.length === 0) {
        return submittedIds;
      }

      submittedIds = savedOrderItemsIds;

      applicationStore.dispatch('notification/spawnNotification', {
        type: 'success',
        message: applicationI18n.t(
          '{count} Order item(s) have been saved successfully',
          { count: savedOrderItemsIds.length }
        ),
        action1: { label: applicationI18n.t('OK') }
      });

      return savedOrderItemsIds;
    } catch (error) {
      spawnError((error as any).message || 'An error occurred while saving customizations');
    } finally {
      isSubmitting.value = false;
    }

    return submittedIds;
  }

  async function confirmCustomization (draftOrderItems: DraftOrderItem[]): Promise<number[]> {
    if (isSubmitting.value) {
      return [];
    }

    isSubmitting.value = true;
    const userToken = applicationStore.getters['user/getUserToken'];
    let submittedIds: number[] = [];

    try {
      const saveResult = await saveOrderItemCustomizationsState(draftOrderItems, userToken);
      const savedOrderItemsIds = saveResult.success.map((item) => item.orderItemId);

      for (const saveError of saveResult.errors) {
        spawnError(saveError.errorMessage);
      }

      if (savedOrderItemsIds.length === 0) {
        return submittedIds;
      }

      const submitResult = await submitOrderItemCustomizationsState(
        savedOrderItemsIds,
        userToken
      );

      for (const submitError of submitResult.errors) {
        spawnError(submitError.errorMessage);
      }

      submittedIds = submitResult.success.map(s => s.orderItemId);

      if (submittedIds.length > 0) {
        applicationStore.dispatch('notification/spawnNotification', {
          type: 'success',
          message: applicationI18n.t(
            '{count} Order item(s) have been updated successfully',
            { count: submittedIds.length }
          ),
          action1: { label: applicationI18n.t('OK') }
        });
      }
    } catch (error) {
      spawnError((error as any).message || 'An error occurred while confirming customizations');
    } finally {
      isSubmitting.value = false;
    }

    return submittedIds;
  }

  return {
    isSubmitting,
    confirmCustomization,
    saveCustomizationsState
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
    },
    isDisabled: {
      type: Boolean,
      default: false
    }
  },
  setup (props, context) {
    const applicationStore = useStore();
    const applicationI18n = useI18n();
    const orderItemCustomizationForm = ref<OrderItemCustomizationFormType[]>([]);
    const orderItemsErrors = ref<Record<string, string>>({});

    const orderItemCustomizationByOrderItemId = computed<Record<number, OrderItemCustomizationFormType>>(() => {
      const dictionary: Record<number, OrderItemCustomizationFormType> = {};
      // TODO: temporary - current TS version don't handle `value` type right in this case
      for (const form of ((orderItemCustomizationForm as any).value as unknown as OrderItemCustomizationFormType[])) {
        dictionary[form.draftOrderItem.id] = form;
      }
      return dictionary;
    });

    function goToOrderItem (orderItemId: string): void {
      const numericOrderItemId = Number(orderItemId);

      if (!Number.isFinite(numericOrderItemId)) {
        return;
      }

      const orderItemCustomizationForm = orderItemCustomizationByOrderItemId.value[numericOrderItemId];

      if (!orderItemCustomizationForm) {
        return;
      }

      orderItemCustomizationForm.scrollToFirstError();
    }

    const { isSomeEntityBusy, onEntityBusyChanged } =
      useEntityBusyState();

    function onOrderItemCustomizationFormErrorChanged (
      { hasError, id }: {hasError: boolean, id: number}
    ): void {
      if (!hasError) {
        del(
          orderItemsErrors.value,
          id
        );
      }
    }

    const { confirmCustomization, isSubmitting, saveCustomizationsState } = useOrderItemsBulkCustomizationActions();

    const isFormDisabled = computed(() => {
      return isSubmitting.value || props.isDisabled;
    });

    const isSubmitButtonDisabled = computed(() => {
      return isFormDisabled.value || isSomeEntityBusy.value;
    });

    function getDraftItemsAvailableForUpdate (): DraftOrderItem[] {
      const draftOrderItems: DraftOrderItem[] = [];

      // TODO: temporary - current TS version don't handle `value` type right in this case
      for (const customization of ((orderItemCustomizationForm as any).value) as unknown as OrderItemCustomizationFormType[]) {
        if (customization.isCustomizationStateEmpty || customization.draftOrderItem.status_id !== BudsieStatus.AWAITING_CUSTOMIZATION) {
          continue;
        }

        const customizationState = customization.getCustomizationState();
        if (customizationState) {
          draftOrderItems.push({
            id: customization.draftOrderItem.id,
            customization_state: customizationState,
            product_sku: customization.draftOrderItem.product_sku,
            status_id: customization.draftOrderItem.status_id
          });
        }
      }

      return draftOrderItems;
    }

    function removePreservedStateByOrderItemsIds (orderItemsIds: number[]): void {
      for (const id of orderItemsIds) {
      // TODO: temporary - current TS version don't handle `value` type right in this case
        const formInstance = (((orderItemCustomizationForm as any).value) as unknown as OrderItemCustomizationFormType[]).find(
          (form) => form.draftOrderItem.id === id
        );

        if (!formInstance) {
          continue;
        }

        formInstance.removePreservedState();
      }
    }

    async function onFormSubmit (): Promise<void> {
      (orderItemsErrors.value as unknown as Record<string, string>) = {};

      if (isFormDisabled.value) {
        return;
      }

      const orderItemsWithError: OrderItemCustomizationFormType[] = [];
      // TODO: temporary - current TS version don't handle `value` type right in this case
      for (const item of ((orderItemCustomizationForm as any).value as unknown as OrderItemCustomizationFormType[])) {
        const isOrderItemCustomizationsValid = await item.validateForm();

        if (!isOrderItemCustomizationsValid) {
          orderItemsWithError.push(item);
        }
      }

      for (const errorItem of orderItemsWithError) {
        set(
          orderItemsErrors.value,
          errorItem.draftOrderItem.id,
          [`Please fix the errors in the ${errorItem.title} form`]
        );
      }

      const firstOrderItemWithError = orderItemsWithError[0];
      if (firstOrderItemWithError) {
        firstOrderItemWithError.scrollToFirstError();
        return;
      }

      const draftOrderItems = getDraftItemsAvailableForUpdate();

      if (Object.values(draftOrderItems).length === 0) {
        return;
      }

      const submittedIds = await confirmCustomization(draftOrderItems);
      removePreservedStateByOrderItemsIds(submittedIds);

      context.emit('confirmed');
    }

    async function saveProgress (): Promise<void> {
      if (isFormDisabled.value) {
        return;
      }

      const draftOrderItems = getDraftItemsAvailableForUpdate();
      const updatedIds = await saveCustomizationsState(draftOrderItems);
      removePreservedStateByOrderItemsIds(updatedIds);
    }

    return {
      ...useBulkImagesUpload(false),
      isFormDisabled,
      isSubmitButtonDisabled,
      goToOrderItem,
      orderItemCustomizationForm,
      orderItemsErrors,
      onEntityBusyChanged,
      onFormSubmit,
      onOrderItemCustomizationFormErrorChanged,
      saveProgress
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

$filepond-min-height: 7rem;

.order-items-bulk-customization-form {
  text-align: center;

  ._steps {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--spacer-base);
  }

  ._step {
    text-align: left;
    width: 100%;
    max-width: 290px;
    flex: 0 0 290px;
  }

  ._content {
    width: 100%;
    margin-top: var(--spacer-sm);
  }

  ._customization {
    text-align: center;

    ::v-deep {
      .filepond--root {
        min-height: $filepond-min-height;
      }

      .filepond--drop-label {
        min-height: $filepond-min-height;

        label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacer-sm);
        }
      }

      .filepond--root .filepond--drop-label .filepond--label-action {
        margin-left: 0;
      }
    }
  }

  ._step-divider {
    display: none;
    margin-top: var(--spacer-lg);
  }

  ._step-title {
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

  ._save-button {
    position: sticky;
    bottom: var(--spacer-base);
    margin: var(--spacer-lg) auto 0;
  }

  @media (min-width: $tablet-min) {
    ._step-divider {
      display: block;
    }
  }
}
</style>
