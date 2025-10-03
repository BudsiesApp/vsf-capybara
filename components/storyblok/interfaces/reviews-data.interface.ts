import { ItemData } from 'src/modules/vsf-storyblok-module';

import { ReviewsWidget } from './reviews-widget.enum';

export interface ReviewsData extends ItemData {
  widget: ReviewsWidget
}
