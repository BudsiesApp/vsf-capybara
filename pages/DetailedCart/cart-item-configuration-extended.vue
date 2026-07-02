<template>
  <div
    class="cart-item-configuration-extended"
    :class="{'-disabled': isOptionsManageDisabled}"
  >
    <template v-if="hasCustomizableProperties">
      <div
        v-for="group in customizationGroups"
        :key="group.groupKey"
        :class="[
          '_property',
          {
            '-list': group.isList,
            '-inactive': removedGroups[group.groupKey]
          }
        ]"
      >
        <span class="_customization-name">
          {{ group.customizationName }}:
        </span>

        <ul
          v-if="group.isList"
          class="_customization-values-list"
        >
          <li
            v-for="property in group.properties"
            :key="property.id"
            :class="[
              '_property-row',
              { '-inactive': isRemovedOptionValue(group.customizationId, property.optionValueId) }
            ]"
          >
            <SfIcon
              icon="check"
              size="xxs"
              class="_property-icon"
            />

            <span
              class="_property-value"
            >
              {{ property.value }}
            </span>

            <span
              v-if="property.qty"
              class="_quantity"
            >
              {{ property.qty }}
            </span>
            <SfPrice
              v-if="property.price"
              class="_option-price"
              :regular="property.price"
            />

            <template v-if="removableOptions[property.optionValueId] !== undefined">
              <SfButton
                v-if="!removableOptions[property.optionValueId]"
                class="sf-button--text _action-button"
                :aria-label="$t('Remove') + ` ${property.value}`"
                :title="$t('Remove')"
                @click="remove(group.customizationId, property.optionValueId)"
              >
                <img
                  src="/assets/trash-bin.svg"
                  :alt="$t('Remove').toString()"
                  class="_action-icon"
                >
              </SfButton>

              <SfButton
                v-else
                class="sf-button--text _action-button"
                :aria-label="$t('Restore') + ` ${property.value}`"
                :title="$t('Restore')"
                @click="restore(group.customizationId, property.optionValueId)"
              >
                <img
                  src="/assets/undo.svg"
                  :alt="$t('Restore').toString()"
                  class="_action-icon"
                >
              </SfButton>
            </template>
          </li>
        </ul>

        <template v-else>
          <span
            :class="{ '-inactive': isRemovedOptionValue(group.customizationId, group.properties[0].optionValueId) }"
            class="_property-value"
          >
            {{ group.properties[0].value }}
          </span>

          <span
            v-if="group.properties[0].qty"
            class="_quantity"
          >
            {{ group.properties[0].qty }}
          </span>

          <SfPrice
            v-if="group.properties[0].price"
            class="_option-price"
            :regular="group.properties[0].price"
          />

          <template v-if="removableOptions[group.properties[0].optionValueId] !== undefined">
            <SfButton
              v-if="!removableOptions[group.properties[0].optionValueId]"
              class="sf-button--text _action-button"
              :aria-label="$t('Remove') + ` ${group.properties[0].value}`"
              :title="$t('Remove')"
              @click="remove(group.customizationId, group.properties[0].optionValueId)"
            >
              <img
                src="/assets/trash-bin.svg"
                :alt="$t('Remove').toString()"
                class="_action-icon"
              >
            </SfButton>

            <SfButton
              v-else
              class="sf-button--text _action-button"
              :title="$t('Restore')"
              :aria-label="$t('Restore') + ` ${group.properties[0].value}`"
              @click="restore(group.customizationId, group.properties[0].optionValueId)"
            >
              <img
                src="/assets/undo.svg"
                :alt="$t('Restore').toString()"
                class="_action-icon"
              >
            </SfButton>
          </template>
        </template>
      </div>
    </template>

    <template v-else>
      <div
        v-for="option in productOptions"
        :key="option.label"
        class="_property"
      >
        <SfProperty
          v-if="option.isCustom"
          :name="option.label"
          :value="option.value"
        />

        <div v-else>
          {{ truncate(option.value) }}
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { SfButton, SfIcon, SfPrice, SfProperty } from '@storefront-ui/vue';
import { computed, ComputedRef, defineComponent, PropType } from '@vue/composition-api';

import { CartItemConfigurationGroup, CustomizationOptionValue, isFileUploadValue } from 'src/modules/customization-system';
import { useMobileObserver } from 'src/modules/shared';

export default defineComponent({
  name: 'CartItemConfigurationExtended',
  components: {
    SfButton,
    SfIcon,
    SfPrice,
    SfProperty
  },
  props: {
    customizationGroups: {
      type: Array as PropType<CartItemConfigurationGroup[]>,
      default: () => []
    },
    hasCustomizableProperties: {
      type: Boolean,
      default: false
    },
    productOptions: {
      type: Array as PropType<{ value: string, label: string, isCustom?: boolean }[]>,
      default: () => []
    },
    removableOptions: {
      type: Object as PropType<Record<string, boolean>>,
      default: () => ({})
    },
    removedOptions: {
      type: Object as PropType<Record<string, CustomizationOptionValue>>,
      default: () => ({})
    },
    isOptionsManageDisabled: {
      type: Boolean,
      default: false
    }
  },
  setup (props, context) {
    const { isMobile } = useMobileObserver();

    function isRemovedOptionValue (
      customizationId: string,
      optionValueId?: string
    ): boolean {
      if (!optionValueId) {
        return false;
      }

      const removedOptionValue = props.removedOptions[customizationId];

      if (!removedOptionValue || isFileUploadValue(removedOptionValue)) {
        return false;
      }

      if (Array.isArray(removedOptionValue)) {
        return removedOptionValue.includes(optionValueId);
      }

      return removedOptionValue === optionValueId;
    }

    const removedGroups: ComputedRef<Record<string, boolean>> = computed(() => {
      const groups: Record<string, boolean> = {};

      for (const group of props.customizationGroups) {
        if (!group.isList) {
          const optionValueId = group.properties[0]?.optionValueId;

          if (!optionValueId) {
            continue;
          }

          groups[group.groupKey] = isRemovedOptionValue(group.customizationId, optionValueId);
          continue;
        }

        let hasRemovedProperties = false;
        let hasActiveProperties = false;

        for (const property of group.properties) {
          if (!property.optionValueId) {
            continue;
          }

          if (isRemovedOptionValue(group.customizationId, property.optionValueId)) {
            hasRemovedProperties = true;
            continue;
          }

          hasActiveProperties = true;
        }

        groups[group.groupKey] = hasRemovedProperties && !hasActiveProperties;
      }

      return groups;
    });

    function truncate (text: string, desktopLength = 75, mobileLength = 50): string {
      const maxLength = isMobile.value ? mobileLength : desktopLength;

      if (text.length <= maxLength) {
        return text;
      }

      return text.substring(0, maxLength) + '...';
    }

    function remove (customizationId: string, optionValueId: string): void {
      if (props.isOptionsManageDisabled) {
        return;
      }

      context.emit('remove-option', { customizationId, optionValue: optionValueId });
    }

    function restore (customizationId: string, optionValueId: string): void {
      if (props.isOptionsManageDisabled) {
        return;
      }

      context.emit('restore-option', { customizationId, optionValue: optionValueId });
    }

    return {
      isRemovedOptionValue,
      removedGroups,
      remove,
      restore,
      truncate
    };
  }
});
</script>

<style lang="scss" scoped>
.cart-item-configuration-extended {
  --property-name-font-size: var(--font-xs);
  --property-value-font-size: var(--font-xs);

  ._property {
    padding: var(--configuration-item-padding, 0);
    border-top: var(--configuration-item-border-top, none);

    font-size: var(--cart-item-configuration-font-size, var(--font-xs));
    margin-top: var(--spacer-xs);
    display: flex;
    align-items: center;
    gap: var(--spacer-xs);

    &.-list {
      gap: var(--spacer-xs);
      flex-direction: column;
      align-items: flex-start;
      display: flex;
    }

    &:first-child {
      padding-top: 0;
      margin-top: 0;
      border-top: none;
    }
  }

  ._customization-values-list {
    list-style: none;
    margin: 0;
    padding: 0;
    width: 100%;
  }

  ._property-row {
    border-top: var(--configuration-item-border-top, none);
    padding: var(--configuration-item-padding, 0);
    font-size: var(--cart-item-configuration-font-size, var(--font-xs));
    margin-top: var(--spacer-xs);
    display: flex;
    align-items: center;
    gap: var(--spacer-xs);
    width: 100%;

    &:first-child {
      padding-top: 0;
      margin-top: 0;
      border-top: none;
    }
  }

  ._property-value {
    &.-inactive {
      color: var(--c-text-muted);
      text-decoration: line-through;
    }
  }

  ._property-row.-inactive {
    ._property-icon,
    ._property-value,
    ._quantity {
      color: var(--c-text-muted);
    }

    ._property-value {
      text-decoration: line-through;
    }

    ._option-price {
      --price-regular-color: var(--c-text-muted);
      --price-special-color: var(--c-text-muted);
      --price-old-color: var(--c-text-muted);
    }
  }

  ._property.-inactive {
    ._quantity,
    ._customization-name {
      color: var(--c-text-muted);
    }

    ._option-price {
      --price-regular-color: var(--c-text-muted);
      --price-special-color: var(--c-text-muted);
      --price-old-color: var(--c-text-muted);
    }
  }

  ._property-icon {
    display: inline-block;

    --icon-color: var(--cart-item-configuration-checkmark-color, var(--c-primary));
  }

  ._customization-name,
  ._quantity {
    font-weight: var(--font-bold);
  }

  ._customization-name.-inactive {
    color: var(--c-text-muted);
  }

  ._option-price {
    display: inline-block;
    margin-left: auto;
    --price-regular-font-size: var(--cart-item-configuration-font-size, var(--font-xs));
    --price-special-font-size: var(--cart-item-configuration-font-size, var(--font-xs));
    --price-old-font-size: var(--cart-item-configuration-font-size, var(--font-xs));
  }

  ._action-button {
    --button-font-size: var(--font-xs);
    --button-padding: 0;
    white-space: nowrap;
    margin-left: var(--spacer-2xs);
    width: 1.5rem;
    height: 1rem;
  }

  ._action-icon {
    display: block;
    width: 1.5rem;
    height: 1.5rem;
    position: absolute;
    transform: translateY(-50%);
  }

  &.-disabled {
    ._action-button {
      opacity: 0.5;
    }
  }
}
</style>
