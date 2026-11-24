import { shallowMount } from '@vue/test-utils';
import { computed, ref } from 'vue';
import PersonalDetails from './o-personal-details.vue';
import { useCheckoutConsent } from 'src/modules/checkout-marketing-consent/composables/use-checkout-consent';

jest.mock('src/modules/checkout-marketing-consent/composables/use-checkout-consent', () => ({ useCheckoutConsent: jest.fn() }));
jest.mock('@vue-storefront/core/application-services', () => ({ useRoute: () => ({ fullPath: '/' }) }));
jest.mock('@vue-storefront/core/additional-content', () => ({ AdditionalContentOutlet: { PRIVACY_POLICY_LINKS: 'privacy' }, useAdditionalContent: () => [{ key: 'privacy', component: { name: 'PrivacyNotice', template: '<a>Privacy</a>' } }] }));
jest.mock('@vue-storefront/core/modules/checkout/components/PersonalDetails', () => ({ PersonalDetails: {} }));
jest.mock('@vue-storefront/core/compatibility/plugins/event-bus', () => ({ __esModule: true, default: { $on: jest.fn(), $off: jest.fn() } }));
jest.mock('theme/helpers/use-authorization-route-restoration', () => ({ useAuthorizationRouteRestoration: () => ({ persistPostAuthRedirectPath: jest.fn(), resetPostAuthRedirectPath: jest.fn() }) }));
jest.mock('theme/helpers', () => ({ createSmoothscroll: jest.fn() }));
jest.mock('theme/store/ui/modals', () => ({ ModalList: {} }));
jest.mock('src/modules/shared', () => ({ PrivacyPolicyLink: {} }));
jest.mock('src/modules/persisted-customer-data', () => ({ SET_PERSISTED_CUSTOMER_PHONE_NUMBER: 'setPhone' }));
jest.mock('theme/components/molecules/m-login', () => ({ __esModule: true, default: {} }));
jest.mock('theme/components/atoms/a-promo-code', () => ({ __esModule: true, default: {} }));
jest.mock('@vue-storefront/i18n', () => ({ __esModule: true, default: { t: (v: string) => v } }));
jest.mock('theme/components/organisms/o-marketing-consent.vue', () => ({ __esModule: true, default: {} }));
jest.mock('@storefront-ui/vue', () => ({ SfInput: {}, SfButton: {}, SfHeading: {} }));

const EMPTY_VALUE = {
  emailConsent: false,
  smsConsent: false,
  phone: ''
};
const MarketingConsentStub = {
  name: 'OMarketingConsent',
  props: ['value', 'disabled'],
  template: '<div class="marketing-consent" />'
};

function mockConsent (overrides = {}) {
  const consent = {
    draft: ref({ ...EMPTY_VALUE }),
    settings: computed(() => undefined),
    offered: computed(() => ({ email: true, sms: true })),
    hydrated: ref(true),
    updateEmail: jest.fn(),
    save: jest.fn(),
    ...overrides
  };

  (useCheckoutConsent as jest.Mock).mockReturnValue(consent);

  return consent;
}

describe('Contact consent', () => {
  it.each([null, { id: 1 }])('renders the consent form and keeps the privacy outlet for user %p', (user) => {
    mockConsent();

    const wrapper = shallowMount(PersonalDetails as any, {
      mocks: {
        $t: (key: string) => key,
        $store: { getters: {}, commit: jest.fn() },
        $v: { personalDetails: { emailAddress: {}, firstName: {}, lastName: {} } }
      },
      data: () => ({
        personalDetails: { emailAddress: '', firstName: '', lastName: '' },
        currentUser: user,
        isVirtualCart: false
      }),
      stubs: {
        SfHeading: { template: '<div tabindex="-1" />' },
        OMarketingConsent: MarketingConsentStub
      }
    });

    expect(wrapper.findComponent({ name: 'OMarketingConsent' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'PrivacyNotice' }).exists()).toBe(true);

    wrapper.destroy();
  });

  it('binds the checkout draft to the consent form with v-model', async () => {
    const consent = mockConsent();
    const wrapper = shallowMount(PersonalDetails as any, {
      mocks: {
        $t: (key: string) => key,
        $store: { getters: {}, commit: jest.fn() },
        $v: { personalDetails: { emailAddress: {}, firstName: {}, lastName: {} } }
      },
      data: () => ({
        personalDetails: { emailAddress: 'a@example.com', firstName: 'A', lastName: 'B' },
        currentUser: null,
        isVirtualCart: false
      }),
      stubs: {
        SfHeading: { template: '<div tabindex="-1" />' },
        OMarketingConsent: MarketingConsentStub
      }
    });
    const form = wrapper.findComponent({ name: 'OMarketingConsent' });
    const changed = {
      emailConsent: true,
      smsConsent: false,
      phone: ''
    };

    expect(form.props('value')).toEqual(EMPTY_VALUE);

    form.vm.$emit('input', changed);
    await wrapper.vm.$nextTick();

    expect(consent.draft.value).toEqual(changed);
    expect(consent.updateEmail).toHaveBeenCalledWith('a@example.com');

    wrapper.destroy();
  });

  it('blocks Continue when the form is invalid and saves a valid checked phone', async () => {
    const validate = jest.fn().mockReturnValue(false);
    const context: any = {
      $v: { personalDetails: { $touch: jest.fn(), $invalid: false } },
      $refs: {},
      $store: { commit: jest.fn() },
      consentOffered: { sms: true },
      consentDraft: { smsConsent: true, phone: '+14165550123' },
      consentForm: { validate },
      personalDetails: { emailAddress: 'a@example.com', firstName: 'A', lastName: 'B' },
      saveConsent: jest.fn(),
      sendDataToCheckout: jest.fn()
    };
    const proceed = (PersonalDetails as any).methods.onContinueButtonClick;

    await proceed.call(context);

    expect(validate).toHaveBeenCalledTimes(1);
    expect(context.saveConsent).not.toHaveBeenCalled();
    expect(context.sendDataToCheckout).not.toHaveBeenCalled();

    validate.mockReturnValue(true);
    await proceed.call(context);

    expect(context.saveConsent).toHaveBeenCalledWith('a@example.com');
    expect(context.$store.commit).toHaveBeenCalledWith('setPhone', '+14165550123');

    context.$store.commit.mockClear();
    context.consentDraft.smsConsent = false;
    await proceed.call(context);

    expect(context.$store.commit).not.toHaveBeenCalledWith('setPhone', '+14165550123');

    context.consentOffered.sms = false;
    context.consentDraft.smsConsent = true;
    await proceed.call(context);

    expect(context.$store.commit).not.toHaveBeenCalledWith('setPhone', '+14165550123');

    context.isRegistrationRequired = true;
    context.$store.dispatch = jest.fn().mockResolvedValue({ code: 400 });
    context.saveConsent.mockClear();
    await proceed.call(context);

    expect(context.saveConsent).not.toHaveBeenCalled();
  });
});
