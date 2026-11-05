import { add, StoryblokComponentGroup } from 'src/modules/vsf-storyblok-module/components'

export default function registerComponents () {
  add('heading', () => import(/* webpackChunkName: "vsf-storyblok" */'./Heading.vue'), { group: StoryblokComponentGroup.CORE })
  add('button_item', () => import(/* webpackChunkName: "vsf-storyblok" */ './Button.vue'), { group: StoryblokComponentGroup.CORE })
  add('coupon_offer', () => import(/* webpackChunkName: "vsf-storyblok" */ './CouponOffer.vue'), { group: StoryblokComponentGroup.CORE })
  add('buttons', () => import(/* webpackChunkName: "vsf-storyblok" */ './Buttons.vue'), { group: StoryblokComponentGroup.CORE })
  add('html', () => import(/* webpackChunkName: "vsf-storyblok" */ './Html.vue'), { group: StoryblokComponentGroup.CORE })
  add('image', () => import(/* webpackChunkName: "vsf-storyblok" */ './Image.vue'), { group: StoryblokComponentGroup.CORE })
  add('driver', () => import(/* webpackChunkName: "vsf-storyblok" */ './Driver.vue'), { group: StoryblokComponentGroup.CORE })
  add('homepage_intro_section', () => import(/* webpackChunkName: "vsf-storyblok" */ './HomepageIntroSection.vue'), { group: StoryblokComponentGroup.CORE })
  add('slider', () => import(/* webpackChunkName: "vsf-storyblok" */'./Slider.vue'), { group: StoryblokComponentGroup.CORE })
  add('video', () => import(/* webpackChunkName: "vsf-storyblok" */ './Video.vue'), { group: StoryblokComponentGroup.CORE })
  add('promotion_image_banner', () => import(/* webpackChunkName: "vsf-storyblok" */ './PromoCampaignBanner.vue'), { group: StoryblokComponentGroup.CORE })
  add('textarea', () => import(/* webpackChunkName: "vsf-storyblok" */ './Textarea.vue'), { group: StoryblokComponentGroup.CORE })
  add('dongler_book', () => import(/* webpackChunkName: "vsf-storyblok" */ './DonglerBook.vue'), { group: StoryblokComponentGroup.CORE })
  add('website_rating', () => import(/* webpackChunkName: "vsf-storyblok" */ './WebsiteRating.vue'), { group: StoryblokComponentGroup.CORE })
  add('sharing', () => import(/* webpackChunkName: "vsf-storyblok" */ './Sharing.vue'), { group: StoryblokComponentGroup.CORE })
  add('newsletter_subscribe_form', () => import(/* webpackChunkName: "vsf-storyblok" */ './NewsletterSubscribeForm.vue'), { group: StoryblokComponentGroup.CORE })
  add('expandable_text_block', () => import(/* webpackChunkName: "vsf-storyblok" */ './ExpandableText.vue'), { group: StoryblokComponentGroup.CORE })
  add('collapsible_block', () => import(/* webpackChunkName: "vsf-storyblok" */ './CollapsibleBlock.vue'), { group: StoryblokComponentGroup.CORE })
  add('hr', () => import(/* webpackChunkName: "vsf-storyblok" */ './HorizontalRule.vue'), { group: StoryblokComponentGroup.CORE })
  add('parallax', () => import(/* webpackChunkName: "vsf-storyblok" */ './Parallax.vue'), { group: StoryblokComponentGroup.CORE })
  add('mailing_list_subscribe_form', () => import(/* webpackChunkName: "vsf-storyblok" */ './MailingListSubscribeForm.vue'), { group: StoryblokComponentGroup.CORE })
  add('remind_me_about_budsies', () => import('./RemindMeAboutBudsies.vue'))
  add('tabs', () => import(/* webpackChunkName: "vsf-storyblok" */ './Tabs.vue'), { group: StoryblokComponentGroup.CORE })
  add('tab', () => import(/* webpackChunkName: "vsf-storyblok" */ './Tab.vue'), { group: StoryblokComponentGroup.CORE })
  add('carousel', () => import(/* webpackChunkName: "vsf-storyblok" */ './Carousel.vue'), { group: StoryblokComponentGroup.CORE })
  add('lightbox_gallery', () => import(/* webpackChunkName: "vsf-storyblok" */ './LightboxGallery.vue'), { group: StoryblokComponentGroup.CORE })
  add('product_reviews', () => import(/* webpackChunkName: "vsf-storyblok" */ './ProductReviews.vue'), { group: StoryblokComponentGroup.CORE })
  add('reviews', () => import(/* webpackChunkName: "vsf-storyblok" */ './Reviews.vue'), { group: StoryblokComponentGroup.CORE })
  add('product_structured_data', () => import(/* webpackChunkName: "vsf-storyblok" */ './ProductStructuredData.vue'), { group: StoryblokComponentGroup.CORE })

  add('product', () => import(/* webpackChunkName: "vsf-storyblok" */ './Product.vue'), { group: StoryblokComponentGroup.CORE })
  add('category', () => import(/* webpackChunkName: "vsf-storyblok" */ './Category.vue'), { group: StoryblokComponentGroup.CORE })
  add('product_list', () => import(/* webpackChunkName: "vsf-storyblok" */ './ProductList.vue'), { group: StoryblokComponentGroup.CORE })

  add('paypal_pay_later_message', () => import(/* webpackChunkName: "vsf-storyblok" */ './PayPalPayLaterMessage.vue'), { group: StoryblokComponentGroup.CORE })

  // add('ciLink', () => import('./Link.vue'))
  // Overwrite an existing component
  // add('tile', () => import('./Tile.vue'), { force: true })
}
