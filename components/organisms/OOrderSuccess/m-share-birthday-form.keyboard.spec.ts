import Vue from 'vue';
import Vuex from 'vuex';
import { mount } from '@vue/test-utils';
import Form from './m-share-birthday-form.vue';

jest.mock('vee-validate/dist/rules', () => jest.requireActual('vee-validate/dist/rules.umd.js'));
jest.mock('src/modules/budsies', () => ({
  getDaysInMonth: jest.requireActual('src/modules/budsies/helpers/get-days-in-month.function').getDaysInMonth
}));
jest.mock('@vue-storefront/core/additional-content', () => ({
  AdditionalContentOutlet: { PRIVACY_POLICY_LINKS: 'privacy' },
  useAdditionalContent: () => []
}));
jest.mock('@vue-storefront/core/modules/cart/helpers', () => ({
  notifications: { createNotification: (value) => value }
}));
jest.mock('@storefront-ui/vue', () => ({
  SfSelect: jest.requireActual('@storefront-ui/vue/src/components/molecules/SfSelect/SfSelect.vue').default,
  SfInput: { render (h) { return h('input'); } },
  SfButton: { render (h) { return h('button', this.$slots.default); } }
}));

Vue.use(Vuex);

describe('birthday form keyboard selection', () => {
  it('selects April 30 with End and Enter after January 31', async () => {
    const scrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = jest.fn();
    const wrapper = mount(Form, {
      store: new Vuex.Store({ state: { checkout: { personalDetails: {} } } }),
      mocks: { $t: (key: string) => key },
      propsData: { orderId: 123, email: 'order@example.com', addAnotherButtonText: 'Add another', topHelperText: 'Birthday', nameInputLabel: 'Name', submitButtonText: 'Add' }
    });

    try {
      const month = wrapper.findAll('[role="combobox"]').at(0);
      await month.trigger('keydown', { key: 'Enter', keyCode: 13 });
      await month.trigger('keydown', { key: 'ArrowDown', keyCode: 40 });
      await month.trigger('keydown', { key: 'Enter', keyCode: 13 });
      expect((wrapper.vm as any).birthMonth).toBe(1);

      let day = wrapper.findAll('[role="combobox"]').at(1);
      await day.trigger('keydown', { key: 'Enter', keyCode: 13 });
      await day.trigger('keydown', { key: 'End', keyCode: 35 });
      await day.trigger('keydown', { key: 'Enter', keyCode: 13 });
      expect((wrapper.vm as any).birthDay).toBe(31);

      await month.trigger('keydown', { key: 'Enter', keyCode: 13 });
      await month.trigger('keydown', { key: 'ArrowDown', keyCode: 40 });
      await month.trigger('keydown', { key: 'ArrowDown', keyCode: 40 });
      await month.trigger('keydown', { key: 'ArrowDown', keyCode: 40 });
      await month.trigger('keydown', { key: 'Enter', keyCode: 13 });
      expect((wrapper.vm as any).birthMonth).toBe(4);

      day = wrapper.findAll('[role="combobox"]').at(1);
      await day.trigger('keydown', { key: 'Enter', keyCode: 13 });
      await day.trigger('keydown', { key: 'End', keyCode: 35 });
      await day.trigger('keydown', { key: 'Enter', keyCode: 13 });
      expect((wrapper.vm as any).birthDay).toBe(30);
    } finally {
      wrapper.destroy();
      Element.prototype.scrollIntoView = scrollIntoView;
    }
  });
});
