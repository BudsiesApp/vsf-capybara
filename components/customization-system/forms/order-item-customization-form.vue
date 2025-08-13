<template>
  <validation-observer
    tag="div"
    class="order-item-customization-form"
    ref="validationObserver"
  >
    <customization-option
      v-for="customization in availableCustomizations"
      class="_customization-option"
      ref="customizationOption"
      :key="customization.id"
      :customization="customization"
      :is-disabled="isDisabled"
      :option-values="customizationAvailableOptionValues[customization.id]"
      :product-id="+product.id"
      :value="customizationOptionValue[customization.id]"
      :disable-validation="isCustomizationStateEmpty"
      :field-name-prefix="draftOrderItem.id"
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
  ref,
  toRefs,
  watch
} from '@vue/composition-api';
import { ValidationObserver } from 'vee-validate';

import Product from '@vue-storefront/core/modules/catalog/types/Product';
import {
  Customization,
  CustomizationOptionValue,
  CustomizationStateItem,
  DraftOrderItem,
  useAvailableCustomizations,
  useEntityBusyState,
  useCustomizationState,
  useOptionValueActions
} from 'src/modules/customization-system';

import { useFormValidation } from 'theme/helpers/use-form-validation';

import CustomizationOption from 'theme/components/customization-system/customization-option.vue';

function getAllFormRefs (
  refs: Record<string, Vue | Element | Vue[] | Element[]>
): Record<string, Vue | Element | Vue[] | Element[]> {
  let refsDictionary: Record<string, Vue | Element | Vue[] | Element[]> = {};
  const customizationOptions = refs['customizationOption'] as InstanceType<
    typeof CustomizationOption
  >[];

  for (const customizationOption of customizationOptions) {
    for (const key in customizationOption.$refs) {
      refsDictionary[key] = customizationOption.$refs[key];
    }
  }

  return refsDictionary;
}

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
    const { draftOrderItem, product } = toRefs(props);

    const validationObserver = ref<InstanceType<typeof ValidationObserver> | null>(null);
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

    const {
      addCustomizationOptionValue,
      customizationOptionValue,
      customizationState,
      removeCustomizationOptionValue,
      selectedOptionValuesIds,
      updateCustomizationOptionValue
    } = useCustomizationState(undefined, initialCustomizationState);

    const {
      availableCustomizations,
      customizationAvailableOptionValues
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

    const { isSomeEntityBusy, onEntityBusyChanged } =
      useEntityBusyState();

    const isCustomizationStateEmpty = computed<boolean>(() => {
      return customizationState.value.length === 0;
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
      () => getAllFormRefs(context.refs),
      props.draftOrderItem.id
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
          { isBusy: value, entityId: props.draftOrderItem.id }
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
      availableCustomizations,
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
      scrollToFirstError
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.order-item-customization-form {
  display: flex;
  flex-wrap: wrap;
  column-gap: var(--spacer-base);
  justify-content: center;

  ._customization-option {
    margin-bottom: var(--spacer-base);
    flex-basis: 100%;
    flex-grow: 1;
  }

  @media (min-width: $tablet-min) {
    ._customization-option {
      flex-basis: 40%;
    }
  }
}
</style>
