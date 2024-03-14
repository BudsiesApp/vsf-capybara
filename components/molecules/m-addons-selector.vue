<template>
  <ul
    class="m-addons-selector"
    :class="[
      {
        '-disabled': disabled,
      },
      skinClass,
    ]"
  >
    <li
      class="_item"
      v-for="addon in addons"
      :key="addon.id"
      :style="getItemStyles(addon)"
    >
      <MCheckbox
        name="upgrades[]"
        class="_addon-input"
        :value="addon.optionValueId"
        :selected="selectedValues"
        :disabled="disabled"
        @change="onSelectedValuesChange"
      >
        <template #label>
          <div class="_addon-wrapper">
            <div class="_title">
              {{ addon.name }}
            </div>

            <div class="_price" v-if="addon.regularPrice">
              <strong>
                +
              </strong>

              <SfPrice
                :regular="formatPrice(addon.regularPrice)"
                :special="formatPrice(addon.specialPrice)"
              />
            </div>

            <div class="_content">
              <div class="_description-container">
                <div class="_media">
                  <div
                    v-if="!shouldShowVideo(addon.id)"
                    class="_image-container"
                    :class="{'-wide-image': wideImage}"
                    @click="switchToVideo($event, addon)"
                  >
                    <img v-if="getItemImage(addon)" :src="getItemImage(addon)" class="_image">

                    <img v-if="getItemHoverImage(addon)" :src="getItemHoverImage(addon)" class="_image-hover">
                  </div>

                  <StreamingVideo
                    :video-id="getVideoId(addon)"
                    :provider="getVideoProvider(addon)"
                    :auto-play="true"
                    :display-controls="false"
                    v-if="shouldShowVideo(addon.id) && getVideoId(addon) && getVideoProvider(addon)"
                  />
                </div>

                <div class="_description" v-html="addon.description" />
              </div>

              <div class="_addon-options" v-if="showCustomOptionsForAddon(addon)">
                <div class="_addon-option-item" v-for="option in getCustomOptionsForAddon(addon)" :key="option.option_id">
                  <validation-provider
                    v-slot="{errors}"
                    tag="div"
                    :ref="getFieldAnchorName(option.title)"
                    :name="`'${option.title}'`"
                    :rules="getValidationRuleForCustomOption(option)"
                  >
                    <component
                      :is="getComponentForCustomOption(option)"
                      :value="getValueForCustomOption(option.sku, addon.optionValueId)"
                      :option="option"
                      :addon-option-value-id="addon.optionValueId"
                      :errors="errors"
                      @input="onCustomOptionInput"
                    />
                  </validation-provider>
                </div>
              </div>
            </div>
          </div>
        </template>
      </MCheckbox>
    </li>
  </ul>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import urlParser from 'js-video-url-parser';
import { ValidationProvider, extend } from 'vee-validate';
import { required, max } from 'vee-validate/dist/rules';
import { SfPrice } from '@storefront-ui/vue';

import { CustomOption } from 'core/modules/catalog/types/CustomOption';
import { StreamingVideo } from 'src/modules/shared';
import getCurrentThemeClass from 'theme/helpers/get-current-theme-class';

import AddonOption from '../interfaces/addon-option.interface';
import SelectedAddon from '../interfaces/selected-addon.interface';

import MCheckbox from './m-checkbox.vue';
import AddonsSelectorDropDownCustomOption from './addons-selector/drop-down-custom-option.vue'
import AddonsSelectorFieldCustomOption from './addons-selector/field-custom-option.vue'
import { CustomOptionType } from 'theme/interfaces/custom-option.type';
import { formatPrice } from 'src/modules/shared/helpers/price';

extend('required', {
  ...required,
  message: 'The {_field_} field is required'
});

extend('max', {
  ...max,
  message: 'The {_field_} length should be less than {length}'
});

let instanceId = 0;

export default Vue.extend({
  name: 'MAddonsSelector',
  components: {
    AddonsSelectorDropDownCustomOption,
    AddonsSelectorFieldCustomOption,
    MCheckbox,
    StreamingVideo,
    ValidationProvider,
    SfPrice
  },
  props: {
    addons: {
      type: Array as PropType<AddonOption[]>,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    value: {
      type: Array as PropType<SelectedAddon[]>,
      default: () => []
    },
    wideImage: {
      type: Boolean,
      default: false
    },
    getFieldAnchorName: {
      type: Function as PropType<(field: string) => string>,
      required: true
    }
  },
  data () {
    return {
      instanceId: '',
      // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
      showVideoFlags: {} as Record<number, boolean | undefined>
    };
  },
  computed: {
    addonsIds (): string {
      return this.addons.map((value) => value.id).join('_');
    },
    skinClass (): string {
      return getCurrentThemeClass();
    },
    selectedValues (): number[] {
      return this.value.map(({ addonOptionValueId }) => addonOptionValueId);
    }
  },
  methods: {
    getComponentForCustomOption (option: CustomOption) {
      switch (option.type) {
        case CustomOptionType.FIELD:
          return AddonsSelectorFieldCustomOption;
        case CustomOptionType.DROP_DOWN:
          return AddonsSelectorDropDownCustomOption;
        default:
          throw new Error('Unsupported custom option type: ' + option.type);
      }
    },
    getCustomOptionsForAddon (addon: AddonOption): CustomOption[] {
      return addon.customOptions || [];
    },
    getInputId (addon: AddonOption): string {
      return `design-product-${this.instanceId}-${addon.id}`;
    },
    getItemImage (item: AddonOption): string | undefined {
      return item.images[0];
    },
    getItemHoverImage (item: AddonOption): string | undefined {
      return item.images[1];
    },
    getItemStyles (item: AddonOption): Record<string, string> {
      const result: Record<string, string> = {};

      if (!item.images.length) {
        return result;
      }

      result['--addon-image-regular'] = `url(${item.images[0]})`;

      if (item.images.length === 1) {
        return result;
      }

      result['--addon-image-hover'] = `url(${item.images[1]})`;

      return result;
    },
    getValidationRuleForCustomOption (option: CustomOption): string {
      // All custom option should be required.
      // But if option mark as required in Magento,
      // API don't return related addon in `cart/update` request's response.
      // To make it work, option should be marked as not required in Magento.
      // So we can't check `option.is_required` to apply `required` rule.
      let rules = 'required';

      if (option.max_characters) {
        const maxLengthRule = `max:${option.max_characters}`;
        rules += rules.length ? `|${maxLengthRule}` : maxLengthRule;
      }

      return rules;
    },
    getValueForCustomOption (optionSku: string, addonOptionValueId: number): string {
      const selectedAddon = this.value.find(
        (selectedAddon) => selectedAddon.addonOptionValueId === addonOptionValueId
      );

      if (!selectedAddon) {
        return '';
      }

      return selectedAddon.optionsValues[optionSku] ? selectedAddon.optionsValues[optionSku] : '';
    },
    getVideoId (addon: AddonOption): string | undefined {
      if (!addon.videoUrl) {
        return;
      }

      const info = urlParser.parse(addon.videoUrl);

      if (!info) {
        return;
      }

      return info.id;
    },
    getVideoProvider (addon: AddonOption): string | undefined {
      if (!addon.videoUrl) {
        return;
      }

      const info = urlParser.parse(addon.videoUrl);

      if (!info) {
        return;
      }

      return info.provider;
    },
    onSelectedValuesChange (selectedValues: number[]): void {
      const updatedValue: SelectedAddon[] = [];

      selectedValues.forEach((value) => {
        const selectedAddonIndex = this.value.findIndex(({ addonOptionValueId }) => addonOptionValueId === value);

        if (selectedAddonIndex === -1) {
          updatedValue.push({
            addonOptionValueId: value,
            optionsValues: {}
          })
        } else {
          updatedValue.push(this.value[selectedAddonIndex]);
        }
      });

      this.$emit('input', updatedValue);
    },
    onCustomOptionInput (
      {
        value,
        option,
        addonOptionValueId
      }: {
        value: string,
        option: CustomOption,
        addonOptionValueId: number
      }
    ) {
      const selectedAddonIndex = this.value.findIndex((selectedAddon) => selectedAddon.addonOptionValueId === addonOptionValueId);

      if (selectedAddonIndex === -1) {
        throw new Error(`Not found selected addon with optionValueId: ${addonOptionValueId}`);
      }

      const selectedAddon = this.value[selectedAddonIndex];

      const optionValues = selectedAddon.optionsValues;

      const updatedSelectedAddon: SelectedAddon = {
        addonOptionValueId,
        optionsValues: {
          ...optionValues,
          [option.sku]: value
        }
      }

      const valueForUpdate = [...this.value];
      valueForUpdate.splice(selectedAddonIndex, 1, updatedSelectedAddon);

      this.$emit('input', valueForUpdate);
    },
    shouldShowVideo (addonId: number): boolean {
      return !!this.showVideoFlags[addonId];
    },
    showCustomOptionsForAddon (addon: AddonOption): boolean {
      return this.getCustomOptionsForAddon(addon).length > 0 && this.selectedValues.includes(addon.optionValueId);
    },
    switchToVideo (event: Event, addon: AddonOption): void {
      if (!addon.videoUrl) {
        return;
      }

      event.preventDefault();
      Vue.set(this.showVideoFlags, addon.id, true);
    },
    formatPrice (price: number | null): void {
      return formatPrice(price);
    }
  },
  created (): void {
    this.instanceId = instanceId.toString();

    instanceId += 1;
  },
  watch: {
    addonsIds: {
      handler () {
        const selectedValues: number[] = [];

        this.value.forEach((item) => {
          if (!this.addons.find(
            (addon) => item.addonOptionValueId === addon.optionValueId)
          ) {
            return;
          }

          selectedValues.push(item.addonOptionValueId);
        });

        this.onSelectedValuesChange(selectedValues);
      }
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.m-addons-selector {
  padding: 0;
  list-style: none;

  ._item {
    cursor: pointer;
    margin: 0 calc(var(--spacer-sm) * -1);

    ._addon-input {
      padding: var(--spacer-sm);
      transition: background-color .15s cubic-bezier(0.65, 0.05, 0.35, 1);

      &.sf-checkbox--is-active {
        background: var(--c-secondary);
      }
    }

    ::v-deep .sf-checkbox__container {
      align-items: flex-start;
    }

    ._addon-wrapper {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      margin-left: var(--spacer-sm);
      text-align: left;

      ._title {
        font-weight: var(--font-semibold);
        margin-top: calc(var(--checkbox-size, 1.5rem) / 10);
      }

      ._description {
        font-size: var(--font-sm);

        > :first-child {
          margin-top: 0;
        }
      }
    }

    ._content {
      display: flex;
      flex-direction: column;
      margin-top: var(--spacer-sm);
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

        &.-wide-image {
          margin-left: var(--spacer-xl);
          max-width: 100%;
        }
      }

      ._image {
        width: 100%;
      }

      ._image-hover {
        display: none;
        position: absolute;
        width: 100%;
        z-index: 2;
        top: 0;
        left: 0;
      }

      &:hover {
        ._image-hover {
          display: block;
        }
      }
    }
  }

  &.-disabled {
    ._item {
      --checkbox-cursor: default;

      opacity: 0.7;
      cursor: default;
    }
  }

  ._addon-option-item {
    margin-top: var(--spacer-sm);
  }

  @media (min-width: $tablet-min) {
    ._item {
      margin: 0;

      ._addon-input {
        padding: var(--spacer-sm) var(--spacer-base);
      }
    }
  }
}
</style>
