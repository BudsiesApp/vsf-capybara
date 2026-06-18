<template>
  <div class="cart-item-configuration-extended">
    <template v-if="hasCustomizableProperties">
      <div
        v-for="group in customizationGroups"
        :key="group.groupKey"
        :class="[
          '_property',
          { '-list': group.isList }
        ]"
      >
        <span class="_customization-name">{{ group.customizationName }}:</span>

        <ul
          v-if="group.isList"
          class="_customization-values-list"
        >
          <li
            v-for="property in group.properties"
            :key="property.id"
            class="_property-row"
          >
            <SfIcon
              icon="check"
              size="xxs"
              class="_property-icon"
            />

            {{ property.value }}

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
          </li>
        </ul>

        <template v-else>
          <span>
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
import { SfIcon, SfPrice, SfProperty } from '@storefront-ui/vue';
import { defineComponent, PropType } from '@vue/composition-api';

import { CartItemConfigurationGroup } from 'src/modules/customization-system';
import { useMobileObserver } from 'src/modules/shared';

export default defineComponent({
  name: 'CartItemConfigurationExtended',
  components: {
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
    }
  },
  setup () {
    const { isMobile } = useMobileObserver();

    function truncate (text: string, desktopLength = 75, mobileLength = 50): string {
      const maxLength = isMobile.value ? mobileLength : desktopLength;

      if (text.length <= maxLength) {
        return text;
      }

      return text.substring(0, maxLength) + '...';
    }

    return { truncate };
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
    margin-bottom: var(--spacer-xs);
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
      border-top: none;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  ._customization-values-list {
    list-style: none;
    margin: 0;
    padding: 0;
    width: 100%;
  }

  ._property-row {
    font-size: var(--cart-item-configuration-font-size, var(--font-xs));
    margin-bottom: var(--spacer-xs);
    display: flex;
    align-items: center;
    gap: var(--spacer-xs);
    width: 100%;

    &:last-child {
      margin-bottom: 0;
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

  ._option-price {
    display: inline-block;
    margin-left: auto;
    --price-regular-font-size: var(--cart-item-configuration-font-size, var(--font-xs));
    --price-special-font-size: var(--cart-item-configuration-font-size, var(--font-xs));
    --price-old-font-size: var(--cart-item-configuration-font-size, var(--font-xs));
  }
}
</style>
