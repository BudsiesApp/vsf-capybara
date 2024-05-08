<template>
  <div class="cards-list-widget">
    <ul>
      <li
        v-for="optionValue in values"
        :key="optionValue.id"
      >
        <m-checkbox
          class="_checkbox"
          :disabled="isDisabled"
          :valid="isValid"
          v-model="selectedValue"
        >
          <template #label>
            <div class="_wrapper">
              <div class="_title" v-if="optionValue.name">
                {{ optionValue.name }}
              </div>

              <div class="_price" v-if="getOptionValuePrice(optionValue)">
                <strong>
                  +
                </strong>

                <SfPrice
                  :regular="getOptionValuePrice(optionValue).regularPrice"
                  :special="getOptionValuePrice(optionValue).specialPrice"
                />
              </div>

              <div class="_content">
                <div class="_media">
                  <div
                    class="_image-container"
                    :class="{'-wide-image': wideImage}"
                  >
                    <img
                      v-if="getItemImage(optionValue)"
                      :src="getItemImage(optionValue)"
                      class="_image"
                    >

                    <!-- <img
                     v-if="getItemHoverImage(addon)"
                      :src="getItemHoverImage(addon)"
                       class="_image-hover"
                       > -->
                  </div>

                  <!-- <StreamingVideo
                    :video-id="getVideoId(addon)"
                    :provider="getVideoProvider(addon)"
                    :auto-play="true"
                    :display-controls="false"
                    v-if="shouldShowVideo(addon.id) && getVideoId(addon) && getVideoProvider(addon)"
                  /> -->
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
import { computed, defineComponent, PropType } from '@vue/composition-api';

import { OptionValue } from 'src/modules/customization-system';
import { PriceHelper } from 'src/modules/shared';

import MCheckbox from 'theme/components/molecules/m-checkbox.vue';

export default defineComponent({
  name: 'CardsListWidget',
  components: {
    MCheckbox
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
    value: {
      type: [String, Array] as PropType<string | string[] | undefined>,
      default: undefined
    },
    values: {
      type: Array as PropType<OptionValue[]>,
      default: () => []
    }
  },
  setup (props, { emit, root }) {
    function getOptionValuePrice (optionValue: OptionValue): PriceHelper.ProductPrice | undefined {
      if (!optionValue.sku) {
        return;
      }

      const product = root.$store.getters['product/getProductBySkuDictionary'];

      if (!product) {
        return;
      }

      return PriceHelper.getCartItemPrice(product, {}, false);
    }

    function getItemImage (optionValue: OptionValue): string | undefined {
      return optionValue.previewUrl;
    }

    const isValid = computed<boolean>(() => {
      return !props.error;
    });
    const selectedValue = computed<string | string[] | undefined>({
      get: () => {
        return props.value
      },
      set: (newValue) => {
        emit('input', newValue)
      }
    })

    return {
      isValid,
      getOptionValuePrice,
      getItemImage,
      selectedValue
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/typography";

.cards-list-widget {
  ._error-message {
    color: var(--input-error-message-color, var(--c-danger));
    height: calc(var(--font-xs) * 1.2);

    @include font(
      --input-error-message-font,
      var(--font-medium),
      var(--font-xs),
      1.2,
      var(--font-family-secondary)
    );
  }
}
</style>
