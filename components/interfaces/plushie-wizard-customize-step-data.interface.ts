import { BodypartOption } from 'src/modules/budsies';

import SelectedAddon from './selected-addon.interface';
import SizeOption from './size-option';

export default interface PlushieWizardCustomizeStepData {
  bodypartsValues: Record<string, BodypartOption | BodypartOption[] | undefined>,
  addons: SelectedAddon[],
  description?: string,
  productionTime?: number,
  quantity: number,
  size: SizeOption | undefined
}
