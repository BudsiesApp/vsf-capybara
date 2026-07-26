<template>
  <div class="cards-list-widget" :role="groupRole" :aria-labelledby="ariaLabelledby">
    <ul class="_list">
      <li
        class="_item"
        :class="{
          '-can-hide': hiddenOptionValues,
          '-hidden': hiddenOptionValues && hiddenOptionValues[optionValue.id]
        }"
        :disabled="isDisabled"
        v-for="optionValue in sortedValues"
        :key="optionValue.id"
      >
        <m-checkbox
          class="_checkbox"
          :class="{
            '-expandable': expandConfig && expandConfig[optionValue.id] && expandConfig[optionValue.id].isExpandable,
            '-expanded': expandConfig && expandConfig[optionValue.id] && expandConfig[optionValue.id].isExpanded
          }"
          :aria-describedby="ariaDescribedby"
          :aria-invalid="ariaInvalid"
          :disabled="isDisabled"
          :valid="isValid"
          :value="optionValue.id"
          :input-type="inputType"
          :selected="selectedOption"
          @change="onSelectedOptionChange"
        >
          <template #checkmark="{ isChecked }">
            <div class="_checkmark-wrapper">
              <div class="_checkmark-container">
                <div
                  class="sf-checkbox__checkmark"
                  :class="{ 'sf-checkbox__checkmark--is-active': isChecked }"
                >
                  <SfIcon
                    v-show="isChecked"
                    icon="check"
                    size="12px"
                    color="white"
                  />
                </div>

                <div class="sf-checkbox__label _title-wrapper">
                  <div class="_title" v-if="optionValue.name">
                    {{ optionValue.name }}
                  </div>

                  <a-added-to-cart
                    v-if="addedToCartOptionValueId && addedToCartOptionValueId[optionValue.id]"
                  />

                  <div
                    class="_price"
                    v-else-if="optionValuePriceDictionary[optionValue.id]"
                  >
                    <strong> + </strong>

                    <SfPrice
                      :regular="
                        formatPrice(
                          optionValuePriceDictionary[optionValue.id].regular
                        )
                      "
                      :special="
                        formatPrice(
                          optionValuePriceDictionary[optionValue.id].special
                        )
                      "
                    />
                  </div>
                </div>
              </div>

              <div
                class="_expand-chevron-container"
                @click.stop.prevent="$emit('expand-clicked', optionValue.id)"
              >
                <SfChevron />
              </div>
            </div>
          </template>

          <template #label>
            <div class="_label-container">
              <div class="_description-wrapper">
                <div class="_media" v-if="getItemImage(optionValue)">
                  <div class="_image-container">
                    <base-image
                      class="_image"
                      v-if="getItemImage(optionValue)"
                      :aspect-ratio="1"
                      :src="getItemImage(optionValue)"
                      alt=""
                    />
                  </div>
                </div>

                <div
                  class="_description"
                  v-html="optionValue.description"
                  v-if="optionValue.description"
                />
              </div>
            </div>
          </template>
        </m-checkbox>
      </li>
    </ul>

    <div
      :id="errorMessageId"
      class="_error-message"
      aria-live="polite"
    >
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  toRefs
} from 'vue';
import { SfChevron, SfIcon, SfPrice } from '@storefront-ui/vue';
import { getThumbnailPath } from '@vue-storefront/core/helpers';

import { BaseImage } from 'src/modules/budsies';
import {
  ListWidgetInputType,
  OptionValue,
  useListWidget,
  useOptionValuesPrice,
  useValuesSort
} from 'src/modules/customization-system';
import { useErrorAccessibility } from 'theme/helpers/use-error-accessibility';

import AAddedToCart from 'theme/components/atoms/a-added-to-cart.vue';
import MCheckbox from 'theme/components/molecules/m-checkbox.vue';

export default defineComponent({
  name: 'CardsListWidget',
  components: {
    AAddedToCart,
    BaseImage,
    MCheckbox,
    SfChevron,
    SfIcon,
    SfPrice
  },
  props: {
    error: {
      type: String,
      default: undefined
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    maxValuesCount: {
      type: Number as PropType<number | undefined>,
      default: undefined
    },
    value: {
      type: [String, Array] as PropType<string | string[] | undefined>,
      default: undefined
    },
    values: {
      type: Array as PropType<OptionValue[]>,
      default: () => []
    },
    addedToCartOptionValueId: {
      type: Object as PropType<Record<string, boolean> | undefined>,
      default: undefined
    },
    expandConfig: {
      type: Object as PropType<Record<string, {
        isExpandable: boolean,
        isExpanded: boolean
      }> | undefined>,
      default: undefined
    },
    hiddenOptionValues: {
      type: Object as PropType<Record<string, boolean> | undefined>,
      default: undefined
    },
    ariaLabelledby: {
      type: String as PropType<string | undefined>,
      default: undefined
    }
  },
  setup (props, context) {
    const { maxValuesCount, value, values } = toRefs(props);
    const hasError = computed<boolean>(() => !!props.error);

    function getItemImage (optionValue: OptionValue): string | undefined {
      if (!optionValue.thumbnailUrl) {
        return;
      }
      return getThumbnailPath(optionValue.thumbnailUrl, 500, 500, '');
    }

    const isValid = computed<boolean>(() => {
      return !props.error;
    });

    const listWidgetFields = useListWidget(value, maxValuesCount, context);

    const onSelectedOptionChange = (selectedOption: string | string[] | undefined): void => {
      listWidgetFields.selectedOption.value = selectedOption;
    };

    const groupRole = computed<string>(() => {
      return listWidgetFields.inputType.value === ListWidgetInputType.RADIO
        ? 'radiogroup'
        : 'group';
    });

    const { ariaDescribedby, ariaInvalid, errorMessageId } = useErrorAccessibility(
      'cards-list-widget',
      hasError
    );

    return {
      ariaDescribedby,
      ariaInvalid,
      errorMessageId,
      groupRole,
      getItemImage,
      isValid,
      onSelectedOptionChange,
      ...listWidgetFields,
      ...useOptionValuesPrice(values),
      ...useValuesSort(values)
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "~@storefront-ui/shared/styles/helpers/typography";

.cards-list-widget {
  width: auto;

  ._list {
    padding: 0;
    list-style: none;
  }

  ._item {
    cursor: pointer;

    &:disabled {
      cursor: default;
    }

    &.-can-hide {
      display: grid;
      grid-template-rows: 1fr;
      transition: grid-template-rows 300ms ease-in-out;

      ._checkbox {
        transition: padding 300ms ease-in-out;
        will-change: padding;
        overflow: hidden;
      }

      &.-hidden {
        grid-template-rows: 0fr;

        ._checkbox {
          padding: 0;
        }
      }
    }
  }

  ._label-container {
    display: grid;
    grid-template-rows: 1fr;
    width: 100%;
  }

  ._checkbox {
    --checkbox-font-size: var(--font-size-base);
    --m-checkbox-align-items: flex-start;

    padding: var(--cards-list-checkbox-padding, var(--spacer-sm));
    transition: background-color 0.15s cubic-bezier(0.65, 0.05, 0.35, 1);

    ._expand-chevron-container {
      display: flex;
      padding: var(--spacer-2xs);
      padding-right: 0;
      display: none;
    }

    &.-expandable {
      ._expand-chevron-container {
        display: flex;
      }

      ._label-container {
        grid-template-rows: 0fr;
        transition: grid-template-rows 300ms ease-in-out;
        will-change: grid-template-rows;
      }

      ._description-wrapper {
        overflow: hidden;
        margin-top: 0;
        transition: margin-top 300ms ease-in-out;
        will-change: margin-top;
      }

      &.-expanded {
        ._label-container {
          grid-template-rows: 1fr;
        }

        ._description-wrapper {
          margin-top: var(--spacer-xs);
        }

        ::v-deep .sf-chevron {
          rotate: 180deg;
        }
      }
    }

    &.sf-checkbox--is-active {
      background-color: var(--c-secondary);
    }

    ::v-deep {
      .sf-checkbox__container {
        flex-direction: column;
      }
    }
  }

  ._checkmark-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: var(--cards-list-checkmark-align-items, center);
    width: 100%;
  }

  ._checkmark-container {
    display: flex;
    width: var(--cards-list-checkmark-container-width, auto);
  }

  ._title-wrapper {
    display: flex;
    align-items: flex-start;
    flex-direction: row;
    justify-content: var(--cards-list-title-justify-content, flex-start);
    gap: var(--spacer-xs);
  }

  ._title {
    font-weight: var(--font-semibold);
    margin-top: calc(var(--checkbox-size, 1.5rem) / 10);
    text-align: start;
  }

  ._price {
    color: var(--c-accent);
    font-size: var(--font-base);
    white-space: nowrap;

    --price-regular-color: var(--c-accent);
    --price-regular-font-weight: var(--font-bold);
    --price-regular-font-size: var(--font-base);

    --price-special-font-weight: var(--font-bold);
    --price-special-font-size: var(--font-base);

    --price-old-font-size: var(--font-base);

    .sf-price {
      display: inline-flex;
    }
  }

  ._description-wrapper {
    text-align: left;
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    gap: var(--spacer-sm);
    margin-top: var(--spacer-xs);
    width: 100%;
  }

  ._media {
    width: 30%;
    flex-shrink: 0;

    ._image-container {
      position: relative;
      display: flex;
      max-height: var(--image-container-max-height, auto);
    }

    ._image {
      width: 100%;
    }
  }

  ._description {
    font-size: var(--font-sm);

    > :first-child {
      margin-top: 0;
    }
  }

  ._error-message {
    color: var(--widget-error-message-color, var(--c-danger-variant));
    height: calc(var(--font-xs) * 1.2);
    margin-top: var(--spacer-xs);

    @include font(
      --widget-error-message-font,
      var(--font-medium),
      var(--font-xs),
      1.2,
      var(--font-family-secondary)
    );
  }

  @include for-desktop {
    ._media {
      width: 25%;
    }
  }
}
</style>
