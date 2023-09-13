import { computed, ref, watch } from '@vue/composition-api';

import { Logger } from '@vue-storefront/core/lib/logger';
import Product from 'core/modules/catalog/types/Product';
import { BodyPartValueContentType } from 'src/modules/budsies';
import { getProductDefaultPrice } from 'src/modules/shared';

import SizeOption from 'theme/components/interfaces/size-option';

import { useBundleOption } from './use-bundle-options';

export function useSizeSelector (
  product: Product,
  bundleOptionTitle: string
) {
  const {
    bundleOption,
    setBundleOptionValue
  } = useBundleOption(product, bundleOptionTitle);

  const sizesOptions = computed<SizeOption[]>(() => {
    if (!bundleOption.value) {
      return [];
    }

    let availableSizes: SizeOption[] = [];
    for (const productLink of bundleOption.value.product_links) {
      if (!productLink.product) {
        continue;
      }

      const price = getProductDefaultPrice(productLink.product, {}, false);

      availableSizes.push({
        id: String(productLink.product.id),
        label: productLink.product.name,
        finalPrice: price.special ? price.special : price.regular,
        specialPrice: price.special,
        regularPrice: price.regular,
        value: productLink.product.sku,
        isSelected: false,
        contentTypeId: BodyPartValueContentType.IMAGE,
        image: productLink.product.image,
        optionId: bundleOption.value.option_id,
        optionValueId: productLink.id.toString(),
        group: 'default'
      });
    }

    return availableSizes;
  });

  let selectedSize = ref<SizeOption | undefined>();

  watch(selectedSize, (value) => {
    if (!bundleOption.value) {
      Logger.error('sizeBundleOption is not defined while attempt to set size was performed', 'budsies')();
      return;
    }

    setBundleOptionValue(
      bundleOption.value.option_id,
      1,
      value && value.optionValueId ? [Number(value.optionValueId)] : []
    );
  });

  return {
    bundleOption,
    selectedSize,
    sizesOptions
  }
}
