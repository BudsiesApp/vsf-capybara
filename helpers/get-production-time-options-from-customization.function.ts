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

  let addonOptions: Record<string, number> = {};

  for (const optionValue of customizationOptionValues) {
    if (!optionValue.sku) {
      continue;
    }

    addonOptions[optionValue.sku] = optionValue.bundleOptionItemId
  }

  for (const addon of addons) {
    const addonOption = addonOptions[addon.id];

    if (!addonOption && addon.id) {
      Logger.warn('The option product of rush addon is not found: ' + addon.id, 'budsies')();
      continue;
    }

    result.push({
      id: addon.id,
      text: addon.text,
      isDomestic: addon.isDomestic,
      optionId: bundleOptionId,
      optionValueId: addonOption || 0
    });
  }

  return result;
}
