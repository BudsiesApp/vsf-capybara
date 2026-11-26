import Vue from 'vue';
import Vuex from 'vuex';
import { mount } from '@vue/test-utils';
import Form from './m-share-birthday-form.vue';

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

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
  SfButton: {
    props: ['disabled'],
    render (h) { return h('button', { attrs: { disabled: this.disabled }, on: this.$listeners }, this.$slots.default); }
  },
  SfInput: {
    props: ['value', 'disabled'],
    render (h) { return h('input', { attrs: { disabled: this.disabled }, domProps: { value: this.value }, on: { input: (event) => this.$emit('input', event.target.value) } }); }
  },
  SfSelect: {
    name: 'SfSelect',
    model: { prop: 'selected', event: 'change' },
    props: ['selected', 'disabled', 'valid', 'errorMessage'],
    render (h) {
      return h('div', [
        h('select', { attrs: { disabled: this.disabled }, domProps: { value: this.selected }, on: { change: (event) => this.$emit('change', event.target.value === '' ? '' : Number(event.target.value)) } }, this.$slots.default),
        !this.valid && h('div', this.errorMessage)
      ]);
    }
  }
}));

Vue.use(Vuex);
Vue.component('SfSelectOption', {
  props: { value: { type: [String, Number], default: '' } },
  render (h) { return h('option', { domProps: { value: this.value } }, this.$slots.default); }
});

describe('birthday form', () => {
  let dispatch: jest.Mock;
  let wrapper: any;

  beforeEach(() => {
    const store = new Vuex.Store({ state: { checkout: { personalDetails: { emailAddress: 'checkout@example.com' } } } });
    dispatch = jest.fn().mockResolvedValue(undefined);
    store.dispatch = dispatch;
    wrapper = mount(Form, {
      store,
      mocks: { $t: (key: string) => key },
      propsData: { orderId: 123, email: 'order@example.com', addAnotherButtonText: 'Add another', topHelperText: 'Birthday', nameInputLabel: 'Name', submitButtonText: 'Add' }
    });
  });

  afterEach(() => wrapper.destroy());

  const select = (wrapper, index) => wrapper.findAll('select').at(index);
  const change = async (wrapper, index, value) => {
    await select(wrapper, index).setValue(String(value));
    await flushPromises();
  };
  const submit = async (wrapper) => {
    await wrapper.find('button[type="submit"]').trigger('click');
    await flushPromises();
    await Vue.nextTick();
  };
  const days = (wrapper) => select(wrapper, 1).findAll('option').wrappers.map((option) => option.text());

  it('updates the available days, retaining a valid day when returning to MM', async () => {
    const expectedDays = (count) => ['DD', ...Array.from({ length: count }, (_, index) => String(index + 1).padStart(2, '0'))];
    expect(days(wrapper)).toEqual(expectedDays(31));
    await change(wrapper, 0, 4);
    expect(days(wrapper)).toEqual(expectedDays(30));
    await change(wrapper, 0, 2);
    expect(days(wrapper)).toEqual(expectedDays(29));
    await change(wrapper, 0, 1);
    expect(days(wrapper)).toEqual(expectedDays(31));
    await change(wrapper, 1, 29);
    await change(wrapper, 0, '');
    expect(days(wrapper)).toEqual(expectedDays(31));
    expect((select(wrapper, 1).element as HTMLSelectElement).value).toBe('29');
  });

  it('clears invalid days, displays validation and blocks submission, but retains valid days', async () => {
    await wrapper.find('input').setValue('Rex');
    await change(wrapper, 0, 1);
    await change(wrapper, 1, 31);
    await change(wrapper, 0, 4);
    expect((select(wrapper, 1).element as HTMLSelectElement).value).toBe('');
    expect(wrapper.text()).toContain('Field is required');
    await submit(wrapper);
    expect(dispatch).not.toHaveBeenCalled();
    await change(wrapper, 0, 1);
    await change(wrapper, 1, 29);
    await change(wrapper, 0, 2);
    expect((select(wrapper, 1).element as HTMLSelectElement).value).toBe('29');
  });

  it('sends order props and reuses them after Add another', async () => {
    await wrapper.find('input').setValue('Rex');
    await change(wrapper, 0, 2);
    await change(wrapper, 1, 29);
    await submit(wrapper);
    expect(dispatch).toHaveBeenCalledWith('budsies/shareBirthday', { name: 'Rex', birthMonth: 2, birthDay: 29, email: 'order@example.com', orderId: 123 });
    expect(wrapper.text()).toContain('Thank You');
    await wrapper.find('button').trigger('click');
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('');
    expect(days(wrapper)).toHaveLength(32);
    await wrapper.find('input').setValue('Spot');
    await change(wrapper, 0, 1);
    await change(wrapper, 1, 3);
    await submit(wrapper);
    expect(dispatch).toHaveBeenLastCalledWith('budsies/shareBirthday', { name: 'Spot', birthMonth: 1, birthDay: 3, email: 'order@example.com', orderId: 123 });
  });

  it('retains the entered values and re-enables controls after rejection', async () => {
    dispatch.mockRejectedValueOnce(new Error('rejected'));
    await wrapper.find('input').setValue('Rex');
    await change(wrapper, 0, 2);
    await change(wrapper, 1, 29);
    await submit(wrapper);
    expect(dispatch).toHaveBeenCalledWith('notification/spawnNotification', expect.objectContaining({ message: 'Something went wrong' }), { root: true });
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('Rex');
    expect((select(wrapper, 0).element as HTMLSelectElement).value).toBe('2');
    expect((select(wrapper, 1).element as HTMLSelectElement).value).toBe('29');
    expect(wrapper.findAll('[disabled]')).toHaveLength(0);
    expect(wrapper.text()).not.toContain('Thank You');
  });
});
