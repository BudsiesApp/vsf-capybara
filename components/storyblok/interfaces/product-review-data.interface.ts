import { ItemData } from 'src/modules/vsf-storyblok-module';

import { ProductReviewWidget } from './product-review-widget.enum';

export interface ProductReviewData extends ItemData {
  product_id: string,
  widget: ProductReviewWidget
}
