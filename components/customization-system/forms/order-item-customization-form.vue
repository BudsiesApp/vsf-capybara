<template>
  <validation-observer
    tag="div"
    class="order-item-customization-form"
    ref="validationObserver"
  >
    <customization-option
      v-for="customization in filteredCustomizations"
      class="_customization-option"
      ref="customizationOption"
      :key="customization.id"
      :customization="customization"
      :is-disabled="isDisabled"
      :option-values="customizationAvailableOptionValues[customization.id]"
      :product-id="+product.id"
      :value="customizationOptionValue[customization.id]"
      :disable-validation="isCustomizationStateEmpty"
      :field-name-prefix="draftOrderItem.id.toString(10)"
      @input="onCustomizationOptionInput"
      @customization-option-busy-state-changed="onEntityBusyChanged"
    />
  </validation-observer>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  Ref,
  ref,
  toRefs,
  watch
} from 'vue';
import { ValidationObserver } from 'vee-validate';

import Product from '@vue-storefront/core/modules/catalog/types/Product';
import { BudsieStatus, useCurrentInstance } from 'src/modules/shared';
import {
  Customization,
  CustomizationOptionValue,
  CustomizationStateItem,
  DraftOrderItem,
  requiredCustomizationsFilter,
  useAvailableCustomizations,
  useEntityBusyState,
  useCustomizationState,
  useCustomizationsFilter,
  useOptionValueActions,
  useCustomizationStatePreservation
} from 'src/modules/customization-system';

import { getNestedFormRefs, useFormValidation } from 'theme/helpers/use-form-validation';

import CustomizationOption from 'theme/components/customization-system/customization-option.vue';

export default defineComponent({
  name: 'OrderItemCustomizationForm',
  components: {
    CustomizationOption,
    ValidationObserver
  },
  props: {
    draftOrderItem: {
      type: Object as PropType<DraftOrderItem>,
      required: true
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    product: {
      type: Object as PropType<Product>,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  },
  setup (props, context) {
    const instance = useCurrentInstance();
    const { draftOrderItem, product } = toRefs(props);

    const validationObserver: Ref<InstanceType<typeof ValidationObserver> | null> = ref(null);
    const customizationOption = ref<InstanceType<typeof CustomizationOption>[] | null>(null);

    const productCustomizations = computed<Customization[]>(() => {
      return product.value.customizations || [];
    });

    const productCustomization = computed<Record<string, Customization>>(() => {
      const dictionary: Record<string, Customization> = {};

      for (const customization of productCustomizations.value) {
        dictionary[customization.id] = customization;
      }

      return dictionary;
    });

    const initialCustomizationState = computed<CustomizationStateItem[]>(() => {
      return draftOrderItem.value.customization_state || [];
    });

    const isCustomizable = computed<boolean>(() => {
      return draftOrderItem.value.status_id === BudsieStatus.AWAITING_CUSTOMIZATION;
    });

    const {
      addCustomizationOptionValue,
      customizationOptionValue,
      customizationState,
      removeCustomizationOptionValue,
      selectedOptionValuesIds,
      updateCustomizationOptionValue,
      mergeCustomizationState
    } = useCustomizationState(undefined, initialCustomizationState);

    const {
      availableCustomizations,
      customizationAvailableOptionValues,
      removeUnavailableOptionValues
    } = useAvailableCustomizations(
      productCustomizations,
      selectedOptionValuesIds,
      customizationOptionValue,
      updateCustomizationOptionValue
    );

    const { executeActionsByCustomizationIdAndCustomizationOptionValue } =
      useOptionValueActions(
        productCustomizations,
        productCustomization,
        customizationAvailableOptionValues,
        updateCustomizationOptionValue,
        removeCustomizationOptionValue,
        addCustomizationOptionValue
      );

    const { filteredCustomizations } = useCustomizationsFilter(
      availableCustomizations,
      customizationAvailableOptionValues,
      [requiredCustomizationsFilter]
    );

    const { isSomeEntityBusy, onEntityBusyChanged } =
      useEntityBusyState();

    const isCustomizationStateEmpty = computed<boolean>(() => {
      if (customizationState.value.length === 0) {
        return true;
      }

      // TODO: temporary - current TS version don't handle `value` type right in this case
      const _customizationOptionValue: Record<string, CustomizationOptionValue> = (customizationOptionValue as any).value;

      for (const customization of filteredCustomizations.value) {
        const selectedOptions = _customizationOptionValue[customization.id];

        if (Array.isArray(selectedOptions) && selectedOptions.length > 0) {
          return false;
        }

        if (selectedOptions) {
          return false;
        }
      }

      return true;
    });

    const isFormHasError = computed<boolean>(() => {
    // TODO: temporary - current TS version don't handle `value` type right in this case
      const _validationObserver = (validationObserver as any).value as unknown as InstanceType<typeof ValidationObserver>;

      if (!_validationObserver || isCustomizationStateEmpty.value) {
        return false;
      }

      const hasError = Object.values(_validationObserver.errors).some((item) => item.length > 0);

      return hasError;
    });

    function onCustomizationOptionInput (payload: {
      customizationId: string,
      value: CustomizationOptionValue
    }) {
      updateCustomizationOptionValue(payload);
      executeActionsByCustomizationIdAndCustomizationOptionValue(payload);
    }

    function getCustomizationState (): CustomizationStateItem[] {
      return customizationState.value;
    }

    const formValidation = useFormValidation(
      validationObserver,
      () => getNestedFormRefs(instance.$refs, 'customizationOption'),
      props.draftOrderItem.id.toString()
    );

    const orderItemKey = computed<string>(() => `orderItemCustomization:${draftOrderItem.value.id}`);

    const { removePreservedState } = useCustomizationStatePreservation(
      orderItemKey,
      customizationState,
      ref(undefined),
      [],
      isCustomizable,
      mergeCustomizationState,
      removeUnavailableOptionValues
    );

    function validateForm (): Promise<boolean> {
      return formValidation.validate();
    }

    function scrollToFirstError (): void {
      formValidation.goToFirstError();
    }

    watch(
      isSomeEntityBusy,
      (value) => {
        context.emit(
          'order-item-customization-busy-state-changed',
          { isBusy: value, entityId: props.draftOrderItem.id.toString() }
        );
      },
      {
        immediate: true
      }
    );

    watch(
      isFormHasError,
      (value) => context.emit(
        'order-item-customization-form-errors-changed',
        { hasError: !!value, id: props.draftOrderItem.id }
      )
    );

    return {
      filteredCustomizations,
      customizationAvailableOptionValues,
      customizationOption,
      customizationOptionValue,
      isSomeEntityBusy,
      onEntityBusyChanged,
      onCustomizationOptionInput,
      getCustomizationState,
      isCustomizationStateEmpty,
      validateForm,
      validationObserver,
      scrollToFirstError,
      removePreservedState
    };
  }
});
</script>

<style lang="scss" scoped>
.order-item-customization-form {
  display: flex;
  flex-direction: column;
  column-gap: var(--spacer-base);

  ._customization-option {
    flex-basis: 100%;

    --customization-option-label-display: none;
    --customization-option-description-display: none;
    --customization-option-hint-display: none;

    --customization-option-align-items: center;

    ::v-deep {
      .cards-list-widget {
        width: 100%;
      }
    }
  }
}
</style>
