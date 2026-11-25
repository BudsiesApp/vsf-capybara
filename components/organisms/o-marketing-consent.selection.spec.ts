import { mount } from '@vue/test-utils';
import Vue from 'vue';
import Vuex from 'vuex';

import { useStore } from '@vue-storefront/core/application-services';
import { useCheckoutConsent } from 'src/modules/checkout-marketing-consent/composables/use-checkout-consent';
import { consentPayload } from 'src/modules/checkout-marketing-consent/helpers';
import { consentModule } from 'src/modules/checkout-marketing-consent/store';
import { GET_SELECTION } from 'src/modules/checkout-marketing-consent/types/store/getters';
import { SET_HYDRATED, SET_SELECTION } from 'src/modules/checkout-marketing-consent/types/store/mutations';

import OMarketingConsent from './o-marketing-consent.vue';

jest.mock('@vue-storefront/core/application-services', () => ({
  useStore: jest.fn(),
  useI18n: () => ({ t: (key: string) => key })
}));
jest.mock('@vue-storefront/core/helpers', () => ({ isServer: false }));
jest.mock('@vue-storefront/core/lib/sync', () => ({ TaskQueue: { execute: jest.fn() } }));
jest.mock('@vue-storefront/core/lib/storage-manager', () => ({ StorageManager: { get: jest.fn() } }));
jest.mock('@storefront-ui/vue', () => ({ SfCheckbox: {}, SfInput: {} }));

Vue.use(Vuex);

const SETTINGS = {
  emailConsentLabel: 'Email',
  smsConsentLabel: 'SMS',
  smsEnabled: true
};
const SAVED_PHONE = '+12125550123';
const EMAIL = 'a@example.test';

const SfCheckboxStub = {
  props: ['selected', 'disabled'],
  template: '<div />'
};
const SfInputStub = {
  props: ['value'],
  template: '<input :value="value" @input="$emit(\'input\', $event.target.value)">'
};

describe('saved consent selection and phone edits', () => {
  it('does not keep the saved SMS consent effective after the phone is edited to an invalid number', async () => {
    const store = new Vuex.Store({
      modules: { checkoutMarketingConsent: consentModule },
      getters: {
        'backend-settings/getSettingByCompositeKey': () => () => SETTINGS
      }
    });

    store.commit(`checkoutMarketingConsent/${SET_SELECTION}`, {
      email: EMAIL,
      emailConsent: true,
      smsConsent: true,
      phone: SAVED_PHONE
    });
    store.commit(`checkoutMarketingConsent/${SET_HYDRATED}`);
    const mutations: string[] = [];
    store.subscribe(mutation => mutations.push(mutation.type));
    (useStore as jest.Mock).mockReturnValue(store);

    const Harness = Vue.extend({
      components: { OMarketingConsent },
      setup () {
        const consent = useCheckoutConsent();

        consent.updateEmail(EMAIL);

        return { draft: consent.draft };
      },
      template: '<OMarketingConsent v-model="draft" />'
    });
    const wrapper = mount(Harness, {
      mocks: { $t: (key: string) => key },
      stubs: {
        SfCheckbox: SfCheckboxStub,
        SfInput: SfInputStub
      }
    });
    const readPayload = () => consentPayload(
      SETTINGS,
      store.getters[`checkoutMarketingConsent/${GET_SELECTION}`],
      EMAIL
    );

    expect(readPayload()).toEqual({
      email: true,
      sms: true,
      phone: SAVED_PHONE
    });
    expect(wrapper.findComponent(OMarketingConsent).emitted('input')).toBeUndefined();
    expect(mutations).not.toContain(`checkoutMarketingConsent/${SET_SELECTION}`);

    await wrapper.find('input').setValue('21255');

    expect(readPayload()).toEqual({
      email: false,
      sms: false
    });

    wrapper.destroy();
  });
});
