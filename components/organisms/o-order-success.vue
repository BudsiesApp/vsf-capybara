<template>
  <div class="o-order-success">
    <div class="_heading">
      <SfHeading
        class="_main-title"
        :title="$t('Let the plushification begin!')"
        :level="1"
      />

      <SfHeading
        class="_main-subtitle"
        :title="$t('Thank you for your order.')"
        :level="3"
      />

      <SfHeading
        :level="4"
      >
        <template #title>
          <h4 class="sf-heading__title sf-heading__title--h4">
            {{ $t('Please feel free to email') }}
            <a href="mailto:info@stuffedanimalpros.com">info@stuffedanimalpros.com</a>
            {{ $t('if you have any questions.') }}
          </h4>
        </template>
      </SfHeading>
    </div>

    <div class="_content">
      <div class="_left">
        <video autoplay loop muted playsinline class="_success-icon">
          <source src="/assets/success/video/success-icon.mp4" type="video/mp4">
        </video>
      </div>

      <div class="_right">
        <div class="_section">
          <div class="_title">
            <div class="_number">
              1
            </div>

            <SfHeading
              :title="$t('Are you a trendsetter?')"
              :level="3"
            />
          </div>

          <div class="_sharing-content _section-content">
            <p class="_text">
              {{ $t('Let your colleagues know about Stuffed Animal Pros so they can make their own amazing custom plushies.') }}
            </p>

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
              2
            </div>

            <SfHeading
              :title="$t('Check out our sister brands!')"
              :level="3"
            />
          </div>

          <div class="_section-content _brands-section">
            <div class="_brands-container">
              <div class="_brand-item" v-for="item in brandItems" :key="item.storeName">
                <span>
                  <a :href="item.link" target="_blank">
                    {{ item.storeName }}
                  </a>

                  {{ item.text }}
                </span>

                <div class="_brand-content">
                  <a :href="item.link" target="_blank">
                    <img class="_image" :src="item.imageSrc">
                  </a>

                  <SfButton class="_button-link">
                    <a class="_inner" :href="item.link" target="_blank">
                      {{ item.buttonText }}
                    </a>
                  </SfButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import config from 'config';
import Vue, { VueConstructor } from 'vue'
import { SfButton, SfHeading } from '@storefront-ui/vue';

import MSocialSharing from 'theme/components/molecules/m-social-sharing.vue';

import { InjectType } from 'src/modules/shared';

interface BrandItem {
  link: string,
  storeName: string,
  text: string,
  imageSrc: string,
  buttonText: string
}

interface NonReactiveState {
  sharingData: {
    sharingUrl: string,
    sharingDescription: string,
    eMailSubject: string,
    twitterDescription: string,
    image: string
  },
  brandItems: BrandItem[]
}

interface InjectedServices {
  window: Window
}

export default (Vue as VueConstructor<Vue & NonReactiveState & InjectedServices>).extend({
  name: 'OOrderSuccess',
  inject: {
    window: { from: 'WindowObject' }
  } as unknown as InjectType<InjectedServices>,
  components: {
    MSocialSharing,
    NoticeOfFinancialIncentiveLink,
    SfButton,
    SfHeading
  },
  created () {
    const baseUrl = this.window.location ? `${this.window.location.protocol}//${this.window.location.host}` : '';
    const description = `${baseUrl} ${this.$t('lets any person or brand turn their character into a real, custom, handmade stuffed animal. Check it out!')} ${baseUrl}`;

    this.sharingData = {
      sharingUrl: baseUrl,
      sharingDescription: description,
      eMailSubject: this.$t('Check out {websiteUrl} - super cool', { websiteUrl: baseUrl }) as string,
      twitterDescription: description,
      image: `${baseUrl}/assets/images/sharing-image.jpg`
    };
    this.brandItems = [
      {
        link: `https://${config.budsies.budsiesStoreDomain}/budsies-services/`,
        storeName: 'Budsies',
        text: this.$t('turns anyone\'s drawings into real custom stuffed animals. Bring your (or your child\'s) artwork to life!').toString(),
        buttonText: this.$t('Visit {storeName}', { storeName: 'Budsies' }).toString(),
        imageSrc: '/assets/success/images/budsies-advertising-image.jpg'
      },
      {
        link: `https://${config.budsies.budsiesStoreDomain}/selfies-services/`,
        storeName: 'Selfies',
        text: this.$t(': Get a plush doll of anyone special in your life').toString(),
        buttonText: this.$t('Visit {storeName}', { storeName: 'Selfies' }).toString(),
        imageSrc: '/assets/success/images/selfies-advertising-image.jpg'
      },
      {
        link: `https://${config.budsies.petsiesStoreDomain}`,
        storeName: 'Petsies',
        text: this.$t(': Handmade plush lookalikes of your real pets!').toString(),
        buttonText: this.$t('Visit {storeName}', { storeName: 'Petsies' }).toString(),
        imageSrc: '/assets/success/images/petsies-advertising-image.jpg'
      }
    ]
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

  ._content {
    display: flex;
    flex-direction: column;

    ._left {
      display: flex;
      justify-content: center;
      margin-bottom: var(--spacer-xl);
    }
  }

  ._success-icon {
    max-width: 100%;
  }

  ._brands-container {
    display: grid;
    grid-template-columns: auto;

    ._brand-item {
      box-sizing: border-box;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      margin-top: var(--spacer-lg);
      padding: 0;
    }

    ._brand-content,
    .sf-button {
      margin-top: var(--spacer-sm);
    }

    ._brand-content {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    ._image {
      height: auto;
      width: 100%;
    }
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
      background: var(--c-primary);
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

  ._button-link {
    --button-padding: 0;

    ._inner {
      padding: var(--spacer-sm) calc(var(--spacer-sm) * 2);
      color: var(--color-white);
    }
  }

  ._text {
    text-align: center;

    &.-small {
      font-size: var(--font-sm);
    }
  }

  .notice-of-financial-incentive-link {
    --financial-incentive-link-margin: var(--spacer-sm) 0 0;
    --financial-incentive-link-display: inline-block;
  }

  @include for-desktop {
    ._content {
      flex-direction: row;

      ._left {
        align-items: start;
        flex: 2;
        margin-bottom: 0;
        margin-top: 3rem;
      }

      ._right {
        flex: 3;
      }
    }

    ._brands-container {
      grid-template-columns: repeat(2, minmax(0, 1fr));

      ._brand-item {
        padding: 0 var(--spacer-sm);
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

      ._section-content {
        padding-left: calc(#{$number-size} + #{$number-margin-right-desktop});

        &._brands-section {
          padding-left: $number-size;
        }
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
