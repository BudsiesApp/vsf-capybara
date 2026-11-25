import { shallowMount } from '@vue/test-utils';
import OrderSuccess from './o-order-success.vue';

jest.mock('@vue-storefront/core/additional-content', () => ({
  AdditionalContentOutlet: { FINANCIAL_INCENTIVE_LINKS: 'financial' }, useAdditionalContent: () => []
}));
jest.mock('@vue-storefront/core/modules/checkout', () => ({ CHECKOUT_UPDATE_SUCCESS_ORDER_DATA_MUTATION: 'checkout/update' }));
jest.mock('src/modules/shared', () => ({}));
jest.mock('./OOrderSuccess/m-share-birthday-form.vue', () => ({}));
jest.mock('./OOrderSuccess/m-share-special-story-form.vue', () => ({}));
jest.mock('./OOrderSuccess/m-marketing-subscription-form.vue', () => ({
  name: 'MMarketingSubscriptionForm', props: ['orderId', 'email', 'phone', 'acceptedChannels']
}));
jest.mock('theme/components/molecules/m-social-sharing.vue', () => ({}));
jest.mock('src/modules/checkout-marketing-consent', () => ({
  acceptedOrderChannels: () => ({ email: true, sms: false })
}));
jest.mock('src/modules/budsies', () => ({ BaseImage: {} }));
jest.mock('@storefront-ui/vue', () => ({ SfButton: {}, SfHeading: {} }));

it('mounts the order subscription form before the numbered sections', () => {
  const order = {
    personalDetails: { emailAddress: 'test@example.com', firstName: 'Test', lastName: 'Person' },
    addressInformation: { billingAddress: { telephone: '+12125550123' }, paymentExtraFields: { budsies_marketing_consent: { email: true } } }
  };
  const wrapper = shallowMount(OrderSuccess, {
    propsData: { confirmation: { magentoOrderId: '123' }, order },
    mocks: { $t: (key: string) => key, $store: { commit: jest.fn() } },
    provide: { WindowObject: {} },
    stubs: { SfHeading: { render: h => h('h1') } }
  });
  const form = wrapper.findComponent({ name: 'MMarketingSubscriptionForm' });
  expect(form.props()).toEqual(expect.objectContaining({ orderId: '123', email: 'test@example.com', phone: '+12125550123', acceptedChannels: { email: true, sms: false } }));
  expect(wrapper.html().indexOf('m-marketing-subscription-form-stub')).toBeLessThan(wrapper.html().indexOf('class="_content"'));
});
