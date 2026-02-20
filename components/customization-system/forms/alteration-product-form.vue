<template>
  <div
    class="alteration-product-form"
    v-if="showBlock"
  >
    <div
      class="_heading-container"
      :class="{ '-expanded': isExpanded, '-expandable': hasMore}"
      role="button"
      tabindex="0"
      @click="onToggleButtonClick"
      @keydown.enter.prevent="onToggleButtonClick"
      @keydown.space.prevent="onToggleButtonClick"
    >
      <SfHeading
        class="_heading"
        :level="5"
        :title="$t('Upgrade Your Plush')"
      />

      <SfChevron
        class="_heading-chevron"
      />
    </div>

    <div
      class="_content"
      :class="{ '-expanded': isContentExpanded, '-has-more': hasMore }"
    >
      <div class="_content-inner">
        <validation-observer
          v-slot="{ errors: formErrors }"
          tag="form"
          ref="validationObserver"
          @submit.prevent.native="onAddToCart"
        >
          <div
            class="_customization"
            v-for="customization in filteredCustomizations"
            :class="{
              '-hidden': !isContentExpanded && collapsedViewItemsByCustomization[customization.id].isCustomizationFullyHidden
            }"
            :key="customization.id"
          >
            <customization-option
              class="_customization-option"
              ref="customizationOption"
              :customization="customization"
              :is-disabled="isSomeEntityBusy || isSubmitting"
              :option-values="filteredOptionValues[customization.id]"
              :product-id="alterationProduct ? Number(alterationProduct.id) : 0"
              :value="customizationOptionValue[customization.id]"
              :disable-validation="false"
              :added-to-cart-option-value-id="addedToCartOptionValueId[customization.id]"
              :expand-config="expandConfigByCustomization[customization.id]"
              :hidden-option-values="isContentExpanded ? {} : collapsedViewItemsByCustomization[customization.id].hiddenOptionValues"
              @input="onCustomizationOptionInput"
              @customization-option-busy-state-changed="onEntityBusyChanged"
              @expand-clicked="onOptionValueExpandClicked"
            >
              <template #label="{ label, isFieldRequired }">
                <div class="_option-label-container">
                  <label
                    class="_option-label"
                    :class="{ '-required': isFieldRequired }"
                  >
                    {{ label }}
                  </label>
                </div>
              </template>
            </customization-option>
          </div>

          <m-form-errors
            class="_form-errors"
            :form-errors="formErrors"
            @item-click="goToFieldByName"
          />

          <div class="_buttons">
            <div
              class="_show-more-tile"
              @click="onToggleButtonClick"
              v-show="hasMore && !isExpanded"
            >
              <a href="javascript:void(0)">
                {{ $t('See more') }}
              </a>
            </div>

            <SfButton
              class="_add-to-cart color-primary"
              type="submit"
              :disabled="!canAddToCart || isSubmitting"
              v-show="isContentExpanded"
            >
              {{ addToCartButtonText }}
            </SfButton>
          </div>
        </validation-observer>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ComputedRef,
  PropType,
  Ref,
  ref,
  watch,
  toRefs,
  set
} from '@vue/composition-api';
import { SfButton, SfChevron, SfHeading } from '@storefront-ui/vue';
import { ValidationObserver } from 'vee-validate';

import Product from '@vue-storefront/core/modules/catalog/types/Product';

import {
  Customization,
  CustomizationOptionValue,
  OptionType,
  OptionValue,
  PRODUCTION_TIME_SELECTOR_STANDARD_OPTION_VALUE_ID,
  requiredCustomizationsFilter,
  useAvailableCustomizations,
  useAvailableOptionsValuesFilter,
  useCustomizationsBundleOptions,
  useCustomizationsFilter,
  useCustomizationsOptionsDefaultValue,
  useCustomizationState,
  useEntityBusyState,
  useExistingCartItemOptionValues,
  useOptionValueActions
} from 'src/modules/customization-system';
import {
  canOrderItemHaveUpgrades,
  OrderItem
} from 'src/modules/orders-history';

import { useAlterationProductCustomizations } from 'theme/helpers/use-alteration-product-customizations';
import { useOrderItemAndAlterationProductMapping } from 'theme/helpers/use-order-item-and-alteration-product-mapping';

import { useAddToCart } from 'theme/helpers/use-add-to-cart';
import { useCollapsedCustomizationsView } from 'theme/helpers/use-collapsed-customizations-view';
import { useExistingCartItem } from 'theme/helpers/use-existing-cart-item';
import { useFormValidation } from 'theme/helpers/use-form-validation';
import CustomizationOption from 'theme/components/customization-system/customization-option.vue';
import MFormErrors from 'theme/components/molecules/m-form-errors.vue';
import OProductCard from 'theme/components/organisms/o-product-card.vue';

function useStandardProductionTimeSelectionEnforcement (
  productionTimeCustomizationId: ComputedRef<string | undefined>,
  customizationAvailableOptionValues: ComputedRef<Record<string, OptionValue[]>>,
  customizationOptionValue: Ref<Record<string, CustomizationOptionValue>>,
  orderItemOptionValue: Ref<Record<string, CustomizationOptionValue>>,
  onCustomizationOptionInput: (payload: { customizationId: string, value: CustomizationOptionValue }) => void
) {
  const hasStandardProductionTimeOptionValueSelected = computed<boolean>(() => {
    const customizationId = productionTimeCustomizationId.value;

    if (!customizationId) {
      return false;
    }

    const selectedValue = customizationOptionValue.value[customizationId] || orderItemOptionValue.value[customizationId];

    return selectedValue === PRODUCTION_TIME_SELECTOR_STANDARD_OPTION_VALUE_ID;
  });

  function ensureSelected (): void {
    const customizationId = productionTimeCustomizationId.value;

    if (!customizationId) {
      return;
    }

    const selectedValue = customizationOptionValue.value[customizationId] || orderItemOptionValue.value[customizationId];

    if (selectedValue) {
      return;
    }

    if (hasStandardProductionTimeOptionValueSelected.value) {
      return;
    }

    onCustomizationOptionInput({
      customizationId,
      value: PRODUCTION_TIME_SELECTOR_STANDARD_OPTION_VALUE_ID
    });
  }

  watch(
    [productionTimeCustomizationId, customizationAvailableOptionValues],
    () => {
      ensureSelected();
    },
    { immediate: true, deep: true }
  );

  watch(
    customizationOptionValue,
    () => {
      ensureSelected();
    },
    { deep: true }
  );
}

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
  name: 'AlterationProductForm',
  components: {
    CustomizationOption,
    MFormErrors,
    OProductCard,
    SfButton,
    SfChevron,
    SfHeading,
    ValidationObserver
  },
  props: {
    orderItem: {
      type: Object as PropType<OrderItem>,
      required: true
    },
    alterationProduct: {
      type: Object as PropType<Product | undefined>,
      default: undefined
    }
  },
  setup (props, context) {
    const { orderItem, alterationProduct } = toRefs(props);
    const isExpanded = ref(false);
    const validationObserver: Ref<InstanceType<typeof ValidationObserver> | null> = ref(null);

    const plushieId = computed<string | undefined>(() => {
      return orderItem.value.extension_attributes?.plushie_id?.toString();
    });

    const { existingCartItem } = useExistingCartItem(plushieId, context);

    const mapping = useOrderItemAndAlterationProductMapping(orderItem, alterationProduct);

    const productCustomizations = computed<Customization[]>(() => {
      return alterationProduct.value?.customizations || [];
    });

    const productCustomization = computed<Record<string, Customization>>(() => {
      const dictionary: Record<string, Customization> = {};

      for (const customization of productCustomizations.value) {
        dictionary[customization.id] = customization;
      }

      return dictionary;
    });

    const productionTimeCustomizationId = computed<string | undefined>(() => {
      const customization = productCustomizations.value.find((item) => item.optionData?.type === OptionType.PRODUCTION_TIME);

      return customization?.id;
    });

    const {
      addCustomizationOptionValue,
      customizationOptionValue,
      customizationState,
      existingCartItemCustomizationOptionValue,
      removeCustomizationOptionValue,
      selectedOptionValuesIds,
      updateCustomizationOptionValue
    } = useCustomizationState(existingCartItem);

    const {
      customizationsFilter: alterationProductCustomizationsFilter,
      orderItemSelectedOptionValueIds,
      orderItemOptionValue,
      optionValuesFilter
    } = useAlterationProductCustomizations(
      orderItem,
      alterationProduct,
      productCustomization,
      mapping
    );

    const {
      availableCustomizations,
      availableOptionValues,
      customizationAvailableOptionValues
    } = useAvailableCustomizations(
      productCustomizations,
      selectedOptionValuesIds,
      customizationOptionValue,
      updateCustomizationOptionValue,
      orderItemSelectedOptionValueIds
    );

    const { addedToCartOptionValueId } = useExistingCartItemOptionValues(
      availableCustomizations,
      existingCartItemCustomizationOptionValue
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

    const { isSomeEntityBusy, onEntityBusyChanged } = useEntityBusyState();

    const formValidation = useFormValidation(validationObserver, () =>
      getAllFormRefs(context.refs)
    );

    function onCustomizationOptionInput (payload: {
      customizationId: string,
      value: CustomizationOptionValue
    }) {
      updateCustomizationOptionValue(payload);
      executeActionsByCustomizationIdAndCustomizationOptionValue(payload);

      if (!isExpanded.value) {
        isExpanded.value = true;
      }
    }

    useCustomizationsOptionsDefaultValue(
      availableCustomizations,
      customizationAvailableOptionValues,
      customizationOptionValue,
      onCustomizationOptionInput
    );

    useStandardProductionTimeSelectionEnforcement(
      productionTimeCustomizationId,
      customizationAvailableOptionValues,
      customizationOptionValue,
      orderItemOptionValue,
      onCustomizationOptionInput
    );

    const { filteredOptionValues, filteredOptionValuesIdsByCustomizationId } = useAvailableOptionsValuesFilter(
      customizationAvailableOptionValues,
      [optionValuesFilter]
    );

    const { filteredCustomizations } = useCustomizationsFilter(
      availableCustomizations,
      customizationAvailableOptionValues,
      [requiredCustomizationsFilter, alterationProductCustomizationsFilter]
    );

    const { bundleOptions } = useCustomizationsBundleOptions(
      productCustomizations,
      customizationOptionValue,
      availableOptionValues
    );

    const quantity = ref(1);

    const { addToCartHandler, isSubmitting } = useAddToCart(
      alterationProduct,
      quantity,
      customizationState,
      bundleOptions,
      existingCartItem,
      context,
      plushieId.value
    );

    const canAddToCart = computed<boolean>(() => {
      return selectedOptionValuesIds.value.length !== 0;
    });

    const hasAvailableUpgrades = computed<boolean>(() => {
      return filteredCustomizations.value.length > 0;
    });

    const showBlock = computed<boolean>(() => {
      if (!alterationProduct.value) {
        return false;
      }

      if (!canOrderItemHaveUpgrades(orderItem.value)) {
        return false;
      }

      return hasAvailableUpgrades.value;
    });

    const {
      collapsedViewItemsByCustomization,
      hasMore
    } = useCollapsedCustomizationsView(
      filteredCustomizations,
      existingCartItemCustomizationOptionValue,
      filteredOptionValuesIdsByCustomizationId
    );

    const addToCartButtonText = computed<string>(() => {
      if (existingCartItem.value) {
        return context.root.$t('Update Cart').toString();
      }

      return context.root.$t('Add to Cart').toString();
    });

    function onShowDetailsClick () {
      isExpanded.value = true;
    }

    function onHideDetailsClick () {
      isExpanded.value = false;
    }

    function onToggleButtonClick () {
      if (!hasMore.value) {
        return;
      }

      if (isExpanded.value) {
        onHideDetailsClick();
        return;
      }

      onShowDetailsClick();
    }

    async function onAddToCart () {
      if (!canAddToCart.value || isSubmitting.value) {
        return;
      }

      const isValid = await formValidation.validateAndGoToFirstError();

      if (!isValid) {
        return;
      }

      try {
        await addToCartHandler();

        const notification = {
          type: 'info',
          message: context.root.$t('Upgrades were added to the cart').toString(),
          timeToLive: 10 * 1000,
          action1: { label: context.root.$t('OK') },
          action2: {
            label: context.root.$t('Proceed to checkout'),
            action: () => context.root.$router.push({ name: 'checkout' })
          }
        };

        context.root.$store.dispatch(
          'notification/spawnNotification',
          notification
        );
      } catch (error) {
        context.root.$store.dispatch('notification/spawnNotification', {
          type: 'danger',
          message: (error as Error).message,
          action1: { label: context.root.$t('OK') }
        });
      }
    }

    const expandedOptionValues: Ref<Record<string, boolean>> = ref({});

    function onOptionValueExpandClicked (optionValueId: string): void {
      set(expandedOptionValues.value, optionValueId, !expandedOptionValues.value[optionValueId]);
    }

    const expandConfigByCustomization: ComputedRef<Record<string, Record<string, {isExpandable: boolean, isExpanded: boolean}>>> = computed(() => {
      const result: Record<string, Record<string, {isExpandable: boolean, isExpanded: boolean}>> = {};

      for (const customization of filteredCustomizations.value) {
        result[customization.id] = {};

        for (const optionValue of (customization.optionData?.values || [])) {
          result[customization.id][optionValue.id] = {
            isExpandable: true,
            isExpanded: !!expandedOptionValues.value[optionValue.id]
          };
        }
      }

      return result;
    });

    const isContentExpanded = computed(() => {
      return isExpanded.value || !hasMore.value;
    });

    return {
      ...formValidation,
      addedToCartOptionValueId,
      addToCartButtonText,
      canAddToCart,
      filteredOptionValues,
      isContentExpanded,
      customizationOptionValue,
      expandConfigByCustomization,
      onOptionValueExpandClicked,
      isExpanded,
      isSomeEntityBusy,
      isSubmitting,
      onAddToCart,
      onCustomizationOptionInput,
      collapsedViewItemsByCustomization,
      onEntityBusyChanged,
      onToggleButtonClick,
      showBlock,
      filteredCustomizations,
      validationObserver,
      hasMore
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.alteration-product-form {
  border: 1px solid var(--c-secondary);
  padding: var(--spacer-sm);

  ._heading-container {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    column-gap: var(--spacer-xs);

    ._heading-chevron {
      display: none;
    }
  }

  ._heading-container.-expandable {
    cursor: pointer;
    user-select: none;

    ._heading-chevron {
      display: block;
    }
  }

  ._heading-container.-expanded {
    ::v-deep .sf-chevron {
      rotate: 180deg;
    }
  }

  ._heading {
    --heading-title-font-size: var(--font-base);
    --heading-title-font-weight: var(--font-semibold);
    --heading-title-margin: 0;
    --heading-padding: 0;

    flex: 0 0 auto;

    text-align: left;
  }

  ._heading-chevron {
    flex: 0 0 auto;
  }
  ._show-more-tile {
    display: none;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    row-gap: var(--spacer-xs);
    cursor: pointer;
    text-align: center;
    font-size: var(--font-size-sm);
    font-weight: var(--font-medium);
  }

  ._content.-has-more {
    ._show-more-tile {
      display: flex;
    }
  }

  ._customization {
    display: grid;
    grid-template-rows: 1fr;
    transition-property: grid-template-rows, margin;
    transition-duration: 300ms;
    transition-timing-function: ease-in-out;

    &.-hidden {
      grid-template-rows: 0fr;
    }
  }

  ._content {
    display: grid;
    grid-template-rows: 1fr;
    transition: grid-template-rows 300ms ease-in-out;
    will-change: grid-template-rows;

    &.-expanded {
      ._customization {
        grid-template-rows: 1fr;
      }

      ._customization,
      ._form-errors {
        margin-top: var(--spacer-base);
      }

      &::after {
        display: none;
      }
    }

    &:not(.-expanded) {
      ._buttons {
        margin-top: var(--spacer-sm);
      }

      ._customization {

        &:first-child {
          margin: var(--spacer-sm) 0 0;
        }
      }

      ._customization-option {
        --customization-option-widget-margin: 0;

        ._option-label-container {
          grid-template-rows: 0fr;
        }

        ::v-deep {
          ._error-message {
            display: none;
          }
        }
      }
    }
  }

  ._content-inner {
    overflow: hidden;
    display: flex;
    flex-direction: column;
    row-gap: var(--spacer-base);
  }

  ._buttons {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacer-sm);
    margin-top: var(--spacer-base);
    transition: margin-top 300ms ease-in-out;
  }

  ._customization-option {
    --customization-option-align-items: flex-start;
    --customization-option-label-align: left;
    --customization-option-label-weight: var(--font-medium);
    --customization-option-label-size: var(--font-size-base);
    --customization-option-description-align: left;
    --customization-option-hint-align: left;

    --customization-option-hint-display: none;
    --customization-option-description-display: none;

    overflow: hidden;
    transition: margin 300ms ease-in-out;

    ._option-label-container {
      display: grid;
      grid-template-rows: 1fr;
      transition: grid-template-rows 300ms ease-in-out;
    }

    ::v-deep {
      ._option-label {
        overflow: hidden;
      }

      ._error-message {
        text-align: center;
      }
    }

    &.-widget-CardsListWidget {
      --image-container-max-height: 120px;

      width: 100%;

      ::v-deep {
        ._widget {
          width: 100%;
        }
      }
    }
  }

  @media (max-width: $mobile-max) {
    padding: var(--spacer-sm) var(--spacer-xs);

    ._customization-option {
      &.-widget-CardsListWidget {
        --cards-list-checkbox-padding: var(--spacer-xs);
        --checkbox-label-margin:  0 0 0 var(--spacer-xs);
        --cards-list-checkmark-align-items: flex-start;
        --cards-list-title-justify-content: space-between;
        --cards-list-checkmark-container-width: 100%;
      }
    }
  }
}
</style>
