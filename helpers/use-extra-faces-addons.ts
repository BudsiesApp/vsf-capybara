import { Store } from 'vuex';
import { computed, ref, watch } from '@vue/composition-api';

import { Logger } from '@vue-storefront/core/lib/logger';
import { getSelectedBundleOptions } from '@vue-storefront/core/modules/catalog/helpers/bundleOptions';
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';
import Product from '@vue-storefront/core/modules/catalog/types/Product';
import RootState from '@vue-storefront/core/types/RootState';

import { ExtraPhotoAddon } from 'src/modules/budsies';
import { CustomerImage } from 'src/modules/shared';

import ExtraPhotoAddonOption from 'theme/components/interfaces/extra-photo-addon-option.interface';
import ExtraFacesConfiguratorData from 'theme/components/interfaces/extra-faces-configurator-data.interface';

import { useBundleOption } from './use-bundle-options';

export function useExtraFacesAddons (product: Product, store: Store<RootState>, existingCartItem: CartItem | undefined) {
  const {
    bundleOption: extraFacesBundleOption,
    setBundleOptionValue
  } = useBundleOption(product, 'extra faces');
  const selectedExtraFacesAddon = ref<ExtraPhotoAddonOption | undefined>();
  const initialAddonItemId = ref<string | undefined>();

  const extraPhotosArtworks = ref<CustomerImage[]>([]);
  const initialExtraPhotosArtworks = ref<CustomerImage[]>([]);

  const extraPhotoAddonOptions = computed<ExtraPhotoAddonOption[]>(() => {
    if (!extraFacesBundleOption.value) {
      return [];
    }

    const extraPhotoAddons: ExtraPhotoAddon[] = store.getters['budsies/getPrintedProductAddons'](product.id);

    if (!extraPhotoAddons.length) {
      return [];
    }

    let addonOptions: Record<string, number> = {};

    for (const productLink of extraFacesBundleOption.value.product_links) {
      if (!productLink.product) {
        continue;
      }

      addonOptions[productLink.product.sku] = +productLink.id;
    }

    const result: ExtraPhotoAddonOption[] = [];

    for (const addon of extraPhotoAddons) {
      const addonOption = addonOptions[addon.id];

      if (!addonOption && addon.id) {
        Logger.warn('The option product of extra photo addon is not found: ' + addon.id, 'budsies')();
        continue;
      }

      result.push({
        id: addon.id,
        label: addon.label,
        value: addon.value,
        optionId: extraFacesBundleOption.value.option_id,
        optionValueId: addonOption
      })
    }

    return result;
  });

  const hasExtraPhotoAddonOptions = computed<boolean>(() => {
    return extraPhotoAddonOptions.value.length > 0;
  });

  function onExtraFacesConfiguratorDataInput (data: ExtraFacesConfiguratorData): void {
    selectedExtraFacesAddon.value = data.addon;
    (extraPhotosArtworks as any).value = data.storageItems;
  }

  function fillExtraFacesArtworks (): void {
    (extraPhotosArtworks as any).value = [];
    (initialExtraPhotosArtworks as any).value = [];

    if (!existingCartItem?.customerImages || existingCartItem.customerImages.length <= 1) {
      return;
    }

    const customerImages = [...existingCartItem.customerImages]
    customerImages.splice(0, 1);

    (extraPhotosArtworks as any).value = customerImages;
    (initialExtraPhotosArtworks as any).value = [...customerImages];
  }

  function fillExtraFacesAddon (): void {
    selectedExtraFacesAddon.value = undefined;
    initialAddonItemId.value = undefined;

    if (!existingCartItem || !extraFacesBundleOption.value) {
      return;
    }

    const selectedBundleOptions = getSelectedBundleOptions(existingCartItem);

    if (!selectedBundleOptions.length || !extraPhotoAddonOptions.value.length) {
      return;
    }

    const selectedAddon: ExtraPhotoAddonOption | undefined = extraPhotoAddonOptions.value.find(
      (option) => selectedBundleOptions.find(
        (selectedOption) => selectedOption.option_id === option.optionId &&
       selectedOption.option_selections.includes(option.optionValueId)
      )
    )

    if (!selectedAddon) {
      return;
    }

    selectedExtraFacesAddon.value = selectedAddon;
    initialAddonItemId.value = selectedAddon.id;
  }

  function fillExistingCartItemData (): void {
    fillExtraFacesArtworks();
    fillExtraFacesAddon();
  }

  fillExistingCartItemData();

  watch(selectedExtraFacesAddon, (newValue) => {
    if (!extraFacesBundleOption.value) {
      return;
    }

    setBundleOptionValue(
      extraFacesBundleOption.value.option_id,
      1,
      newValue
        ? [newValue.optionValueId]
        : []
    );
  });

  return {
    extraPhotoAddonOptions,
    extraPhotosArtworks,
    hasExtraPhotoAddonOptions,
    initialAddonItemId,
    initialExtraPhotosArtworks,
    onExtraFacesConfiguratorDataInput
  }
}
