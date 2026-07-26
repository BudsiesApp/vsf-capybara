import { Ref } from 'vue';

import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';

import { Customization, CustomizationOptionValue, WidgetType } from 'src/modules/customization-system';

export function useImageUpload (
  existingCartItem: Ref<CartItem | undefined>,
  availableCustomizations: Ref<Customization[]>,
  customizationOptionValue: Ref<Record<string, CustomizationOptionValue>>,
  customizationOptionComponents: Ref<any[] | null>
) {
  async function uploadImage (imageUrl: string): Promise<void> {
    if (!imageUrl || existingCartItem.value || !customizationOptionComponents.value) {
      return;
    }

    const customerImageCustomization = availableCustomizations.value.find(
      (customization: Customization) => customization.optionData?.displayWidget === WidgetType.IMAGE_UPLOAD
    );

    if (!customerImageCustomization) {
      return;
    }

    const customerImageCustomizationId = customerImageCustomization.id;
    const existingValue = customizationOptionValue.value[customerImageCustomizationId];

    if (existingValue) {
      return;
    }

    const customerImageOptionComponent = customizationOptionComponents.value.find(
      (comp: any) => comp.customization.id === customerImageCustomizationId
    );

    if (!customerImageOptionComponent) {
      return;
    }

    const widgetComponent = customerImageOptionComponent.widgetComponent;

    if (!widgetComponent) {
      return;
    }

    if ('uploadImage' in widgetComponent && !!widgetComponent.uploadImage) {
      await widgetComponent.uploadImage(imageUrl);
    }
  }

  return {
    uploadImage
  };
}
