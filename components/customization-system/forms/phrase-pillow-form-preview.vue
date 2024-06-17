<template>
  <div class="phrase-pillow-form-preview">
    <div class="_front_design_preview_container">
      <MCustomizerPreview
        :is-back-side-focused.sync="isCustomizerPreviewBackSideFocused"
      >
        <template #frontSmall>
          <SfHeading :level="4" title="Front" class="_section-header" />

          <div
            class="_preview-image-small"
            v-if="isCustomizerPreviewBackSideFocused"
          >
            <img
              class="_background"
              :style="smallBackgroundImageStyle"
              :src="croppedBackground"
              v-if="croppedBackground"
            >

            <MLivePreview
              ref="frontPreviewSmall"
              :template-fetch-url="svgPath"
              :design-sku="frontDesign"
              :accent-color="accentColor"
              :custom-text-values="customTextValues"
              v-if="frontDesign"
            />
          </div>
        </template>

        <template #backSmall>
          <SfHeading :level="4" title="Back" />

          <div
            class="_preview-image-small"
            v-if="!isCustomizerPreviewBackSideFocused"
          >
            <MLivePreview
              ref="backPreviewSmall"
              :template-fetch-url="svgPath"
              :design-sku="backDesign"
              :accent-color="accentColor"
              :custom-text-values="customTextValues"
              v-if="backDesign"
            />
          </div>
        </template>

        <template #front>
          <SfHeading :level="4" title="Front" />

          <MBackgroundEditor
            ref="backgroundEditor"
            class="_front-preview"
            :disabled="isDisabled"
            :background-offset-settings="backgroundOffsetSettings"
            @background-image-assigned="updateSmallBackgroundImage"
          >
            <slot>
              <MLivePreview
                ref="frontPreview"
                :template-fetch-url="svgPath"
                :design-sku="frontDesign"
                :accent-color="accentColor"
                :custom-text-values="customTextValues"
                @custom-text-fields-prepared="onFrontCustomTextFieldsPrepared"
                @background-offset-settings-prepared="
                  onBackgroundOffsetSettingsPrepared
                "
                v-if="frontDesign"
                v-show="!isCustomizerPreviewBackSideFocused"
              />
            </slot>
          </MBackgroundEditor>
        </template>

        <template #back>
          <SfHeading :level="4" title="Back" />

          <MLivePreview
            ref="backPreview"
            class="_back-preview"
            :template-fetch-url="svgPath"
            :design-sku="backDesign"
            :accent-color="accentColor"
            :custom-text-values="customTextValues"
            :is-background-loaded="isBackgroundImageLoaded"
            @custom-text-fields-prepared="onBackCustomTextFieldsPrepared"
            v-if="backDesign"
          />
        </template>
      </MCustomizerPreview>

      <div
        class="_design-images-container -show-for-medium-up"
        v-if="currentDesignImages.length"
      >
        <SfHeading :level="3" title="Examples of finished pillows" />

        <MDesignImages
          class="_design-images"
          :images="currentDesignImages"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  inject,
  nextTick,
  PropType,
  Ref,
  ref,
  toRefs,
  watch
} from '@vue/composition-api';
import { SfHeading } from '@storefront-ui/vue';

import {
  Customization,
  CustomizationOptionValue,
  FileUploadValue,
  isFileUploadValue,
  OptionValue,
  WidgetType
} from 'src/modules/customization-system';
import BackgroundOffsetSettings from 'theme/components/interfaces/background-offset-settings.interface';
import CustomTextFieldInterface from 'theme/components/interfaces/custom-text-field.interface';

import MBackgroundEditor from 'theme/components/molecules/m-background-editor.vue';
import MCustomizerPreview from 'theme/components/molecules/m-customizer-preview.vue';
import MDesignImages from 'theme/components/molecules/m-design-images.vue';
import MLivePreview from 'theme/components/molecules/m-live-preview.vue';
import { ImageHandlerService } from 'src/modules/file-storage';

interface SmallBackgroundImageStyle {
  width: string,
  height: string,
  top: string,
  left: string
}

const ACCENT_COLOR_SKU = 'accent_color';
const BACK_DESIGN_SKU = 'back_design';
const FRONT_DESIGN_SKU = 'front_design';

function useCustomizationOptionValue (
  optionDataSkuCustomization: Ref<Record<string, Customization>>,
  customizationOptionValue: Ref<Record<string, CustomizationOptionValue>>,
  customizationOptionValues: Ref<OptionValue[]>,
  optionDataSku: string
) {
  const customization = computed<Customization | undefined>(() => {
    return optionDataSkuCustomization.value[optionDataSku];
  });
  const optionValue = computed<OptionValue | undefined>(() => {
    if (!customization.value || !customization.value.optionData?.sku) {
      return;
    }

    const customizationStateItem =
      customizationOptionValue.value[customization.value.id];

    if (!customizationStateItem || typeof customizationStateItem !== 'string') {
      return;
    }

    const optionValue = customizationOptionValues.value.find(
      (item) => item.id === customizationStateItem
    );

    return optionValue;
  });
  const optionValueSku = computed<string | undefined>(() => {
    return optionValue.value?.sku;
  });

  return {
    optionValue,
    optionValueSku
  };
}

function useCustomTextFields () {
  const customTextFields = ref<CustomTextFieldInterface[]>([]);

  function onCustomFieldsPrepared (textFields: CustomTextFieldInterface[]) {
    // TODO: temporary - current TS version don't handle `value` type right in this case
    (customTextFields as any).value = textFields;
  }

  return {
    customTextFields,
    onCustomFieldsPrepared
  };
}

function useBackgroundImage (
  isCustomizerPreviewBackSideFocused: Ref<boolean>,
  backgroundEditor: Ref<InstanceType<typeof MBackgroundEditor> | null>,
  customizations: Ref<Customization[]>,
  customizationOptionValue: Ref<Record<string, CustomizationOptionValue>>
) {
  const imageHandlerService = inject<ImageHandlerService>('ImageHandlerService');

  const backgroundOffsetSettings = ref<BackgroundOffsetSettings | undefined>();
  const croppedBackground = ref<string>('');

  const relatedCustomization = computed<Customization | undefined>(() => {
    return customizations.value.find(
      (customization) =>
        customization.optionData?.displayWidget === WidgetType.IMAGE_UPLOAD
    );
  });
  const uploadedImage = computed<FileUploadValue | undefined>(() => {
    if (!relatedCustomization.value) {
      return;
    }

    const fileUploadValue = customizationOptionValue.value[relatedCustomization.value.id];

    if (!fileUploadValue || !isFileUploadValue(fileUploadValue)) {
      return;
    }
    return Array.isArray(fileUploadValue) ? fileUploadValue[0] : fileUploadValue;
  });
  const isBackgroundImageLoaded = computed<boolean>(() => {
    return !!uploadedImage.value;
  });

  const smallBackgroundImageStyle = computed<SmallBackgroundImageStyle>(() => {
    const defaultStyle: SmallBackgroundImageStyle = {
      width: 'calc(100% - 2px)',
      height: 'calc(100% - 2px)',
      top: '1px',
      left: '1px'
    };

    const settings = backgroundOffsetSettings.value;

    if (!settings || !settings.size || !settings.position) {
      return defaultStyle;
    }

    const style = { ...defaultStyle };

    if (settings.position === 'left' || settings.position === 'right') {
      style.width = `calc(${100 - parseFloat(settings.size)}% - 2px)`;
    } else {
      style.height = `calc(${100 - parseFloat(settings.size)}% - 2px)`;
    }

    if (settings.position === 'left') {
      style.left = `calc(${parseFloat(settings.size)}% + 1px)`;
    }

    return style;
  });

  function onBackgroundImageUploaded (fileValue: FileUploadValue): void {
    // TODO: temporary - current TS version don't handle `value` type right in this case
    if (!(backgroundEditor as any).value) {
      throw new Error('Unable to get Background editor element!');
    }

    if (!imageHandlerService) {
      throw new Error('ImageHandlerService is not defined');
    }

    backgroundEditor.value.setBackgroundImage(imageHandlerService.getOriginalImageUrl(fileValue.url));
  }

  function onBackgroundOffsetSettingsPrepared (
    settings: BackgroundOffsetSettings
  ): void {
    backgroundOffsetSettings.value = settings;
  }

  async function updateSmallBackgroundImage (): Promise<void> {
    // TODO: temporary - current TS version don't handle `value` type right in this case
    if (!(backgroundEditor as any).value) {
      throw new Error('Unable to get background editor!');
    }

    if (!isCustomizerPreviewBackSideFocused.value) {
      croppedBackground.value = '';
      return;
    }

    await nextTick();

    // TODO: temporary - current TS version don't handle `value` type right in this case
    const image = await (backgroundEditor as any).value.getCroppedBackground();

    if (image) {
      croppedBackground.value = image;
    }
  }

  watch(isCustomizerPreviewBackSideFocused, () => {
    updateSmallBackgroundImage();
  });

  watch(uploadedImage, () => {
    if (!uploadedImage.value) {
      return;
    }

    onBackgroundImageUploaded(uploadedImage.value);
  });

  return {
    backgroundOffsetSettings,
    croppedBackground,
    isBackgroundImageLoaded,
    onBackgroundOffsetSettingsPrepared,
    smallBackgroundImageStyle,
    updateSmallBackgroundImage
  };
}

export default defineComponent({
  props: {
    customizationOptionValue: {
      type: Object as PropType<Record<string, CustomizationOptionValue>>,
      required: true
    },
    customizationOptionValues: {
      type: Array as PropType<OptionValue[]>,
      required: true
    },
    customizations: {
      type: Array as PropType<Customization[]>,
      required: true
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    svgPath: {
      type: String,
      required: true
    }
  },
  components: {
    MBackgroundEditor,
    MCustomizerPreview,
    MDesignImages,
    MLivePreview,
    SfHeading
  },
  setup (props) {
    const {
      customizationOptionValue,
      customizationOptionValues,
      customizations
    } = toRefs(props);

    const backgroundEditor = ref<InstanceType<typeof MBackgroundEditor> | null>(
      null
    );

    const isCustomizerPreviewBackSideFocused = ref<boolean>(false);

    const optionDataSkuCustomization = computed<Record<string, Customization>>(
      () => {
        const dictionary: Record<string, Customization> = {};

        for (const customization of customizations.value) {
          if (!customization.optionData?.sku) {
            continue;
          }

          dictionary[customization.optionData.sku] = customization;
        }

        return dictionary;
      }
    );

    const { optionValue: frontDesignOptionValue, optionValueSku: frontDesign } = useCustomizationOptionValue(
      optionDataSkuCustomization,
      customizationOptionValue,
      customizationOptionValues,
      FRONT_DESIGN_SKU
    );
    const currentDesignImages = computed<string[]>(() => {
      if (!frontDesignOptionValue.value?.galleryImages) {
        return [];
      }

      return frontDesignOptionValue.value.galleryImages.map((image) => image.imageUrl);
    });

    const { optionValueSku: backDesign } = useCustomizationOptionValue(
      optionDataSkuCustomization,
      customizationOptionValue,
      customizationOptionValues,
      BACK_DESIGN_SKU
    );

    const { optionValue: accentColorOptionValue } = useCustomizationOptionValue(
      optionDataSkuCustomization,
      customizationOptionValue,
      customizationOptionValues,
      ACCENT_COLOR_SKU
    );
    const accentColor = computed<string | undefined>(() => {
      return accentColorOptionValue.value?.color;
    });

    const {
      customTextFields: frontCustomTextFields,
      onCustomFieldsPrepared: onFrontCustomTextFieldsPrepared
    } = useCustomTextFields();
    const {
      customTextFields: backCustomTextFields,
      onCustomFieldsPrepared: onBackCustomTextFieldsPrepared
    } = useCustomTextFields();
    const customTextValues = computed<Record<string, string | undefined>>(
      () => {
        const values: Record<string, string | undefined> = {};
        const customTextFields = [
          // TODO: temporary - current TS version don't handle `value` type right in this case
          ...(frontCustomTextFields as any).value,
          ...(backCustomTextFields as any).value
        ];

        for (const field of customTextFields) {
          const customization = optionDataSkuCustomization.value[field.name];

          if (!customization) {
            continue;
          }

          const value = customizationOptionValue.value[customization.id];

          if (typeof value !== 'string') {
            continue;
          }

          values[field.name] = value;
        }

        return values;
      }
    );

    return {
      ...useBackgroundImage(
        isCustomizerPreviewBackSideFocused,
        backgroundEditor,
        customizations,
        customizationOptionValue
      ),
      accentColor,
      backDesign,
      backgroundEditor,
      currentDesignImages,
      customTextValues,
      frontDesign,
      isCustomizerPreviewBackSideFocused,
      onBackCustomTextFieldsPrepared,
      onFrontCustomTextFieldsPrepared
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.phrase-pillow-form-preview {
  $medium-breakpoint: 641px;

  ._front_design_preview_container {
    padding: 0.8em;
    height: 100%;
    text-align: center;

    ._section-header {
      h5 {
        margin: 0.3em 0;
      }
    }

    &.-invalid {
      h3 {
        color: var(--c-danger-variant);
      }
    }
  }

  ._preview-image-small {
    display: flex;
    position: relative;
    background-color: var(--c-white);
    width: 100%;

    ::v-deep svg {
      width: 100%;
      height: auto;
    }

    ._background {
      position: absolute;
      width: calc(100% - 2px);
      top: 1px;
      left: 1px;
    }
  }

  ._design-images-container {
    padding: 0 0.8em;
    margin-top: 5%;
  }

  ._front-preview,
  ._back-preview,
  ._design-images,
  .m-live-preview {
    width: 100%;
  }

  ._design-images {
    margin-top: var(--spacer-base);
  }

  @media (max-width: $medium-breakpoint - 1px) {
    .-show-for-medium-up {
      display: none !important;
    }
  }

  @media (min-width: $medium-breakpoint) {
    flex: 1;
    height: auto;
    text-align: left;

    .sf-heading {
      --heading-text-align: left;
    }

    ._front_design_preview_container {
      position: sticky;
      top: 3.4em;
      height: auto;
      padding-bottom: 0;
      text-align: left;

      .sf-heading {
        --heading-text-align: left;
      }
    }
  }

  @include for-desktop {
    ._front_design_preview_container {
      top: 4.4em;
    }

    ._front-preview {
      ._front-hint {
        ._helper-text {
          font-size: 0.85em;
          margin: 1.5em 0;
        }
      }

      ._hint-image {
        width: 3.5em;
        height: 3.5em;
      }
    }
  }
}
</style>
