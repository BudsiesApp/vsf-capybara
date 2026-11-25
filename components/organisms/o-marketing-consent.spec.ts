import { shallowMount, Wrapper } from '@vue/test-utils';
import Vue from 'vue';
import Vuex from 'vuex';

import { useStore } from '@vue-storefront/core/application-services';

import OMarketingConsent from './o-marketing-consent.vue';

jest.mock('@vue-storefront/core/application-services', () => ({ useStore: jest.fn() }));
jest.mock('@storefront-ui/vue', () => ({ SfCheckbox: { name: 'SfCheckbox' }, SfInput: {} }));

Vue.use(Vuex);

const SfCheckboxStub = {
  name: 'SfCheckbox',
  props: ['selected', 'disabled'],
  template: '<div class="checkbox"><slot name="label" /></div>'
};
const focusPhone = jest.fn();
const MPhoneInputStub = {
  name: 'MPhoneInput',
  props: ['value', 'showError', 'disabled'],
  methods: { focus: focusPhone },
  template: '<div class="phone" />'
};
const EMPTY_VALUE = {
  emailConsent: false,
  smsConsent: false,
  phone: ''
};

function mountForm (
  settings: Record<string, unknown> | undefined,
  value = EMPTY_VALUE,
  disabled = false
) {
  (useStore as jest.Mock).mockReturnValue({
    getters: { 'backend-settings/getSettingByCompositeKey': () => settings }
  });

  return shallowMount(OMarketingConsent as any, {
    propsData: { value, disabled },
    mocks: { $t: (key: string) => key },
    stubs: {
      SfCheckbox: SfCheckboxStub,
      MPhoneInput: MPhoneInputStub
    }
  });
}

function phoneInput (wrapper: Wrapper<any>) {
  return wrapper.findComponent({ name: 'MPhoneInput' });
}

describe('marketing consent form', () => {
  const settings = {
    emailConsentLabel: 'Email <a href="/terms">terms</a>',
    smsConsentLabel: 'SMS',
    smsEnabled: true
  };

  it('renders nothing when no channel is offered', () => {
    const wrapper = mountForm(undefined);

    expect(wrapper.find('.o-marketing-consent').exists()).toBe(false);
  });

  it('renders only the offered checkboxes', () => {
    const wrapper = mountForm({
      emailConsentLabel: 'Email',
      smsConsentLabel: 'SMS',
      smsEnabled: false
    });

    expect(wrapper.findAll('.sf-checkbox__label')).toHaveLength(1);
    expect(wrapper.text()).toContain('Email');
  });

  it('restricts offered channels and keeps an unchecked phone optional', async () => {
    const wrapper = mountForm(settings);
    await wrapper.setProps({ channels: { email: false, sms: true }, alwaysShowPhone: true });
    expect(wrapper.findAll('.sf-checkbox__label')).toHaveLength(1);
    expect(phoneInput(wrapper).exists()).toBe(true);
    expect((wrapper.vm as any).validate()).toBe(true);
    await wrapper.setProps({ value: { ...EMPTY_VALUE, smsConsent: true } });
    expect((wrapper.vm as any).validate()).toBe(false);
    await wrapper.vm.$nextTick();
    expect(phoneInput(wrapper).props('showError')).toBe(true);
    await wrapper.setProps({ value: EMPTY_VALUE });
    expect(phoneInput(wrapper).props('showError')).toBe(false);
    await wrapper.setProps({ channels: { email: true, sms: false } });
    expect(phoneInput(wrapper).exists()).toBe(false);
  });

  it('renders the labels as html and shows the phone only for checked SMS', async () => {
    const wrapper = mountForm(settings);

    expect(wrapper.find('a[href="/terms"]').exists()).toBe(true);
    expect(wrapper.findAll('.sf-checkbox__label')).toHaveLength(2);
    expect(phoneInput(wrapper).exists()).toBe(false);

    await wrapper.setProps({ value: { ...EMPTY_VALUE, smsConsent: true } });

    expect(phoneInput(wrapper).exists()).toBe(true);
  });

  it('emits the whole value for every change and keeps the last valid phone for an empty one', () => {
    const value = {
      emailConsent: false,
      smsConsent: true,
      phone: '+14165550123'
    };
    const wrapper = mountForm(settings, value);

    wrapper.findAllComponents({ name: 'SfCheckbox' }).at(0).vm.$emit('change', true);
    phoneInput(wrapper).vm.$emit('input', '+12125550123');
    phoneInput(wrapper).vm.$emit('input', '');

    expect(wrapper.emitted('input')).toEqual([
      [{ ...value, emailConsent: true }],
      [{ ...value, phone: '+12125550123' }],
      [{ ...value }]
    ]);
  });

  it('validates the phone only while SMS is checked and shows the error until it is valid', async () => {
    const wrapper = mountForm(settings, { ...EMPTY_VALUE, smsConsent: true });
    const vm = wrapper.vm as any;

    expect(vm.validate()).toBe(false);

    await wrapper.vm.$nextTick();

    expect(phoneInput(wrapper).props('showError')).toBe(true);

    phoneInput(wrapper).vm.$emit('validity', true);
    await wrapper.vm.$nextTick();

    expect(phoneInput(wrapper).props('showError')).toBe(false);
    expect(vm.validate()).toBe(true);

    await wrapper.setProps({ value: EMPTY_VALUE });

    expect(vm.validate()).toBe(true);
  });

  it('focuses the phone input when validation fails', async () => {
    const wrapper = mountForm(settings, { ...EMPTY_VALUE, smsConsent: true });

    focusPhone.mockClear();
    (wrapper.vm as any).validate();
    await wrapper.vm.$nextTick();

    expect(focusPhone).toHaveBeenCalledTimes(1);
  });

  it('passes disabled to the phone input', () => {
    const enabled = mountForm(settings, { ...EMPTY_VALUE, smsConsent: true });
    const disabled = mountForm(settings, { ...EMPTY_VALUE, smsConsent: true }, true);

    expect(phoneInput(enabled).props('disabled')).toBe(false);
    expect(phoneInput(disabled).props('disabled')).toBe(true);
  });
});
