import { ItemData } from 'src/modules/vsf-storyblok-module';

export default interface CollapsibleBlockData extends ItemData {
  title: string,
  heading_type: number | string,
  body: ItemData[]
}
