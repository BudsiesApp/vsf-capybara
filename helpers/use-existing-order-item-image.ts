import { Ref, inject } from '@vue/composition-api';

import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';

import { Customization, CustomizationOptionValue } from 'src/modules/customization-system';
import ImageHandlerService from 'src/modules/file-storage/image-handler.service';

import CustomizationOption from '../components/customization-system/customization-option.vue';

const IMAGE_UPLOAD_CUSTOMIZATION_NAME = 'Customer Image';

export function useExistingOrderItemImage (
  imageUrl: Ref<string | undefined>,
  existingCartItem: Ref<CartItem | undefined>,
  customizations: Ref<Customization[]>,
  customizationOptionValue: Ref<Record<string, CustomizationOptionValue>>,
  customizationOptionComponents: Ref<InstanceType<typeof CustomizationOption>[] | null>
) {
  const imageHandlerService = inject<ImageHandlerService>('ImageHandlerService');

  async function uploadExistingImage (): Promise<void> {
    if (!imageHandlerService) {
      throw new Error('Image Handler Service is not defined');
    }

    if (!imageUrl.value || existingCartItem.value || !customizationOptionComponents.value) {
      return;
    }

    const customerImageCustomization = customizations.value.find(
      (customization: Customization) => customization.name === IMAGE_UPLOAD_CUSTOMIZATION_NAME
    );

    if (!customerImageCustomization) {
      return;
    }

    const customerImageCustomizationId = customerImageCustomization.id;
    const existingValue = customizationOptionValue.value[customerImageCustomizationId];

    if (existingValue) {
      return;
    }

    const customerImageOptionComponent: InstanceType<typeof CustomizationOption> | undefined = customizationOptionComponents.value.find(
      (comp: InstanceType<typeof CustomizationOption>) => comp.customization.id === customerImageCustomizationId
    );

    if (!customerImageOptionComponent) {
      return;
    }

    const widgetComponent = customerImageOptionComponent.widgetComponent;

    if (!widgetComponent) {
      return;
    }

    if ('uploadRemoteImage' in widgetComponent) {
      const absoluteImageUrl = imageHandlerService.getOriginalImageUrl(imageUrl.value);
      await widgetComponent.uploadRemoteImage(absoluteImageUrl);
    }
  }

  return {
    uploadExistingImage
  };
}
