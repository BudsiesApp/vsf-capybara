import { ItemData } from 'src/modules/vsf-storyblok-module';

import { ProductReviewsWidget } from './product-reviews-widget.enum';

export interface ProductReviewsData extends ItemData {
  product_id: string,
  widget: ProductReviewsWidget
}
