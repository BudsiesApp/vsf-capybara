import { ItemData } from 'src/modules/vsf-storyblok-module';

import ButtonItemLinkField from './button-item-link-field.interface';

export default interface ButtonItemData extends ItemData {
  link_text: string,
  link_url: ButtonItemLinkField,
  is_primary: boolean,
  target_blank: boolean
}
