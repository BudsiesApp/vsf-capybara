import { ComputedRef, Ref, computed } from 'vue';

import config from 'config';
import { getThumbnailPath } from '@vue-storefront/core/helpers';
import { getProductGallery } from '@vue-storefront/core/modules/catalog/helpers';
import Product from 'core/modules/catalog/types/Product';
import { Customization } from 'src/modules/customization-system';

import ZoomGalleryAsset from 'theme/interfaces/zoom-gallery-asset.interface';

export function useProductGallery (
  product: Ref<Product>,
  customizations: Ref<Customization[]>,
  selectedOptionValuesIds: ComputedRef<string[]>
) {
  const mainProductImages = computed<ZoomGalleryAsset[]>(() => {
    return getProductGallery(product.value)
      .map((image: any) => {
        return {
          stage: image.src,
          thumb: image.src,
          big: image.src,
          alt: image.alt || product.value.name
        };
      });
  });
  const optionValueImages = computed<Record<string, ZoomGalleryAsset[]>>(() => {
    const result: Record<string, ZoomGalleryAsset[]> = {};

    for (const customization of customizations.value) {
      if (!customization.optionData?.values || !customization.optionData?.hasGalleryImages) {
        continue;
      }

      for (const value of customization.optionData.values) {
        if (!value.galleryImages?.length) {
          continue;
        }

        result[value.id] = value.galleryImages
          .sort((a, b) => a.sn - b.sn)
          .map((image) => {
            return {
              stage: getThumbnailPath(image.imageUrl, config.products.gallery.width, config.products.gallery.height, ''),
              thumb: getThumbnailPath(image.imageUrl, config.products.gallery.width, config.products.gallery.height, ''),
              big: getThumbnailPath(image.imageUrl, config.products.gallery.width, config.products.gallery.height, ''),
              alt: image.alt || value.name
            }
          });
      }
    }

    return result;
  });

  const galleryImages = computed<ZoomGalleryAsset[]>(() => {
    if (!selectedOptionValuesIds.value.length) {
      return mainProductImages.value;
    }

    const selectedOptionValuesImages: ZoomGalleryAsset[] = [];

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
