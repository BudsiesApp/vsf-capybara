import { Logger } from '@vue-storefront/core/lib/logger';

import { Currency } from 'src/modules/currency';
import { OptionValue, PRODUCTION_TIME_SELECTOR_STANDARD_OPTION_VALUE_ID } from 'src/modules/customization-system';
import { RushAddon } from 'src/modules/budsies';

import ProductionTimeOption from '../components/interfaces/production-time-option.interface';
import { PriceHelper } from 'src/modules/shared';

export function getProductionTimeOptionsFromCustomization (
  bundleOptionId: number,
  customizationOptionValues: OptionValue[],
  productRushAddons: RushAddon[],
  currencyExchangeRate: number,
  selectedCurrency: Currency
): ProductionTimeOption[] {
  if (!productRushAddons.length) {
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

  for (const addon of productRushAddons) {
    const addonOption = addonOptions[addon.id];

    if (!addonOption && addon.id) {
      Logger.warn('The option product of rush addon is not found: ' + addon.id, 'budsies')();
      continue;
    }

    const price = addon.price * currencyExchangeRate;
    const text = `${addon.text}: +${PriceHelper.formatPrice(price, selectedCurrency.symbol)}`;

    result.push({
      // TODO: get rid of hardcoded id
      id: addonOption?.id || PRODUCTION_TIME_SELECTOR_STANDARD_OPTION_VALUE_ID,
      text,
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

    return optionValueA.sn - optionValueB.sn;
  });
}
