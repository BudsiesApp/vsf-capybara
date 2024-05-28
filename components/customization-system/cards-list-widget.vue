<template>
  <div class="cards-list-widget">
    <ul class="_list">
      <li
        class="_item"
        v-for="optionValue in sortedValues"
        :key="optionValue.id"
      >
        <m-checkbox
          class="_checkbox"
          :disabled="isDisabled"
          :valid="isValid"
          :value="optionValue.id"
          v-model="selectedOption"
        >
          <template #label>
            <div class="_wrapper">
              <div class="_title" v-if="optionValue.name">
                {{ optionValue.name }}
              </div>

              <div
                class="_price"
                v-if="optionValuePriceDictionary[optionValue.id]"
              >
                <strong> + </strong>

                <SfPrice
                  :regular="formatPrice(optionValuePriceDictionary[optionValue.id].regular)"
                  :special="formatPrice(optionValuePriceDictionary[optionValue.id].special)"
                />
              </div>

              <div class="_content">
                <div class="_media">
                  <div class="_image-container">
                    <base-image
                      class="_image"
                      v-if="getItemImage(optionValue)"
                      :aspect-ratio="1"
                      :src="getItemImage(optionValue)"
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

    <div class="_error-message">
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
} from '@vue/composition-api';
import { SfPrice } from '@storefront-ui/vue';

import { BaseImage } from 'src/modules/budsies';
import {
  OptionValue,
  useDefaultValue,
  useListWidget,
  useOptionValuesPrice,
  useValuesSort
} from 'src/modules/customization-system';

import MCheckbox from 'theme/components/molecules/m-checkbox.vue';

export default defineComponent({
  name: 'CardsListWidget',
  components: {
    BaseImage,
    MCheckbox,
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
    }
  },
  setup (props, context) {
    const { maxValuesCount, value, values } = toRefs(props);

    function getItemImage (optionValue: OptionValue): string | undefined {
      return optionValue.thumbnailUrl;
    }

    const isValid = computed<boolean>(() => {
      return !props.error;
    });

    const listWidgetFields = useListWidget(value, maxValuesCount, context);
    useDefaultValue(listWidgetFields.selectedOption, values);

    return {
      getItemImage,
      isValid,
      ...listWidgetFields,
      ...useOptionValuesPrice(values, context),
      ...useValuesSort(values)
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/typography";

.cards-list-widget {
  width: 100%;

  ._list {
    padding: 0;
    list-style: none;
  }

  ._item {
    cursor: pointer;
  }

  ._checkbox {
    padding: var(--spacer-sm);
    transition: background-color 0.15s cubic-bezier(0.65, 0.05, 0.35, 1);

    &.sf-checkbox--is-active {
      background-color: var(--c-secondary);
    }

    ::v-deep .sf-checkbox__container {
      align-items: flex-start;
    }
  }

  ._wrapper {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    margin-left: var(--spacer-sm);
    text-align: left;
  }

  ._content {
    margin-top: var(--spacer-sm);
  }

  ._title {
    font-weight: var(--font-semibold);
    margin-top: calc(var(--checkbox-size, 1.5rem) / 10);
  }

  ._price {
    color: var(--c-accent);
    font-size: var(--font-base);
    margin-top: 1em;

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

  ._media {
    float: right;
    width: 40%;
    padding: 0 0 var(--spacer-sm) var(--spacer-sm);

    ._image-container {
      position: relative;
      display: flex;
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
}
</style>
