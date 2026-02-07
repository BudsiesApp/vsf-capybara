<template>
  <div
    class="alteration-product-form"
    v-if="showBlock"
  >
    <div class="_heading-container">
      <SfHeading
        class="_heading"
        :level="5"
        :title="$t('Upgrade Your Plush')"
      />

      <template v-if="collapsedViewItems.length > 0">
        <SfButton
          v-if="isExpanded"
          class="sf-button--text"
          @click="onHideDetailsClick"
        >
          {{ $t('Show Less') }}
        </SfButton>
      </template>
    </div>

    <div
      class="_collapsed-preview"
      :class="{ '-hidden': isExpanded || collapsedViewItems.length == 0 }"
    >
      <div
        class="_products"
        :class="{ '-has-more-desktop': hasMoreDesktop, '-has-more-mobile': hasMoreMobile }"
        :style="gridStyle"
      >
        <o-product-card
          v-for="(item, index) in collapsedViewItems"
          :key="item.id"
          :product="item"
          :wishlist-icon="false"
          :is-added-to-cart="item.isAddedToCart"
          :image-width="300"
          :image-height="300"
          class="_product -upgrade"
          :class="{ '-hidden-desktop': isItemHiddenOnDesktop(index), '-hidden-mobile': isItemHiddenOnMobile(index) }"
          @click.native.prevent="onCollapsedViewItemClick(item)"
        />
        <div
          class="_show-more-tile"
          @click="onShowDetailsClick"
        >
          <span>
            {{ $t('More') }}<br>
            {{ $t('Upgrades') }}
          </span>
          <SfIcon
            icon="chevron_down"
            size="xxs"
            view-box="0 0 24 24"
          />
        </div>
      </div>
    </div>

    <div
      class="_content"
      :class="{ '-expanded': isExpanded || collapsedViewItems.length == 0 }"
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
              :added-to-cart-message-config="addedToCartMessageConfigByCustomizationId[customization.id]"
              @input="onCustomizationOptionInput"
              @customization-option-busy-state-changed="onEntityBusyChanged"
            >
              <template #label="{label, isFieldRequired}">
                <label
                  class="_option-label"
                  :class="{ '-required': isFieldRequired && !addedToCartMessageConfigByCustomizationId[customization.id].isCustomizationAlreadyInCart}"
                >
                  {{ label }}

                  <span
                    class="_disabled-hint"
                    v-if="addedToCartMessageConfigByCustomizationId[customization.id].isCustomizationAlreadyInCart"
                  >
                    {{ addedToCartMessageConfigByCustomizationId[customization.id].message }}
                  </span>
                </label>
              </template>
            </customization-option>
          </div>

          <m-form-errors
            class="_form-errors"
            :form-errors="formErrors"
            @item-click="goToFieldByName"
          />

          <div class="_buttons">
            <SfButton
              class="_add-to-cart color-primary"
              type="submit"
              :disabled="!canAddToCart || isSubmitting"
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
  PropType,
  Ref,
  ref,
  toRefs
} from '@vue/composition-api';
import { SfButton, SfHeading, SfIcon } from '@storefront-ui/vue';
import { ValidationObserver } from 'vee-validate';

import Product from '@vue-storefront/core/modules/catalog/types/Product';

import {
  Customization,
  CustomizationOptionValue,
  isFileUploadValue,
  requiredCustomizationsFilter,
  useAvailableCustomizations,
  useAvailableOptionsValuesFilter,
  useCustomizationsBundleOptions,
  useCustomizationsFilter,
  useCustomizationsOptionsDefaultValue,
  useCustomizationState,
  useEntityBusyState,
  useExistingCartItemAddedToCartMessage,
  useOptionValueActions
} from 'src/modules/customization-system';
import {
  canOrderItemHaveUpgrades,
  OrderItem
} from 'src/modules/orders-history';

import { useAlterationProductCustomizations } from 'theme/helpers/use-alteration-product-customizations';

import { useAddToCart } from 'theme/helpers/use-add-to-cart';
import { useCollapsedCustomizationsView, CollapsedViewItem } from 'theme/helpers/use-collapsed-customizations-view';
import { useExistingCartItem } from 'theme/helpers/use-existing-cart-item';
import { useFormValidation } from 'theme/helpers/use-form-validation';
import CustomizationOption from 'theme/components/customization-system/customization-option.vue';
import MFormErrors from 'theme/components/molecules/m-form-errors.vue';
import OProductCard from 'theme/components/organisms/o-product-card.vue';

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
    SfHeading,
    SfIcon,
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
      return orderItem.value.plushie_id?.toString();
    });

    const { existingCartItem } = useExistingCartItem(plushieId, context);

    const productCustomizations = computed<Customization[]>(() => {
      return props.alterationProduct?.customizations || [];
    });

    const productCustomization = computed<Record<string, Customization>>(() => {
      const dictionary: Record<string, Customization> = {};

      for (const customization of productCustomizations.value) {
        dictionary[customization.id] = customization;
      }

      return dictionary;
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
      availableCustomizations,
      availableCustomization: availableCustomizationDictionary,
      availableOptionValues,
      customizationAvailableOptionValues
    } = useAvailableCustomizations(
      productCustomizations,
      selectedOptionValuesIds,
      customizationOptionValue,
      updateCustomizationOptionValue
    );

    const {
      customizationsFilter: alterationProductCustomizationsFilter,
      optionValuesFilter
    } = useAlterationProductCustomizations(
      orderItem,
      alterationProduct
    );

    const { addedToCartMessageConfigByCustomizationId } = useExistingCartItemAddedToCartMessage(
      availableCustomizations,
      existingCartItemCustomizationOptionValue,
      context.root.$t('Added to Cart').toString()
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
    }

    useCustomizationsOptionsDefaultValue(
      availableCustomizations,
      customizationAvailableOptionValues,
      customizationOptionValue,
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
      collapsedViewItems,
      getCollapsedViewItemCustomizationOptionValue
    } = useCollapsedCustomizationsView(
      filteredCustomizations,
      existingCartItemCustomizationOptionValue,
      filteredOptionValuesIdsByCustomizationId,
      context
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

    function onCollapsedViewItemClick (item: CollapsedViewItem) {
      onShowDetailsClick();

      const value = getCollapsedViewItemCustomizationOptionValue(
        item,
        availableCustomizationDictionary.value,
        customizationOptionValue.value
      );
      onCustomizationOptionInput(value);
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

    const DESKTOP_TILES_CAP = 6;
    const MOBILE_TILES_CAP = 3;
    const hasMoreDesktop = computed(() => collapsedViewItems.value.length > DESKTOP_TILES_CAP);
    const hasMoreMobile = computed(() => collapsedViewItems.value.length > MOBILE_TILES_CAP);

    const gridStyle = {
      '--desktop-cols': DESKTOP_TILES_CAP,
      '--mobile-cols': MOBILE_TILES_CAP
    };

    function isItemHiddenOnDesktop (index: number) {
      // If we have more items than desktop cap, we need to make room for "More Upgrades" tile
      // So we show (CAP - 1) items, and hide the rest.
      // Index is 0-based. So if CAP is 6, we show 0,1,2,3,4. Index 5+ are hidden.
      return index >= (DESKTOP_TILES_CAP - 1);
    }

    function isItemHiddenOnMobile (index: number) {
      return index >= (MOBILE_TILES_CAP - 1);
    }

    return {
      ...formValidation,
      addedToCartMessageConfigByCustomizationId,
      addToCartButtonText,
      canAddToCart,
      collapsedViewItems,
      filteredOptionValues,
      customizationOptionValue,
      isExpanded,
      isSomeEntityBusy,
      isSubmitting,
      onAddToCart,
      onCollapsedViewItemClick,
      onCustomizationOptionInput,
      onEntityBusyChanged,
      onHideDetailsClick,
      onShowDetailsClick,
      showBlock,
      filteredCustomizations,
      validationObserver,
      hasMoreDesktop,
      hasMoreMobile,
      isItemHiddenOnDesktop,
      isItemHiddenOnMobile,
      gridStyle
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.alteration-product-form {
  ._heading-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    column-gap: var(--spacer-sm);
  }

  ._heading {
    --heading-title-font-size: var(--font-base);
    --heading-title-font-weight: var(--font-semibold);
    --heading-title-margin: 0;
    --heading-padding: 0;

    text-align: left;
  }

  ._collapsed-preview {
    display: flex;
    flex-direction: column;

    &.-hidden {
      display: none;
    }
  }

  ._products {
    display: grid;
    grid-template-columns: repeat(var(--desktop-cols), 1fr);
    margin-top: var(--spacer-sm);
    column-gap: var(--spacer-sm);
  }

  ._product {
    --o-product-card-badge-size: 48px;
    --product-card-title-font-size: var(--font-size-base);
    --price-regular-font-size: var(--font-size-base);
    --price-special-font-size: var(--font-size-base);
    --price-old-font-size: var(--font-size-base);
    --product-card-title-font-line-height: 1.2;

    max-width: 160px;

    ::v-deep {
      .sf-product-card {
        --product-card-padding: var(--spacer-xs);
      }

      .sf-badge {
        z-index: 2;
      }

      .base-image {
        width: 100%;
      }

      .sf-price {
        flex-wrap: wrap;
      }
    }
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

  ._products.-has-more-desktop {
    ._show-more-tile {
      display: flex;
    }

    ._product.-upgrade.-hidden-desktop {
      display: none;
    }
  }

  ._disabled-hint {
    color: var(--c-accent);
    font-size: var(--font-base);
  }

  ._content {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 300ms ease-in-out;

    &.-expanded {
      grid-template-rows: 1fr;

      &::after {
        display: none;
      }
    }
  }

  ._content-inner {
    overflow: hidden;
    display: flex;
    flex-direction: column;
    row-gap: var(--spacer-base);
  }

  ._customization,
  ._form-errors {
    margin-top: var(--spacer-base);
  }

  ._buttons {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacer-sm);
    margin-top: var(--spacer-base);
  }

  ._customization-option {
    --customization-option-align-items: flex-start;
    --customization-option-label-align: left;
    --customization-option-label-weight: var(--font-medium);
    --customization-option-label-size: var(--font-base);
    --customization-option-description-align: left;
    --customization-option-hint-align: left;

    --customization-option-hint-display: none;
    --customization-option-description-display: none;

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
    ._products {
      grid-template-columns: repeat(var(--mobile-cols), 1fr);
      column-gap: var(--spacer-xs);
    }

    ._products.-has-more-mobile {
      ._show-more-tile {
        display: flex;
      }

      ._product.-upgrade.-hidden-mobile {
        display: none;
      }
    }
  }
}
</style>
