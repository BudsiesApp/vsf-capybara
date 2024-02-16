import AddonOption from 'theme/components/interfaces/addon-option.interface';
import SizeOption from 'theme/components/interfaces/size-option';

export function filterAddonBasedOnSizeOption (
  addonOption: AddonOption,
  sizeOption?: SizeOption
): boolean {
  if (!sizeOption) {
    return true;
  }

  return !sizeOption.disabledUpgrades.includes(addonOption.id);
}
