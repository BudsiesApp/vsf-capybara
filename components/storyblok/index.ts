import { add } from 'src/modules/vsf-storyblok-module/components'

export default function registerComponents () {
  add('heading', () => import(/* webpackChunkName: "vsf-storyblok-common-components" */'./Heading.vue'))
  add('button_item', () => import(/* webpackChunkName: "vsf-storyblok-common-components" */ './Button.vue'))
  add('buttons', () => import(/* webpackChunkName: "vsf-storyblok-common-components" */ './Buttons.vue'))
  add('html', () => import(/* webpackChunkName: "vsf-storyblok-common-components" */ './Html.vue'))
  add('image', () => import(/* webpackChunkName: "vsf-storyblok-common-components" */ './Image.vue'))
  add('driver', () => import(/* webpackChunkName: "vsf-storyblok-common-components" */ './Driver.vue'))
  add('homepage_intro_section', () => import('./HomepageIntroSection.vue'))
  add('slider', () => import(/* webpackChunkName: "vsf-storyblok-common-components" */ './Slider.vue'))
  add('video', () => import(/* webpackChunkName: "vsf-storyblok-common-components" */ './Video.vue'))
  add('promotion_image_banner', () => import(/* webpackChunkName: "vsf-storyblok-common-components" */ './PromoCampaignBanner.vue'))
  add('textarea', () => import(/* webpackChunkName: "vsf-storyblok-common-components" */ './Textarea.vue'))
  add('dongler_book', () => import('./DonglerBook.vue'))
  add('website_rating', () => import(/* webpackChunkName: "vsf-storyblok-common-components" */ './WebsiteRating.vue'))
  add('sharing', () => import(/* webpackChunkName: "vsf-storyblok-common-components" */ './Sharing.vue'))
  add('newsletter_subscribe_form', () => import('./NewsletterSubscribeForm.vue'))
  add('expandable_text_block', () => import('./ExpandableText.vue'))
  add('hr', () => import(/* webpackChunkName: "vsf-storyblok-common-components" */ './HorizontalRule.vue'))
  add('parallax', () => import('./Parallax.vue'))
  add('mailing_list_subscribe_form', () => import('./MailingListSubscribeForm.vue'))
  add('remind_me_about_budsies', () => import('./RemindMeAboutBudsies.vue'))

  // add('product', () => import('./Product.vue'))
  // add('category', () => import('./Category.vue'))
  // add('ciLink', () => import('./Link.vue'))
  // Overwrite an existing component
  // add('tile', () => import('./Tile.vue'), { force: true })
}
