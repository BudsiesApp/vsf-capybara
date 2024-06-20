<template>
  <div id="customization-system-widgets-test">
    <button @click="toggleSettings" type="button" class="_settings-toggle-button">
      Toggle settings visibility
    </button>

    <div
      class="_customization-container"
      v-for="customization in customizations"
      :key="customization.id"
    >
      <div class="_settings-container" v-show="showSettings">
        <div class="_customization_option_item">
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

            <label
              v-if="
                customization.optionData.displayWidgetOptions &&
                  customization.optionData.displayWidgetOptions.shape
              "
            >
              Shape:

              <select v-model="customization.optionData.displayWidgetOptions.shape">
                <option value="round">Round</option>
                <option value="square">Square</option>
              </select>
            </label>

            <label
              v-if="
                customization.optionData.displayWidgetOptions &&
                  customization.optionData.displayWidgetOptions.alignment
              "
            >
              Layout:

              <select v-model="customization.optionData.displayWidgetOptions.alignment">
                <option value="left">Left</option>
                <option value="center">Center</option>
              </select>
            </label>

            <li>
              Values:
              <ul>
                <li
                  v-for="value in customization.optionData.values"
                  :key="value.id"
                >
                  <label>
                    Is default:
                    <input type="checkbox" v-model="value.isDefault">
                  </label>
                </li>
              </ul>
            </li>
          </ul>

          <div class="_customization_state">
            <strong> Customization State Item:</strong>
            <br>
            {{ customizationOptionValue[customization.id] }}
          </div>
        </div>
      </div>

      <customization-option
        class="_option"
        :customization="customization"
        :is-disabled="false"
        :option-values="customization.optionData.values"
        :product-id="73"
        :value="customizationOptionValue[customization.id]"
        @input="updateCustomizationOptionValue"
        v-if="customization.optionData"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api';
import {
  Customization,
  OptionType,
  useCustomizationState,
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
          hint: 'Some hint',
          maxValuesCount: 0,
          hasGalleryImages: false,
          hasDetailedDescription: false,
          showInUrlQuery: false,
          isRequired: true,
          type: OptionType.GENERIC,
          displayWidget: WidgetType.CARDS_LIST,
          values: [
            {
              id: 'test',
              name: 'Weighted Stuffed Animals',
              description: `A stainless steel pellet-filled insert, hand-sewn into the body of the plush. 2lbs for 16" and 24", 0.5 lb for 10". `,
              thumbnailUrl: `https://api.petsies.storefront.st.budsies.com/img/1350/1674/resize/catalog/product/w/e/weighted_plushies.jpg`,
              price: 20,
              sn: 0,
              galleryImages: [],
              isEnabled: true,
              isDefault: false
            },
            {
              id: 'test_2',
              name: 'Weighted Stuffed Animals',
              description: `A stainless steel pellet-filled insert, hand-sewn into the body of the plush. 2lbs for 16" and 24", 0.5 lb for 10". `,
              thumbnailUrl: `https://api.petsies.storefront.st.budsies.com/img/1350/1674/resize/catalog/product/w/e/weighted_plushies.jpg`,
              price: 10,
              sn: 0,
              galleryImages: [],
              isEnabled: true,
              isDefault: true
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
          hint: 'Some hint',
          maxValuesCount: 0,
          hasGalleryImages: false,
          hasDetailedDescription: false,
          isRequired: true,
          type: OptionType.GENERIC,
          displayWidget: WidgetType.CHECKBOX,
          showInUrlQuery: false,
          values: [
            {
              id: 'yes',
              name: 'My pet has different eye color',
              description: `Some test description`,
              sn: 0,
              galleryImages: [],
              isEnabled: true,
              isDefault: true
            },
            {
              id: 'no',
              name: 'My pet has different eye color',
              description: `Some test description`,
              sn: 1,
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
          hint: 'Some hint',
          maxValuesCount: 0,
          hasGalleryImages: false,
          hasDetailedDescription: false,
          isRequired: true,
          type: OptionType.GENERIC,
          displayWidget: WidgetType.COLORS_LIST,
          showInUrlQuery: false,
          displayWidgetOptions: {
            shape: 'square',
            alignment: 'left'
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
              price: 15,
              sn: 2,
              galleryImages: [],
              isEnabled: true,
              isDefault: false
            }
          ]
        }
      },
      {
        id: 'drop_down_widget',
        name: 'Dropdown Widget',
        type: CustomizationType.OPTION,
        sn: 0,
        isEnabled: true,
        availabilityRules: {
          forActivatedOptionValueIds: []
        },
        optionData: {
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam dictum urna id erat molestie vehicula. Etiam sodales est non dui porttitor, fringilla faucibus libero volutpat. Praesent et nulla a enim.',
          hint: 'Some hint',
          maxValuesCount: 0,
          hasGalleryImages: false,
          hasDetailedDescription: false,
          isRequired: true,
          type: OptionType.GENERIC,
          displayWidget: WidgetType.DROPDOWN,
          showInUrlQuery: false,
          displayWidgetOptions: {
            placeholder: 'Select Item'
          },
          values: [
            {
              id: 'item_1',
              name: 'First Dropdown Item',
              description: `First Item description`,
              sn: 0,
              galleryImages: [],
              isEnabled: true,
              isDefault: false
            },
            {
              id: 'item_2',
              name: 'Second Dropdown Item',
              description: `Second Item description`,
              sn: 1,
              galleryImages: [],
              isEnabled: true,
              isDefault: false
            },
            {
              id: 'item_3',
              name: 'Third Dropdown Item',
              description: `Third Item description`,
              sn: 2,
              galleryImages: [],
              isEnabled: true,
              isDefault: false
            }
          ]
        }
      },
      {
        id: 'free_text_dropdown_widget',
        name: 'Free Text Dropdown Widget',
        type: CustomizationType.OPTION,
        sn: 0,
        isEnabled: true,
        availabilityRules: {
          forActivatedOptionValueIds: []
        },
        optionData: {
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam dictum urna id erat molestie vehicula. Etiam sodales est non dui porttitor, fringilla faucibus libero volutpat. Praesent et nulla a enim.',
          hint: 'Optional. Leave blank if unsure<br>(or make up your own :)',
          maxValuesCount: 0,
          hasGalleryImages: false,
          hasDetailedDescription: false,
          isRequired: true,
          type: OptionType.GENERIC,
          displayWidget: WidgetType.DROPDOWN_FREE_TEXT,
          showInUrlQuery: false,
          displayWidgetOptions: {
            placeholder: 'Select Dropdown Item'
          },
          values: [
            {
              id: 'item_1',
              name: 'First Dropdown Item',
              description: `First Item description`,
              sn: 0,
              galleryImages: [],
              isEnabled: true,
              isDefault: false
            },
            {
              id: 'item_2',
              name: 'Second Dropdown Item',
              description: `Second Item description`,
              sn: 1,
              galleryImages: [],
              isEnabled: true,
              isDefault: false
            },
            {
              id: 'item_3',
              name: 'Third Dropdown Item',
              description: `Third Item description`,
              sn: 2,
              galleryImages: [],
              isEnabled: true,
              isDefault: false
            }
          ]
        }
      },
      {
        id: 'image_upload_widget',
        name: 'Image Upload Widget',
        type: CustomizationType.OPTION,
        sn: 0,
        isEnabled: true,
        availabilityRules: {
          forActivatedOptionValueIds: []
        },
        optionData: {
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam dictum urna id erat molestie vehicula. Etiam sodales est non dui porttitor, fringilla faucibus libero volutpat. Praesent et nulla a enim.',
          hint: 'Some hint',
          maxValuesCount: 0,
          hasGalleryImages: false,
          hasDetailedDescription: false,
          isRequired: true,
          type: OptionType.GENERIC,
          displayWidget: WidgetType.IMAGE_UPLOAD,
          showInUrlQuery: false,
          values: []
        }
      },
      {
        id: 'text_input_widget',
        name: 'Text Input Widget',
        type: CustomizationType.OPTION,
        sn: 0,
        isEnabled: true,
        availabilityRules: {
          forActivatedOptionValueIds: []
        },
        optionData: {
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam dictum urna id erat molestie vehicula. Etiam sodales est non dui porttitor, fringilla faucibus libero volutpat. Praesent et nulla a enim.',
          hint: 'Some hint',
          maxValuesCount: 0,
          hasGalleryImages: false,
          hasDetailedDescription: false,
          isRequired: true,
          type: OptionType.GENERIC,
          displayWidget: WidgetType.TEXT_INPUT,
          showInUrlQuery: false,
          displayWidgetOptions: {
            placeholder: 'Enter your pet\'s name'
          },
          values: []
        }
      },
      {
        id: 'text_area_widget',
        name: 'Text Area Widget',
        type: CustomizationType.OPTION,
        sn: 0,
        isEnabled: true,
        availabilityRules: {
          forActivatedOptionValueIds: []
        },
        optionData: {
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam dictum urna id erat molestie vehicula. Etiam sodales est non dui porttitor, fringilla faucibus libero volutpat. Praesent et nulla a enim.',
          hint: 'Some hint',
          maxValuesCount: 0,
          hasGalleryImages: false,
          hasDetailedDescription: false,
          isRequired: true,
          type: OptionType.GENERIC,
          displayWidget: WidgetType.TEXT_AREA,
          showInUrlQuery: false,
          displayWidgetOptions: {
            placeholder: 'Describe your pet\'s'
          },
          values: []
        }
      },
      {
        id: 'thumbnails_list_widget',
        name: 'Thumbnails List Widget',
        type: CustomizationType.OPTION,
        sn: 0,
        isEnabled: true,
        availabilityRules: {
          forActivatedOptionValueIds: []
        },
        optionData: {
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam dictum urna id erat molestie vehicula. Etiam sodales est non dui porttitor, fringilla faucibus libero volutpat. Praesent et nulla a enim.',
          hint: 'Some hint',
          maxValuesCount: 0,
          hasGalleryImages: false,
          hasDetailedDescription: false,
          isRequired: true,
          type: OptionType.GENERIC,
          displayWidget: WidgetType.THUMBNAILS_LIST,
          showInUrlQuery: false,
          displayWidgetOptions: {
            shape: 'square',
            alignment: 'left'
          },
          values: [
            {
              id: 'item_1',
              name: 'First Item',
              description: `First Item description`,
              sn: 0,
              thumbnailUrl:
                'https://api.petsies.storefront.st.budsies.com/img/290/290/resize/body_part/orig/b/d/e/6f2ea7eb65d706ae2300385142ec8.jpg',
              galleryImages: [],
              isEnabled: true,
              isDefault: false
            },
            {
              id: 'item_2',
              name: 'Second Item',
              description: `Second Item description`,
              thumbnailUrl:
                'https://api.petsies.storefront.st.budsies.com/img/290/290/resize/body_part/orig/a/9/2/befa695317fa7476b0ae045ffca37.jpg',
              sn: 1,
              galleryImages: [],
              isEnabled: true,
              isDefault: false
            },
            {
              id: 'item_3',
              name: 'Third Item',
              description: `Third Item description`,
              thumbnailUrl:
                'https://api.petsies.storefront.st.budsies.com/img/290/290/resize/body_part/orig/2/9/3/b1686c1f54c9da02af0b5af739b4d.jpg',
              price: 15,
              sn: 2,
              galleryImages: [],
              isEnabled: true,
              isDefault: true
            },
            {
              id: 'item_4',
              name: 'Fourth Item',
              description: `Fourth Item description`,
              thumbnailUrl:
                'https://api.petsies.storefront.st.budsies.com/img/290/290/resize/body_part/orig/e/0/5/c1e80b85d4f76e116a17c7b22b124.png',
              price: 15,
              sn: 3,
              galleryImages: [],
              isEnabled: true,
              isDefault: false
            }
          ]
        }
      }
    ]);

    const showSettings = ref<boolean>(true);

    function toggleSettings (): void {
      showSettings.value = !showSettings.value;
    }

    return {
      customizations,
      showSettings,
      toggleSettings,
      ...useCustomizationState(ref())
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

#customization-system-widgets-test {
  box-sizing: border-box;
  padding: 0 1rem;

  ._settings-container,
  ._option {
    flex: 1;
  }

  ._customization_state {
    margin-top: var(--spacer-base);
  }

  ._settings-container {
    margin-right: var(--spacer-xl);
    padding-right: var(--spacer-base);
    border-right: 1px solid #ddd;
  }

  ._customization-container {
    display: flex;
    border-bottom: 1px solid #ddd;
    margin-top: var(--spacer-lg);
    padding-bottom: var(--spacer-lg);
  }

  ._settings-toggle-button {
    position: sticky;
    top: 100px;
  }

  @media (min-width: $tablet-min) {
    max-width: 1024px;
    width: 100%;
    margin: 0 auto;
  }
}
</style>
