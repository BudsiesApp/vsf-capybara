import { computed, Ref, ref, watch } from '@vue/composition-api';

import { Logger } from '@vue-storefront/core/lib/logger';
import Product from 'core/modules/catalog/types/Product';
import { BodyPartValueContentType } from 'src/modules/budsies';
import { getProductDefaultPrice } from 'src/modules/shared';

import SizeOption from 'theme/components/interfaces/size-option';

import { useBundleOption } from './use-bundle-options';
import { getFinalPrice } from 'src/modules/shared/helpers/price';

export function useSizeSelector (
  product: Ref<Product>,
  bundleOptionTitle: Ref<string> | string
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
        finalPrice: getFinalPrice(price),
        specialPrice: price.special,
        regularPrice: price.regular,
        value: productLink.product.sku,
        isSelected: false,
        contentTypeId: BodyPartValueContentType.IMAGE,
        image: productLink.product.image,
        optionId: bundleOption.value.option_id,
        optionValueId: productLink.id.toString(),
        group: 'default',
        disabledUpgrades: productLink.product.disabled_upgrades || []
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
