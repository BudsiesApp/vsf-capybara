import { ComputedRef, Ref, computed } from '@vue/composition-api';

import { getProductGallery } from '@vue-storefront/core/modules/catalog/helpers';
import Product from 'core/modules/catalog/types/Product';
import { Customization } from 'src/modules/customization-system';

import ZoomGalleryImage from 'theme/interfaces/zoom-gallery-image.interface';

function getZoomGalleryImage (imageObject: any): ZoomGalleryImage {
  return {
    stage: imageObject.imageUrl || imageObject.src,
    thumb: imageObject.imageUrl || imageObject.src,
    big: imageObject.imageUrl || imageObject.src
  }
}

export function useProductGallery (
  product: Ref<Product>,
  customizations: Ref<Customization[]>,
  selectedOptionValuesIds: ComputedRef<string[]>
) {
  const mainProductImages = computed<ZoomGalleryImage[]>(() => {
    return getProductGallery(product.value)
      .map(getZoomGalleryImage)
  });
  const optionValueImages = computed<Record<string, ZoomGalleryImage[]>>(() => {
    const result: Record<string, ZoomGalleryImage[]> = {};

    for (const customization of customizations.value) {
      if (!customization.optionData?.values || !customization.optionData?.hasGalleryImages) {
        continue;
      }

      for (const value of customization.optionData.values) {
        if (!value.galleryImages?.length) {
          continue;
        }

        result[value.id] = value.galleryImages
          .sort((a, b) => a.sn > b.sn ? 1 : -1)
          .map(getZoomGalleryImage);
      }
    }

    return result;
  });

  const galleryImages = computed<ZoomGalleryImage[]>(() => {
    if (!selectedOptionValuesIds.value.length) {
      return mainProductImages.value;
    }

    const selectedOptionValuesImages: ZoomGalleryImage[] = [];

    if (!selectedOptionValuesIds.value.length) {
      return mainProductImages.value;
    }

    for (const selectedOptionValueId of selectedOptionValuesIds.value) {
      const selectedOptionValueProductImages = optionValueImages.value[selectedOptionValueId];

      if (!selectedOptionValueProductImages) {
        continue;
      }

      selectedOptionValuesImages.push(...selectedOptionValueProductImages);
    }

    if (!selectedOptionValuesImages.length) {
      return mainProductImages.value;
    }

    return selectedOptionValuesImages;
  });

  return {
    galleryImages
  }
}
