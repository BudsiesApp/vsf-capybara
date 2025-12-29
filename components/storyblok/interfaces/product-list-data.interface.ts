import { ColumnsCountField, ItemData } from 'src/modules/vsf-storyblok-module';

export default interface ProductListData extends ItemData {
  columns_count: ColumnsCountField,
  products: number[]
}
