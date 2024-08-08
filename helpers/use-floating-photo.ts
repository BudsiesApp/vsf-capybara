import { computed, inject, Ref } from '@vue/composition-api';

import { Customization, CustomizationStateItem, isFileUploadValue } from 'src/modules/customization-system';
import { ImageHandlerService } from 'src/modules/file-storage';

const nameCustomizationSku = 'name';

export function useFloatingPhoto (
  customizationState: Ref<CustomizationStateItem[]>,
  customizations: Ref<Customization[]>
) {
  const imageHandlerService = inject<ImageHandlerService>('ImageHandlerService');

  if (!imageHandlerService) {
    throw new Error('ImageHandlerService is not defined');
  }

  const floatingPhotoUrl = computed<string | undefined>(() => {
    let fileItem: CustomizationStateItem | undefined = customizationState.value.find((item) => isFileUploadValue(item.value));

    if (!fileItem) {
      return;
    }

    let fileItemUrl = Array.isArray(fileItem.value) ? fileItem.value[0] : fileItem.value;

    if (!fileItemUrl || !isFileUploadValue(fileItemUrl)) {
      return;
    }

    return imageHandlerService.getOriginalImageUrl(fileItemUrl.url);
  });

  const floatingPhotoText = computed<string>(() => {
    const relatedCustomization = customizations.value.find((customization) => {
      return customization.optionData?.sku === nameCustomizationSku;
    });

    if (!relatedCustomization) {
      return '';
    }

    const value = customizationState.value.find((item) => item.customization_id === relatedCustomization.id)?.value;

    if (!value || isFileUploadValue(value) || Array.isArray(value)) {
      return '';
    }

    return value;
  });

  return {
    floatingPhotoUrl,
    floatingPhotoText
  }
}
