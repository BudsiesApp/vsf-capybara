import { ItemData } from 'src/modules/vsf-storyblok-module';

import { TabItemData } from './tab-item-data.interface';

export interface TabsData extends ItemData {
  tabs: TabItemData[]
}
