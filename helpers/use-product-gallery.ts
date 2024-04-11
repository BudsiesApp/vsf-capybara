import { ComputedRef, Ref, computed } from '@vue/composition-api';

import { getProductGallery } from '@vue-storefront/core/modules/catalog/helpers';
import { BundleOption, BundleOptionsProductLink } from 'core/modules/catalog/types/BundleOption';
import Product from 'core/modules/catalog/types/Product';

import GalleryProductImages from 'theme/components/interfaces/gallery-product-images.interface';
import ZoomGalleryImage from 'theme/interfaces/zoom-gallery-image.interface';

function getZoomGalleryImage (imageObject: any): ZoomGalleryImage {
  return {
    stage: imageObject.src,
    thumb: imageObject.src,
    big: imageObject.src
  }
}

export function useProductGallery (
  product: Product,
  styleBundleOption: ComputedRef<BundleOption | undefined> | undefined,
  selectedStyleProductLink: ComputedRef<BundleOptionsProductLink | undefined> | undefined
) {
  const productImages = computed<GalleryProductImages[]>(() => {
    const mainProductImages = getProductGallery(product)
      .map(getZoomGalleryImage)

    let result: GalleryProductImages[] = [
      {
        sku: product.sku,
        images: mainProductImages
      }
    ]

    if (!styleBundleOption || !styleBundleOption.value) {
      return result;
    }

    for (const productLink of styleBundleOption.value.product_links) {
      if (!productLink.product) {
        continue;
      }

      const styleProductImages = getProductGallery(productLink.product)
        .map(getZoomGalleryImage)

      result.push({
        sku: productLink.product.sku,
        images: styleProductImages
      })
    }

    return result;
  });

  const galleryImages = computed<ZoomGalleryImage[]>(() => {
    const defaultGalleryProductImages = productImages.value[0];
    const defaultImages = defaultGalleryProductImages
      ? defaultGalleryProductImages.images
      : [];

    if (!selectedStyleProductLink) {
      return defaultImages;
    }

    const selectedStyleGalleryProductImages = productImages.value.find(
      (item) => selectedStyleProductLink.value && (item.sku === selectedStyleProductLink.value.sku)
    );

    if (!selectedStyleGalleryProductImages || !selectedStyleGalleryProductImages.images.length) {
      return defaultImages;
    }

    return selectedStyleGalleryProductImages.images;
  });

  return {
    galleryImages
  }
}
