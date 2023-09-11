import { computed } from '@vue/composition-api';
import { BundleOption } from 'core/modules/catalog/types/BundleOption';
import Product from 'core/modules/catalog/types/Product';

export function useBundleOption (product: Product, title: string) {
  const bundleOption = computed<BundleOption | undefined>(() => {
    return product.bundle_options?.find((option) => option.title.toLowerCase() === title.toLowerCase());
  })

  return {
    bundleOption
  }
}
