import { ComputedRef, Ref, computed } from '@vue/composition-api';

import config from 'config';
import { getThumbnailPath } from '@vue-storefront/core/helpers';
import { getProductGallery } from '@vue-storefront/core/modules/catalog/helpers';
import Product from 'core/modules/catalog/types/Product';
import { Customization } from 'src/modules/customization-system';

import ZoomGalleryAsset from 'theme/interfaces/zoom-gallery-asset.interface';
import { AspectRatio, VideoProvider } from 'src/modules/shared';

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
          .sort((a: any, b: any) => a.sn - b.sn)
          .map((image: any) => {
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
  function appendVideos (assets: ZoomGalleryAsset[]): ZoomGalleryAsset[] {
    if (!assets.length) {
      return assets;
    }

    const base = assets[0];
    const poster = {
      stage: base.stage,
      thumb: base.thumb,
      big: base.big,
      alt: base.alt,
      title: base.title
    };

    const videoDefs: { aspectRatio: AspectRatio }[] = [
      { aspectRatio: AspectRatio.A16_9 },
      { aspectRatio: AspectRatio.A4_3 },
      { aspectRatio: AspectRatio.A16_10 },
      { aspectRatio: AspectRatio.A9_16 }
    ];

    const videos: ZoomGalleryAsset[] = videoDefs.map((v) => ({
      ...poster,
      video: {
        videoId: Math.random() > 0.5 ? 'F-dt-tCjtmI' : 'dCAP4DnO2DY',
        provider: VideoProvider.youtube,
        aspectRatio: v.aspectRatio,
        displayControls: false,
        autoplay: false
      }
    }));

    return [...videos, ...assets];
  }

  const galleryImages = computed<ZoomGalleryAsset[]>(() => {
    if (!selectedOptionValuesIds.value.length) {
      const base = mainProductImages.value;
      return appendVideos(base);
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
      return appendVideos(mainProductImages.value);
    }

    return appendVideos(selectedOptionValuesImages);
  });

  return {
    galleryImages
  }
}
