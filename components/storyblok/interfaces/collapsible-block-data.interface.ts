import { ItemData } from 'src/modules/vsf-storyblok-module';

export default interface CollapsibleBlockData extends ItemData {
  title: string,
  body: ItemData[]
}
