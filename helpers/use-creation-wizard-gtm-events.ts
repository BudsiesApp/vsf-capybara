import { computed, Ref } from '@vue/composition-api';

import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'
import { Customization, CustomizationOptionValue, FileUploadValue, isFileUploadValue, WidgetType } from 'src/modules/customization-system';
import { ImageUploadMethod, PlushieWizardEvents } from 'src/modules/budsies';

const PHOTO_STEP_CUSTOMIZATION_NAME = 'photo';
const INFO_STEP_CUSTOMIZATION_NAME = 'pet info';

export function useCreationWizardGtmEvents (
  customizations: Ref<Customization[]>,
  customizationOptionValue: Ref<Record<string, CustomizationOptionValue>>,
  plushieType: Ref<string>
) {
  const photoStepCustomization = computed<Customization | undefined>(() => {
    return customizations.value.find(
      (customization) => customization.name.toLowerCase() === PHOTO_STEP_CUSTOMIZATION_NAME
    )
  });

  const infoStepCustomization = computed<Customization | undefined>(() => {
    return customizations.value.find(
      (customization) => customization.name.toLowerCase() === INFO_STEP_CUSTOMIZATION_NAME
    )
  });

  const photoUploadOptionValue = computed<FileUploadValue | FileUploadValue[] | undefined>(() => {
    const photoUploadCustomization = customizations.value.find(
      (customization) => customization.optionData?.displayWidget === WidgetType.IMAGE_UPLOAD
    );

    if (!photoUploadCustomization) {
      return;
    }

    const selectedValue = customizationOptionValue.value[photoUploadCustomization.id];

    if (!isFileUploadValue(selectedValue)) {
      return;
    }

    return selectedValue;
  });

  function onStepSubmit (previousStepCustomization?: Customization): void {
    if (!previousStepCustomization) {
      return;
    }

    const isPreviousStepPhoto = previousStepCustomization.id === photoStepCustomization.value?.id;
    const isPreviousStepInfo = previousStepCustomization.id === infoStepCustomization.value?.id;

    if (!isPreviousStepInfo && !isPreviousStepPhoto) {
      return;
    }

    if (isPreviousStepPhoto) {
      EventBus.$emit(PlushieWizardEvents.PLUSHIE_WIZARD_PHOTOS_PROVIDE, {
        plushieType: plushieType.value,
        uploadMethod: photoUploadOptionValue.value
          ? ImageUploadMethod.NOW
          : ImageUploadMethod.EMAIL
      });

      return;
    }

    EventBus.$emit(PlushieWizardEvents.PLUSHIE_WIZARD_INFO_FILL, plushieType.value);
  }

  return {
    onStepSubmit
  }
}
