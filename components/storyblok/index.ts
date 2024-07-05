import { add } from 'src/modules/vsf-storyblok-module/components'

export default function registerComponents () {
  add('heading', () => import(/* webpackChunkName: "vsf-storyblok" */'./Heading.vue'))
  add('button_item', () => import(/* webpackChunkName: "vsf-storyblok" */ './Button.vue'))
  add('buttons', () => import(/* webpackChunkName: "vsf-storyblok" */ './Buttons.vue'))
  add('html', () => import(/* webpackChunkName: "vsf-storyblok" */ './Html.vue'))
  add('image', () => import(/* webpackChunkName: "vsf-storyblok" */ './Image.vue'))
  add('driver', () => import(/* webpackChunkName: "vsf-storyblok" */ './Driver.vue'))
  add('homepage_intro_section', () => import(/* webpackChunkName: "vsf-storyblok" */ './HomepageIntroSection.vue'))
  add('slider', () => import('./Slider.vue'))
  add('video', () => import(/* webpackChunkName: "vsf-storyblok" */ './Video.vue'))
  add('promotion_image_banner', () => import(/* webpackChunkName: "vsf-storyblok" */ './PromoCampaignBanner.vue'))
  add('textarea', () => import(/* webpackChunkName: "vsf-storyblok" */ './Textarea.vue'))
  add('website_rating', () => import(/* webpackChunkName: "vsf-storyblok" */ './WebsiteRating.vue'))
  add('sharing', () => import(/* webpackChunkName: "vsf-storyblok" */ './Sharing.vue'))
  add('newsletter_subscribe_form', () => import(/* webpackChunkName: "vsf-storyblok" */ './NewsletterSubscribeForm.vue'))
  add('expandable_text_block', () => import(/* webpackChunkName: "vsf-storyblok" */ './ExpandableText.vue'))
  add('hr', () => import(/* webpackChunkName: "vsf-storyblok" */ './HorizontalRule.vue'))
  add('parallax', () => import(/* webpackChunkName: "vsf-storyblok" */ './Parallax.vue'))
  add('mailing_list_subscribe_form', () => import(/* webpackChunkName: "vsf-storyblok" */ './MailingListSubscribeForm.vue'))
  add('tabs', () => import(/* webpackChunkName: "vsf-storyblok" */ './Tabs.vue'))
  add('tab', () => import(/* webpackChunkName: "vsf-storyblok" */ './Tab.vue'))
  add('carousel', () => import(/* webpackChunkName: "vsf-storyblok" */ './Carousel.vue'))

  // add('product', () => import('./Product.vue'))
  // add('category', () => import('./Category.vue'))
  // add('ciLink', () => import('./Link.vue'))
  // Overwrite an existing component
  // add('tile', () => import('./Tile.vue'), { force: true })
}
