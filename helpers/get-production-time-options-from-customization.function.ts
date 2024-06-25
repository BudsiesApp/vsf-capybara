import { Store } from 'vuex';
import { Logger } from '@vue-storefront/core/lib/logger';

import { RushAddon } from 'src/modules/budsies';
import { OptionValue } from 'src/modules/customization-system';

import ProductionTimeOption from '../components/interfaces/production-time-option.interface';

export function getProductionTimeOptionsFromCustomization (
  productId: number,
  bundleOptionId: number,
  customizationOptionValues: OptionValue[],
  store: Store<any>
): ProductionTimeOption[] {
  const addons: RushAddon[] = store.getters['budsies/getProductRushAddons'](productId);

  if (!addons.length) {
    return [];
  }

  const result: ProductionTimeOption[] = [];

  let addonOptions: Record<string, OptionValue> = {};

  for (const optionValue of customizationOptionValues) {
    if (!optionValue.sku || !optionValue.bundleOptionItemId) {
      continue;
    }

    addonOptions[optionValue.sku] = optionValue;
  }

  for (const addon of addons) {
    const addonOption = addonOptions[addon.id];

    if (!addonOption && addon.id) {
      Logger.warn('The option product of rush addon is not found: ' + addon.id, 'budsies')();
      continue;
    }

    result.push({
      // TODO: get rid of hardcoded id
      id: addonOption?.id || 'standard',
      text: addon.text,
      isDomestic: addon.isDomestic,
      optionId: bundleOptionId,
      optionValueId: addonOption?.bundleOptionItemId || 0,
      sku: addonOption?.sku
    });
  }

  return result.sort((a, b) => {
    const optionValueA = a.sku ? addonOptions[a.sku] : undefined;
    const optionValueB = b.sku ? addonOptions[b.sku] : undefined;

    if (!optionValueA) {
      return -1;
    }

    if (!optionValueB) {
      return 1;
    }

    return optionValueA.sn > optionValueB.sn ? 1 : -1;
  });
}
