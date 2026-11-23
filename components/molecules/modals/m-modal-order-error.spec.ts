import { mount } from '@vue/test-utils';
import { TaskQueue } from '@vue-storefront/core/lib/sync';

import { actions } from 'src/modules/budsies/store/actions';

import MModalOrderError from './m-modal-order-error.vue';

jest.mock('@vue-storefront/core/lib/sync', () => ({ TaskQueue: { execute: jest.fn() } }));
jest.mock('@vue-storefront/core/helpers', () => ({ processURLAddress: (url: string) => url }));
jest.mock('@vue-storefront/core/additional-content', () => ({
  AdditionalContentOutlet: { PRIVACY_POLICY_LINKS: 'privacy-policy-links' },
  useAdditionalContent: () => []
}));
jest.mock('@storefront-ui/vue', () => ({
  SfButton: { name: 'SfButton', render (h) { return h('button', this.$slots.default); } },
  SfInput: {
    name: 'SfInput',
    props: { value: String },
    render (h) { return h('input', { domProps: { value: this.value }, on: { input: e => this.$emit('input', e.target.value) } }); }
  },
  SfModal: { name: 'SfModal', render (h) { return h('div', this.$slots.default); } },
  SfHeading: { name: 'SfHeading', render (h) { return h('div'); } }
}));
jest.mock('@vue-storefront/i18n', () => ({ t: (key: string) => key }));
jest.mock('@vue-storefront/core/compatibility/plugins/event-bus', () => ({ __esModule: true, default: {} }));
jest.mock('src/modules/shared', () => ({}));
jest.mock('config', () => ({ budsies: { endpoint: 'https://api.example.test' } }));

const order = {
  personalDetails: { emailAddress: 'customer@example.test', firstName: 'Pat', lastName: 'Doe' }
};

function mountModal () {
  const dispatch = jest.fn((type: string, payload: any) => {
    return (actions as any).creditCardProcessingErrorNotifications({}, payload);
  });

  const wrapper = mount(MModalOrderError, {
    propsData: {
      isVisible: true,
      modalData: { name: 'modal-order-error', payload: { order, error: 'Card declined' } }
    },
    mocks: {
      $t: (key: string) => key,
      $store: { dispatch }
    }
  });

  return { wrapper, dispatch };
}

describe('MModalOrderError', () => {
  beforeEach(() => {
    (TaskQueue.execute as jest.Mock).mockReset();
  });

  it('does not ask for a phone number and promises an email reply', () => {
    const { wrapper } = mountModal();

    expect(wrapper.findAll('input')).toHaveLength(2);
    expect(wrapper.text()).not.toContain('Phone');
    expect(wrapper.text()).toContain('We\'ll look into your error and email you back with an alternate method of payment.');
  });

  it('sends the support request without a phone number and shows the confirmation', async () => {
    (TaskQueue.execute as jest.Mock).mockResolvedValue({ result: {}, resultCode: 200 });
    const { wrapper } = mountModal();

    await wrapper.find('form').trigger('submit');
    await new Promise(resolve => setTimeout(resolve));

    const task = (TaskQueue.execute as jest.Mock).mock.calls[0][0];
    expect(task.url).toContain('/order/creditcard-processing-error-notifications');
    expect(JSON.parse(task.payload.body)).toEqual({
      customerEmail: 'customer@example.test',
      customerName: 'Pat Doe',
      errorReason: 'Card declined'
    });
    expect(wrapper.text()).toContain('Thanks! Our support team will contact you soon');
  });

  it('keeps the form when the request fails', async () => {
    (TaskQueue.execute as jest.Mock).mockResolvedValue({ result: 'fail', resultCode: 500 });
    const { wrapper } = mountModal();

    await wrapper.find('form').trigger('submit');
    await new Promise(resolve => setTimeout(resolve));

    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.text()).not.toContain('Thanks!');
  });
});
