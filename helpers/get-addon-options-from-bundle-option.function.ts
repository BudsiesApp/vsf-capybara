import { getProductGallery as getGalleryByProduct } from '@vue-storefront/core/modules/catalog/helpers';
import { BundleOption } from '@vue-storefront/core/modules/catalog/types/BundleOption';

import { getProductDefaultPrice } from 'src/modules/shared';

import AddonOption from 'theme/components/interfaces/addon-option.interface';

export function getAddonOptionsFromBundleOption (bundleOption: BundleOption): AddonOption[] {
  let result: AddonOption[] = [];
  for (const productLink of bundleOption.product_links) {
    if (!productLink.product) {
      continue;
    }

    const images: string[] = getGalleryByProduct(productLink.product).map((i: any) => i.src);
    const price = getProductDefaultPrice(productLink.product, {}, false);
    result.push({
      id: Number(productLink.product.id),
      sku: productLink.product.sku,
      name: productLink.product.name,
      description: productLink.product.short_description || '',
      price: price.special ? price.special : price.regular,
      images: images,
      optionId: bundleOption.option_id,
      optionValueId: ((typeof productLink.id === 'number') ? productLink.id : Number.parseInt(productLink.id, 10) as number),
      videoUrl: (productLink.product as any).video_url,
      customOptions: productLink.product?.custom_options
    });
  }

  return result;
}
