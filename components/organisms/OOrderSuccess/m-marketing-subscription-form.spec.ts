import { mount, shallowMount } from '@vue/test-utils';
import { ref } from 'vue';
import Form from './m-marketing-subscription-form.vue';

const dispatch = jest.fn();
const validate = jest.fn(() => true);
let mockSettings = { email: true, sms: true };
let mockPrivacyLinks: any[] = [];
jest.mock('@vue-storefront/core/application-services', () => ({
  useStore: () => ({ dispatch, getters: { 'backend-settings/getSettingByCompositeKey': () => ({ emailConsentLabel: 'Email', smsConsentLabel: 'SMS', smsEnabled: true }) } }), useI18n: () => ({ t: (key: string) => key })
}));
jest.mock('@vue-storefront/core/additional-content', () => ({
  AdditionalContentOutlet: { PRIVACY_POLICY_LINKS: 'privacy' }, useAdditionalContent: () => mockPrivacyLinks
}));
jest.mock('@vue-storefront/core/modules/cart/helpers', () => ({ notifications: { createNotification: (value: unknown) => value } }));
jest.mock('@storefront-ui/vue', () => ({
  SfButton: { name: 'SfButton', props: ['disabled'], render (h) { return h('button', { attrs: { disabled: this.disabled } }, this.$slots.default); } },
  SfCheckbox: { name: 'SfCheckbox', props: ['selected', 'disabled'], render (h) { return h('div', this.$slots.label); } },
  SfInput: { name: 'SfInput', props: ['value', 'disabled'], render (h) { return h('div', [h('input', { domProps: { value: this.value }, attrs: { disabled: this.disabled } })]); } }
}));
jest.mock('src/modules/checkout-marketing-consent', () => ({
  useMarketingConsentSettings: () => ({ settings: ref(mockSettings) }),
  remainingConsentChannels: (settings: typeof mockSettings, accepted: { email: boolean; sms: boolean }) => ({ email: settings.email && !accepted.email, sms: settings.sms && !accepted.sms }),
  SUBMIT_SUBSCRIPTION_ACTION: 'consent/submit'
}));

const control = {
  name: 'OMarketingConsent', props: ['value', 'channels', 'disabled'], methods: { validate }, template: '<div />'
};

function mountForm (props = {}) {
  return shallowMount(Form, {
    propsData: { orderId: '123', email: 'test@example.com', phone: '+14165550123', acceptedChannels: { email: false, sms: false }, ...props },
    mocks: { $t: (key: string) => key }, stubs: { OMarketingConsent: control }
  });
}

describe('order success marketing form', () => {
  beforeEach(() => { dispatch.mockReset(); validate.mockReset().mockReturnValue(true); mockSettings = { email: true, sms: true }; mockPrivacyLinks = []; });
  it('guards identity and remaining channels', () => {
    expect(mountForm({ orderId: '' }).find('form').exists()).toBe(false);
    expect(mountForm({ email: '' }).find('form').exists()).toBe(false);
    expect(mountForm({ acceptedChannels: { email: true, sms: true } }).find('form').exists()).toBe(false);
    expect(mountForm().find('form').attributes('novalidate')).toBeDefined();
    mockSettings = { email: false, sms: false };
    expect(mountForm().find('form').exists()).toBe(false);
  });
  it('renders the privacy outlet', () => {
    mockPrivacyLinks = [{ key: 'privacy', component: { name: 'PrivacyLink', render: h => h('a') } }];
    expect(mountForm().findComponent({ name: 'PrivacyLink' }).exists()).toBe(true);
  });
  it('sends shown choices and preserves the confirmation id', async () => {
    dispatch.mockResolvedValue(false);
    const wrapper = mountForm();
    wrapper.findComponent(control).vm.$emit('input', { emailConsent: true, smsConsent: false, phone: 'invalid' });
    await wrapper.vm.$nextTick();
    await wrapper.find('form').trigger('submit');
    await wrapper.vm.$nextTick();
    expect(dispatch).toHaveBeenCalledWith('consent/submit', { orderId: '123', email: 'test@example.com', emailConsent: true, smsConsent: false });
    expect(wrapper.text()).toContain('Thank you! Your subscription preferences have been saved.');
  });
  it('prevents empty and repeated submissions while disabling the controls', async () => {
    let finish: (value: boolean) => void = () => {};
    dispatch.mockReturnValue(new Promise(resolve => { finish = resolve; }));
    const wrapper = mountForm();
    expect(wrapper.findComponent({ name: 'SfButton' }).props('disabled')).toBe(true);
    await wrapper.find('form').trigger('submit');
    expect(dispatch).not.toHaveBeenCalled();
    wrapper.findComponent(control).vm.$emit('input', { emailConsent: true, smsConsent: false, phone: '' });
    await wrapper.vm.$nextTick();
    await wrapper.find('form').trigger('submit');
    expect(wrapper.findComponent(control).props('disabled')).toBe(true);
    expect(wrapper.findComponent({ name: 'SfButton' }).props('disabled')).toBe(true);
    await wrapper.find('form').trigger('submit');
    expect(dispatch).toHaveBeenCalledTimes(1);
    finish(true);
    await wrapper.vm.$nextTick();
  });
  it('preserves fields on failure', async () => {
    dispatch.mockRejectedValueOnce(new Error('failed')).mockResolvedValue(undefined);
    const wrapper = mountForm({ acceptedChannels: { email: true, sms: false } });
    wrapper.findComponent(control).vm.$emit('input', { emailConsent: false, smsConsent: true, phone: '+14165550123' });
    await wrapper.vm.$nextTick();
    await wrapper.find('form').trigger('submit');
    await wrapper.vm.$nextTick();
    expect(dispatch).toHaveBeenCalledWith('consent/submit', { orderId: '123', email: 'test@example.com', smsConsent: true, phone: '+14165550123' });
    expect(dispatch).toHaveBeenCalledWith('notification/spawnNotification', expect.objectContaining({ message: 'Something went wrong' }), { root: true });
    expect(wrapper.findComponent(control).props('value').phone).toBe('+14165550123');
  });

  it('submits a formatted billing prefill through the actual phone control', async () => {
    dispatch.mockResolvedValue(true);
    const wrapper = mount(Form, {
      propsData: { orderId: '123', email: 'test@example.com', phone: '+44 20 7946 0018', acceptedChannels: { email: true, sms: false } },
      mocks: { $t: (key: string) => key }
    });
    await wrapper.vm.$nextTick();
    wrapper.findComponent({ name: 'SfCheckbox' }).vm.$emit('change', true);
    await wrapper.vm.$nextTick();
    await wrapper.find('form').trigger('submit');
    await wrapper.vm.$nextTick();
    expect(dispatch).toHaveBeenCalledWith('consent/submit', { orderId: '123', email: 'test@example.com', smsConsent: true, phone: '+442079460018' });
  });

  it('keeps an unparseable billing phone and rejects checked SMS', async () => {
    const wrapper = mount(Form, {
      propsData: { orderId: '123', email: 'test@example.com', phone: 'not a phone', acceptedChannels: { email: true, sms: false } },
      mocks: { $t: (key: string) => key }
    });
    expect((wrapper.findComponent({ name: 'MPhoneInput' }).vm as any).text).toBe('not a phone');
    wrapper.findComponent({ name: 'SfCheckbox' }).vm.$emit('change', true);
    await wrapper.vm.$nextTick();
    await wrapper.find('form').trigger('submit');
    expect(dispatch).not.toHaveBeenCalled();
  });
  it('focuses the phone when checked SMS is submitted empty', async () => {
    const wrapper = mount(Form, {
      attachTo: document.body,
      propsData: { orderId: '123', email: 'test@example.com', phone: '', acceptedChannels: { email: true, sms: false } },
      mocks: { $t: (key: string) => key }
    });
    wrapper.findComponent({ name: 'SfCheckbox' }).vm.$emit('change', true);
    await wrapper.vm.$nextTick();
    await wrapper.find('form').trigger('submit');
    await wrapper.vm.$nextTick();
    expect(document.activeElement).toBe(wrapper.find('.phone-input__number input').element);
    expect(dispatch).not.toHaveBeenCalled();
    wrapper.destroy();
  });
});
