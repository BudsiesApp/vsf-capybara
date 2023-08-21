import { ComputedRef, computed, ref, watch } from '@vue/composition-api';

import { Logger } from '@vue-storefront/core/lib/logger';
import rootStore from '@vue-storefront/core/store'
import { PRODUCT_SET_BUNDLE_OPTION } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import { BundleOption } from 'core/modules/catalog/types/BundleOption';
import { BodyPartValueContentType } from 'src/modules/budsies';
import { getProductDefaultPrice } from 'src/modules/shared';

import SizeOption from 'theme/components/interfaces/size-option';

export function useSizeSelector (sizeBundleOption: ComputedRef<BundleOption | undefined>) {
  const sizesOptions = computed<SizeOption[]>(() => {
    if (!sizeBundleOption.value) {
      return [];
    }

    let availableSizes: SizeOption[] = [];
    for (const productLink of sizeBundleOption.value.product_links) {
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
        optionId: sizeBundleOption.value.option_id,
        optionValueId: productLink.id.toString(),
        group: 'default'
      });
    }

    return availableSizes;
  });

  let selectedSize = ref<SizeOption | undefined>();

  watch(selectedSize, (value) => {
    if (!sizeBundleOption.value) {
      Logger.error('sizeBundleOption is not defined while attempt to set size was performed', 'budsies')();
      return;
    }

    rootStore.commit(`product/${PRODUCT_SET_BUNDLE_OPTION}`, {
      optionId: sizeBundleOption.value.option_id,
      optionQty: 1,
      optionSelections: value ? [value.optionValueId] : []
    });
  });

  return {
    selectedSize,
    sizesOptions
  }
}
