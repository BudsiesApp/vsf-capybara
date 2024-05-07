import { computed, Ref, ref, watch } from '@vue/composition-api';
import SelectedAddon from 'theme/components/interfaces/selected-addon.interface';
import { useBundleOption } from './use-bundle-options';
import Product from 'core/modules/catalog/types/Product';
import CartItem from 'core/modules/cart/types/CartItem';
import AddonOption from 'theme/components/interfaces/addon-option.interface';
import { getAddonOptionsFromBundleOption } from './get-addon-options-from-bundle-option.function';

export function useAddonsSelector (
  product: Ref<Product>,
  addonsBundleOptionTitle: Ref<string> | string,
  existingCartItem: Ref<CartItem | undefined>
) {
  const { bundleOption, setBundleOptionValue } = useBundleOption(
    product,
    addonsBundleOptionTitle
  );

  const selectedAddons = ref<SelectedAddon[]>([]);
  const addonOptions = computed<AddonOption[]>(() => {
    if (!bundleOption.value) {
      return [];
    }

    return getAddonOptionsFromBundleOption(bundleOption.value);
  });

  function fillExistingCartItemData (): void {
    const productOption = existingCartItem.value?.product_option;
    (selectedAddons as any).value = [];

    if (!bundleOption.value || !productOption) {
      return;
    }

    const selectedBundleOption = productOption.extension_attributes.bundle_options[bundleOption.value.option_id];

    if (!selectedBundleOption) {
      return;
    }

    const optionSelections = selectedBundleOption.option_selections;

    (selectedAddons as any).value = optionSelections.map((selection: number) => {
      const addon = addonOptions.value.find((addon) => addon.optionValueId === selection);
      let optionsValues = {};

      if (addon) {
        const upgradeOptionValues = existingCartItem.value?.upgradeOptionValues?.find(
          ({ upgradeSku }) => upgradeSku === addon.sku
        );

        optionsValues = upgradeOptionValues?.optionsValues || {};
      }

      return {
        addonOptionValueId: selection,
        optionsValues
      }
    });
  }

  function getAddonOptionValues () {
    return (selectedAddons as any).value.map((selectedAddon: SelectedAddon) => {
      const addonItem = addonOptions.value.find(
        ({
          optionValueId
        }) => optionValueId === selectedAddon.addonOptionValueId
      );

      if (!addonItem) {
        throw new Error('Unable to find addon by optionValueId');
      }

      return {
        upgradeSku: addonItem.sku,
        optionsValues: selectedAddon.optionsValues
      }
    });
  }

  fillExistingCartItemData();

  watch(selectedAddons, (value) => {
    if (!bundleOption.value) {
      return;
    }

    setBundleOptionValue(
      bundleOption.value.option_id,
      1,
      value.map(({ addonOptionValueId }) => addonOptionValueId)
    );
  });

  return {
    selectedAddons,
    addonOptions,
    getAddonOptionValues
  }
}
