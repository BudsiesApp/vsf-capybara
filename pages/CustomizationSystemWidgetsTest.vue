<template>
  <div id="customization-system-widgets-test">
    <div
      class="_customization_option_item"
      v-for="customization in customizations"
      :key="customization.id"
    >
      Customization settings

      <ul class="_settings">
        <li>
          <label>
            Is required:
            <input
              type="checkbox"
              v-model="customization.optionData.isRequired"
            >
          </label>
        </li>

        <li>
          <label>
            Max values count:
            <input
              type="number"
              v-model.number="customization.optionData.maxValuesCount"
            >
          </label>
        </li>

        <label v-if="customization.optionData.widgetConfig">
          Shape:

          <select v-model="customization.optionData.widgetConfig.shape">
            <option value="round">Round</option>
            <option value="square">Square</option>
          </select>
        </label>

        <li>
          Values:
          <ul>
            <li v-for="value in customization.optionData.values" :key="value.id">
              <label>
                Is default:
                <input type="checkbox" v-model="value.isDefault">
              </label>
            </li>
          </ul>
        </li>
      </ul>

      <customization-option
        class="_option"
        :customization="customization"
        :is-disabled="false"
        :product-id="73"
        :selected-option-values-ids="[]"
        v-model="customizationState[customization.id]"
      />

      <div class="_customization_state">
        Customization State Item:
        {{ customizationState[customization.id] }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api';
import { Dictionary } from 'src/modules/budsies';
import {
  Customization,
  CustomizationStateItem,
  OptionType,
  WidgetType
} from 'src/modules/customization-system';
import { CustomizationType } from 'src/modules/customization-system/types/customization-type';

import CustomizationOption from 'theme/components/customization-system/customization-option.vue';

export default defineComponent({
  name: 'CustomizationSystemWidgetsTestPage',
  components: {
    CustomizationOption
  },
  setup () {
    const customizationState = ref<Dictionary<CustomizationStateItem>>({});
    const customizations = ref<Customization[]>([
      {
        id: 'cards_list_widget',
        name: 'Cards List Widget',
        type: CustomizationType.OPTION,
        sn: 0,
        isEnabled: true,
        availabilityRules: {
          forActivatedOptionValueIds: []
        },
        optionData: {
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam dictum urna id erat molestie vehicula. Etiam sodales est non dui porttitor, fringilla faucibus libero volutpat. Praesent et nulla a enim.',
          maxValuesCount: 0,
          hasGalleryImages: false,
          isRequired: true,
          type: OptionType.GENERIC,
          displayWidget: WidgetType.CARDS_LIST,
          values: [
            {
              id: 'test',
              name: 'Weighted Stuffed Animals',
              description: `A stainless steel pellet-filled insert, hand-sewn into the body of the plush. 2lbs for 16" and 24", 0.5 lb for 10". `,
              previewUrl: `https://api.petsies.storefront.st.budsies.com/img/1350/1674/resize/catalog/product/w/e/weighted_plushies.jpg`,
              price: 20,
              sn: 0,
              galleryImages: [],
              isEnabled: true,
              isDefault: false
            }
          ]
        }
      },
      {
        id: 'checkbox_widget',
        name: 'Checkbox Widget',
        type: CustomizationType.OPTION,
        sn: 0,
        isEnabled: true,
        availabilityRules: {
          forActivatedOptionValueIds: []
        },
        optionData: {
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam dictum urna id erat molestie vehicula. Etiam sodales est non dui porttitor, fringilla faucibus libero volutpat. Praesent et nulla a enim.',
          maxValuesCount: 0,
          hasGalleryImages: false,
          isRequired: true,
          type: OptionType.GENERIC,
          displayWidget: WidgetType.CHECKBOX,
          values: [
            {
              id: 'checkbox checked',
              name: 'My pet has different eye color',
              description: `Some test description`,
              sn: 0,
              galleryImages: [],
              isEnabled: true,
              isDefault: false
            }
          ]
        }
      },
      {
        id: 'colors_list_widget',
        name: 'Colors List Widget',
        type: CustomizationType.OPTION,
        sn: 0,
        isEnabled: true,
        availabilityRules: {
          forActivatedOptionValueIds: []
        },
        optionData: {
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam dictum urna id erat molestie vehicula. Etiam sodales est non dui porttitor, fringilla faucibus libero volutpat. Praesent et nulla a enim.',
          maxValuesCount: 0,
          hasGalleryImages: false,
          isRequired: true,
          type: OptionType.GENERIC,
          displayWidget: WidgetType.COLORS_LIST,
          widgetConfig: {
            shape: 'square'
          },
          values: [
            {
              id: 'item_1',
              name: 'First Item',
              description: `First Item description`,
              sn: 0,
              color: 'black',
              galleryImages: [],
              isEnabled: true,
              isDefault: false
            },
            {
              id: 'item_2',
              name: 'Second Item',
              description: `Second Item description`,
              color: 'yellow',
              sn: 1,
              galleryImages: [],
              isEnabled: true,
              isDefault: false
            },
            {
              id: 'item_3',
              name: 'Third Item',
              description: `Third Item description`,
              color: 'green',
              sn: 2,
              galleryImages: [],
              isEnabled: true,
              isDefault: false
            }
          ]
        }
      }
    ]);

    return {
      customizations,
      customizationState
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

#customization-system-widgets-test {
  box-sizing: border-box;
  padding: 0 1rem;

  ._customization_option_item {
    margin-top: var(--spacer-lg);
    padding-bottom: var(--spacer-lg);
    border-bottom: 1px solid #ddd;
  }

  ._settings {
  }

  ._customization_state,
  ._option {
    margin-top: var(--spacer-base);
  }

  @media (min-width: $tablet-min) {
    max-width: 640px;
    width: 100%;
    margin: 0 auto;
  }
}
</style>
