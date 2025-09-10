import { ItemData } from 'src/modules/vsf-storyblok-module';
import { ReviewWidget } from './review-widget.enum';

export interface ReviewData extends ItemData {
  widget: ReviewWidget
}
