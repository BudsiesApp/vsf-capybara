<template>
  <div class="o-order-success">
    <div class="_heading">
      <SfHeading
        class="_main-title"
        :title="$t('Order Complete')"
        :level="1"
      />
      <SfHeading
        class="_main-subtitle"
        :title="$t('Thank you for placing your Budsies order.')"
        :level="3"
      />
      <SfHeading
        :level="4"
      >
        <template #title>
          <h4 class="sf-heading__title sf-heading__title--h4">
            {{ $t('Please feel free to email') }}
            <a href="mailto:support@budsies.com">support@budsies.com</a>
            {{ $t('if you have any questions.') }}
          </h4>
        </template>
      </SfHeading>

      <p class="_confirmation">
        {{ $t('You\'ll receive a confirmation email with your order number shortly!') }}
      </p>
    </div>

    <div class="_content">
      <div class="_right">
        <div class="_section">
          <div class="_title">
            <div class="_number">
              1
            </div>

            <SfHeading
              :title="$t('Extra gift for the artist (Optional)')"
              :level="3"
            />
          </div>

          <m-share-birthday-form
            class="_section_content"
            :add-another-button-text="$t('Add another artist')"
            :top-helper-text="$t('Enter the artist\'s birthday so we can send you a special gift')"
            :name-input-label="$t('Artist\'s name')"
            :submit-button-text="$t('Add artist')"
          />
        </div>

        <div class="_section">
          <div class="_title">
            <div class="_number">
              2
            </div>

            <SfHeading
              :title="$t('Do you have a special story?')"
              :level="3"
            />
          </div>

          <m-share-special-story-form
            class="m-share-special-story-form _section_content"
            :submit-button-text="$t('Share with Budsies')"
          />
        </div>

        <div class="_section">
          <div class="_title">
            <div class="_number">
              3
            </div>

            <SfHeading
              :title="$t('Be a Trendsetter. Share your creation!')"
              :level="3"
            />
          </div>

          <div class="_sharing-content _section_content">
            <m-social-sharing
              :sharing-url="sharingData.sharingUrl"
              :sharing-description="sharingData.sharingDescription"
              :e-mail-subject="sharingData.eMailSubject"
              :twitter-description="sharingData.twitterDescription"
              :image="sharingData.image"
            />

            <p class="_text -small">
              {{ $t('Clicking link will open new tab where you can customize your message.') }}
            </p>
          </div>
        </div>

        <div class="_section">
          <div class="_title">
            <div class="_number">
              4
            </div>

            <SfHeading
              :title="$t('Love Budsies? Share the love with friends and get VIP perks!')"
              :level="3"
            />
          </div>

          <div class="_section_content">
            <a :href="referralLink" target="_blank">
              <SfButton>
                {{ $t('Referral Program') }}
              </SfButton>
            </a>

            <p class="_text -small">
              {{ $t('Rewards dollars may be applied onto existing orders within 7 days of checkout.') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType, VueConstructor } from 'vue'
import { SfButton, SfHeading } from '@storefront-ui/vue';

import MSocialSharing from 'theme/components/molecules/m-social-sharing.vue';

import MShareSpecialStoryForm from './OOrderSuccess/m-pet-special-story-form.vue'; // TODO replace path after merge Petsies branch
import MShareBirthdayForm from './OOrderSuccess/m-pets-birthday-form.vue';
import { InjectType } from 'src/modules/shared';
import { Order } from 'core/modules/order/types/Order';

interface NonReactiveState {
  sharingData: {
    sharingUrl: string,
    sharingDescription: string,
    eMailSubject: string,
    twitterDescription: string,
    image: string
  }
}

interface InjectedServices {
  window: Window
}

const referralBaseUrl = 'https://referrals.budsies.com';

export default (Vue as VueConstructor<Vue & NonReactiveState & InjectedServices>).extend({
  name: 'OOrderSuccess',
  props: {
    confirmation: {
      type: Object as PropType<any>,
      required: true
    },
    order: {
      type: Object as PropType<Order>,
      required: true
    }
  },
  inject: {
    window: { from: 'WindowObject' }
  } as unknown as InjectType<InjectedServices>,
  components: {
    MShareSpecialStoryForm,
    MShareBirthdayForm,
    MSocialSharing,
    SfButton,
    SfHeading
  },
  computed: {
    email (): string {
      return this.order.personalDetails.emailAddress;
    },
    fullName (): string {
      return `${this.order.personalDetails.firstName} ${this.order.personalDetails.lastName}`;
    },
    orderId (): number {
      return this.confirmation.magentoOrderId;
    },
    referralLink (): string {
      return `${referralBaseUrl}/?skipreg=1&refid=${this.orderId}&name=${this.fullName}&email=${this.email}`;
    }
  },
  created () {
    const baseUrl = this.window.location ? `${this.window.location.protocol}//${this.window.location.host}` : ''
    this.sharingData = {
      sharingUrl: baseUrl,
      sharingDescription: `${this.$t('Just brought a drawing to life by making a custom stuffed toy!')} ${baseUrl}`,
      eMailSubject: this.$t('Check out Budsies!').toString(),
      twitterDescription: `${this.$t('Just brought a drawing to life by making a custom stuffed toy!')} ${baseUrl} 'http://pic.twitter.com/H0WOKFdc4l'`,
      image: baseUrl + '/assets/images/order_success_pinterest_share.jpg'
    };
  },
  destroyed () {
    this.$store.dispatch('checkout/setThankYouPage', false);
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

$number-size: 50px;
$number-margin-right-desktop: var(--spacer-sm);

.o-order-success {

  ._heading {
    padding: 0 var(--spacer-sm);
  }

  ._main-title {
    margin-bottom: var(--spacer-lg);
  }

  ._main-subtitle {
    margin-bottom: var(--spacer-base);
  }

  ._confirmation {
    color: var(--c-danger-variant);
    text-align: center;
    font-size: var(--font-base);
    margin-top: var(--spacer-base);
  }

  ._content {
    display: flex;
    flex-direction: column;
    max-width: 71.25rem;

    ._left {
      display: flex;
      justify-content: center;
      margin-bottom: var(--spacer-xl);
    }
  }

  ._success-icon {
    max-width: 100%;
  }

  ._section {
    padding: 0 var(--spacer-sm);
    margin-bottom: var(--spacer-xl);

    &:last-child {
      margin-bottom: 0;
    }

    ._title {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    ._number {
      flex-shrink: 0;
      background: var(--c-info);
      border-radius: 25px;
      color: var(--c-white);
      display: inline-block;
      font-size: var(--font-xl);
      height: $number-size;
      line-height: $number-size;
      text-align: center;
      vertical-align: top;
      width: $number-size;
      margin-bottom: var(--spacer-base);
    }
  }

  ._sharing-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  ._text {
    text-align: center;

    &.-small {
      font-size: var(--font-sm);
    }
  }

  @include for-desktop {
    ._content {
      flex-direction: row;

      ._left {
        align-items: start;
        flex: 2;
        margin-bottom: 0;
      }

      ._right {
        flex: 3;
      }
    }

    ._section {
      ._title {
        flex-direction: row;

        .sf-heading {
          --heading-text-align: start;
        }
      }

      ._number {
        margin-bottom: 0;
        margin-right: $number-margin-right-desktop;
      }

      ._section_content {
        padding-left: calc(#{$number-size} + #{$number-margin-right-desktop});
      }

      &:first-child {
        margin-top: 3rem;
      }
    }

    ._sharing-content {
      align-items: flex-start;
    }

    ._text {
      text-align: start;
    }
  }
}
</style>
