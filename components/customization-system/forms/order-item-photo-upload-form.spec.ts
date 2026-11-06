import { readFileSync } from 'fs';
import { join } from 'path';

import { mount, Wrapper } from '@vue/test-utils';

import {
  i18nInjectionKey,
  storeInjectionKey
} from '@vue-storefront/core/application-services';
import {
  fetchOrderItemCustomizationsState,
  saveOrderItemCustomizationsState,
  submitOrderItemCustomizationsState
} from 'src/modules/customization-system';

import OrderItemPhotoUploadForm from './order-item-photo-upload-form.vue';

jest.mock('@vue-storefront/core/lib/logger', () => ({ Logger: { error: jest.fn(() => jest.fn()) } }));
jest.mock('@storefront-ui/vue', () => ({
  SfButton: {
    name: 'SfButton',
    props: { disabled: Boolean },
    render (h) {
      return h('button', { attrs: { disabled: this.disabled }, on: { click: () => this.$emit('click') } }, this.$slots.default);
    }
  },
  SfIcon: { name: 'SfIcon', render (h) { return h('span', { class: 'sf-icon' }, this.$slots.default); } }
}));
jest.mock('theme/components/molecules/m-spinner-button.vue', () => ({
  name: 'MSpinnerButton',
  props: { disabled: Boolean, showSpinner: Boolean },
  render (h) {
    return h('button', {
      class: { '-spinner': this.showSpinner },
      attrs: { disabled: this.disabled || this.showSpinner },
      on: { click: () => this.$emit('click') }
    }, this.$slots.default);
  }
}));
jest.mock('theme/components/customization-system/customization-option.vue', () => ({
  name: 'CustomizationOption',
  props: ['productId', 'customization', 'value', 'fieldNamePrefix', 'isDisabled', 'imageUploadAppearance'],
  render: h => h('div', { class: 'option' })
}));
jest.mock('vee-validate', () => ({
  ValidationObserver: { name: 'ValidationObserver', methods: { validate: () => Promise.resolve(true) }, render (h) { return h('div', this.$slots.default); } }
}));
jest.mock('src/modules/customization-system', () => ({
  ...jest.requireMock('src/modules/customization-system/helpers/order-items-customizations.service'),
  ...jest.requireActual('src/modules/customization-system/composables/use-customization-state'),
  ...jest.requireActual('src/modules/customization-system/composables/use-entity-busy-state'),
  ...jest.requireActual('src/modules/customization-system/helpers/filter-customization-state'),
  ...jest.requireActual('src/modules/customization-system/types/widget-type'),
  ...jest.requireActual('src/modules/customization-system/types/customization-availability-flow.type')
}));
jest.mock('src/modules/customization-system/helpers/order-items-customizations.service', () => ({
  fetchOrderItemCustomizationsState: jest.fn(),
  saveOrderItemCustomizationsState: jest.fn(),
  submitOrderItemCustomizationsState: jest.fn()
}));

const save = saveOrderItemCustomizationsState as jest.Mock;
const submit = submitOrderItemCustomizationsState as jest.Mock;
const eligible = { id: 'photos', isLocked: false, optionData: { displayWidget: 'image_upload' }, flowAvailability: ['customize-later-completion'] };
const saved = { id: 'saved', url: '/saved.jpg' };
const second = { id: 'second', url: '/second.jpg' };
const third = { id: 'third', url: '/third.jpg' };
const flush = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };
const dispatch = jest.fn((action: string) => Promise.resolve(action === 'product/loadProduct' ? { id: 7, customizations: [eligible] } : undefined));

type FormWrapper = Wrapper<Vue>;

const wrappers: FormWrapper[] = [];

async function mountForm (scopedSlots?: Record<string, string>): Promise<FormWrapper> {
  const wrapper = mount(OrderItemPhotoUploadForm, {
    attachTo: document.body,
    propsData: { orderItemId: 42, productSku: 'pet' },
    mocks: { $t: (key: string, params?: { count: number }) => params ? key.replace('{count}', String(params.count)) : key },
    scopedSlots,
    provide: {
      [i18nInjectionKey as symbol]: { t: (key: string, params?: { count: number }) => params ? key.replace('{count}', String(params.count)) : key },
      [storeInjectionKey as symbol]: { dispatch, getters: { 'user/getUserToken': 'token' } }
    }
  });
  wrappers.push(wrapper);
  await flush();
  return wrapper;
}

function option (wrapper: FormWrapper) {
  return wrapper.findComponent({ name: 'CustomizationOption' });
}

async function selectPhotos (wrapper: FormWrapper, value: unknown) {
  option(wrapper).vm.$emit('input', { customizationId: 'photos', value });
  await wrapper.vm.$nextTick();
}

function status (wrapper: FormWrapper): string {
  return wrapper.find('._status').text();
}

beforeEach(() => {
  jest.clearAllMocks();
  (fetchOrderItemCustomizationsState as jest.Mock).mockResolvedValue({
    id: 42,
    status_id: 1,
    customization_state: [{ customization_id: 'photos', value: [saved] }]
  });
  save.mockResolvedValue({ errors: [] });
  submit.mockResolvedValue({ errors: [] });
});

afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.destroy());
});

describe('order item photo upload form', () => {
  it('renders nothing and reports not ready until the draft is loaded', async () => {
    const wrapper = mount(OrderItemPhotoUploadForm, {
      propsData: { orderItemId: 42, productSku: 'pet' },
      mocks: { $t: (key: string) => key },
      provide: {
        [i18nInjectionKey as symbol]: { t: (key: string) => key },
        [storeInjectionKey as symbol]: { dispatch: jest.fn(() => new Promise(() => undefined)), getters: {} }
      }
    });
    expect(wrapper.find('.order-item-photo-upload-form').exists()).toBe(false);
    expect(wrapper.emitted('ready-changed')).toEqual([[false]]);
    wrapper.destroy();
  });

  it('starts as one contained header with one opening action and no editor controls', async () => {
    const wrapper = await mountForm();
    expect(wrapper.emitted('ready-changed')).toEqual([[false], [true]]);
    expect(wrapper.findAll('._header')).toHaveLength(1);
    expect(wrapper.find('._title').text()).toBe('Photos needed');
    expect(wrapper.text().split("We're waiting for your photos. Please upload them here or send them by email.")).toHaveLength(2);
    const openButton = wrapper.find('._open-button');
    expect(openButton.text()).toBe('Upload photos');
    expect(openButton.attributes('aria-expanded')).toBe('false');
    expect(openButton.attributes('aria-controls')).toBe(wrapper.find('._collapsible').attributes('id'));
    expect(wrapper.find('._header-icon svg').exists()).toBe(true);
    expect(wrapper.find('._submit-button').exists()).toBe(false);
    expect(wrapper.find('._cancel-button').exists()).toBe(false);
    expect(option(wrapper).exists()).toBe(false);
  });

  it('opens one configured option with the order history appearance and the submit-first action row', async () => {
    const wrapper = await mountForm();
    await wrapper.find('._open-button').trigger('click');
    await flush();

    expect(wrapper.findAllComponents({ name: 'CustomizationOption' })).toHaveLength(1);
    expect(option(wrapper).props()).toMatchObject({
      productId: 7,
      fieldNamePrefix: '42',
      isDisabled: false,
      imageUploadAppearance: 'order-history',
      value: [saved]
    });
    expect(wrapper.find('._open-button').attributes('aria-expanded')).toBe('true');
    expect(wrapper.find('[role="region"]').attributes('aria-labelledby')).toBe(wrapper.find('._title').attributes('id'));
    expect(document.activeElement).toBe(wrapper.find('._body').element);

    const buttons = wrapper.findAll('._actions > button');
    expect(buttons.wrappers.map(button => button.text())).toEqual(['Submit photos', 'Cancel']);
    expect(buttons.at(0).classes()).toContain('_submit-button');
    expect(buttons.at(1).classes()).toContain('_cancel-button');
    expect(wrapper.text()).not.toContain('Discard');
    expect(wrapper.find('._actions').element.contains(wrapper.find('._status').element)).toBe(false);
  });

  it.each([
    [[], 'Choose photos to submit.'],
    [[saved], '1 photo selected'],
    [[saved, second], '2 photos selected'],
    [[saved, second, third], '3 photos selected']
  ])('keeps the same action nodes for %j photos and shows %s', async (photos, message) => {
    const wrapper = await mountForm();
    await wrapper.find('._open-button').trigger('click');
    const actions = wrapper.find('._actions').element;
    const classes = wrapper.findAll('._actions > button').wrappers.map(button => button.classes());

    await selectPhotos(wrapper, photos);

    expect(status(wrapper)).toBe(message);
    expect(wrapper.find('._actions').element).toBe(actions);
    expect(wrapper.findAll('._actions > button').wrappers.map(button => button.classes())).toEqual(classes);
    expect(wrapper.findAll('._actions > button').wrappers.map(button => button.text())).toEqual(['Submit photos', 'Cancel']);
    expect(wrapper.find('._submit-button').attributes('disabled')).toBe(photos.length ? undefined : 'disabled');
  });

  it('counts a scalar single-image value as one photo', async () => {
    const wrapper = await mountForm();
    await wrapper.find('._open-button').trigger('click');
    await selectPhotos(wrapper, saved);
    expect(status(wrapper)).toBe('1 photo selected');
  });

  it('blocks submit and cancel while an upload is busy and shows the uploading status', async () => {
    const wrapper = await mountForm();
    await wrapper.find('._open-button').trigger('click');
    option(wrapper).vm.$emit('customization-option-busy-state-changed', { entityId: 'photos', isBusy: true });
    await wrapper.vm.$nextTick();

    expect(status(wrapper)).toBe('Uploading photos...');
    expect(wrapper.find('._submit-button').attributes('disabled')).toBe('disabled');
    expect(wrapper.find('._cancel-button').attributes('disabled')).toBe('disabled');
    await wrapper.find('._submit-button').trigger('click');
    await wrapper.find('._cancel-button').trigger('click');
    await flush();
    expect(save).not.toHaveBeenCalled();
    expect(option(wrapper).exists()).toBe(true);
    expect(wrapper.find('._open-button').attributes('aria-expanded')).toBe('true');
  });

  it('restores the saved photos on cancel, remounts them on reopening and returns focus to the opening action', async () => {
    const wrapper = await mountForm();
    await wrapper.find('._open-button').trigger('click');
    await selectPhotos(wrapper, [second]);
    expect(status(wrapper)).toBe('1 photo selected');
    await selectPhotos(wrapper, []);

    await wrapper.find('._cancel-button').trigger('click');
    await flush();
    expect(option(wrapper).exists()).toBe(false);
    expect(wrapper.find('._open-button').attributes('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(wrapper.find('._open-button').element);

    await wrapper.find('._open-button').trigger('click');
    await flush();
    expect(option(wrapper).props('value')).toEqual([saved]);
    expect(status(wrapper)).toBe('1 photo selected');
  });

  it('keeps the editor and the selection after a failed submit and shows one inline error outside the actions', async () => {
    submit.mockResolvedValueOnce({ errors: [{ errorMessage: 'failed' }] });
    const wrapper = await mountForm();
    await wrapper.find('._open-button').trigger('click');
    await selectPhotos(wrapper, [saved, second]);
    await wrapper.find('._submit-button').trigger('click');
    await flush();

    expect(option(wrapper).exists()).toBe(true);
    expect(option(wrapper).props('value')).toEqual([saved, second]);
    expect(status(wrapper)).toBe('Something went wrong. Please try again.');
    expect(wrapper.find('._status').classes()).toContain('-error');
    expect(wrapper.find('._actions').text()).not.toContain('Something went wrong');
    expect(wrapper.find('._submit-button').text()).toBe('Submit photos');
    expect(wrapper.find('._submit-button').attributes('disabled')).toBeUndefined();
    expect(dispatch).not.toHaveBeenCalledWith('notification/spawnNotification', expect.anything());
    expect(wrapper.emitted('submitted')).toBeUndefined();
  });

  it('blocks a second activation while the submission is pending', async () => {
    let finishSave: (value: unknown) => void;
    save.mockImplementationOnce(() => new Promise(resolve => { finishSave = resolve; }));
    const wrapper = await mountForm();
    await wrapper.find('._open-button').trigger('click');
    await wrapper.find('._submit-button').trigger('click');
    await flush();

    expect(status(wrapper)).toBe('Submitting your photos...');
    expect(wrapper.find('._submit-button').classes()).toContain('-spinner');
    expect(wrapper.find('._cancel-button').attributes('disabled')).toBe('disabled');
    expect(option(wrapper).props('isDisabled')).toBe(true);
    await wrapper.find('._submit-button').trigger('click');
    expect(save).toHaveBeenCalledTimes(1);

    finishSave({ errors: [] });
    await flush();
    expect(save).toHaveBeenCalledTimes(1);
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it('replaces every editing control with the confirmation after success and focuses it', async () => {
    const wrapper = await mountForm();
    await wrapper.find('._open-button').trigger('click');
    await wrapper.find('._submit-button').trigger('click');
    await flush();

    expect(wrapper.emitted('submitted')).toHaveLength(1);
    expect(wrapper.find('._submitted').text()).toBe('Your photos have been submitted.');
    expect(wrapper.find('._header').exists()).toBe(false);
    expect(wrapper.find('._open-button').exists()).toBe(false);
    expect(wrapper.find('._submit-button').exists()).toBe(false);
    expect(wrapper.find('._cancel-button').exists()).toBe(false);
    expect(wrapper.find('._status').exists()).toBe(false);
    expect(wrapper.findAll('button')).toHaveLength(0);
    expect(wrapper.text()).not.toContain("We're waiting for your photos.");
    expect(document.activeElement).toBe(wrapper.find('._submitted').element);
  });

  it('shows the alternative action slot only before submission', async () => {
    const wrapper = await mountForm({
      'alternative-action': '<a href="https://example.test/send">Send</a>'
    });
    expect(wrapper.find('._alternative-action').exists()).toBe(true);
    await wrapper.find('._open-button').trigger('click');
    await wrapper.find('._submit-button').trigger('click');
    await flush();
    expect(wrapper.find('._alternative-action').exists()).toBe(false);
  });

  it('has no alternative action wrapper without a slot', async () => {
    const wrapper = await mountForm();
    expect(wrapper.find('._alternative-action').exists()).toBe(false);
  });

  describe('responsive contract', () => {
    const source = readFileSync(join(__dirname, 'order-item-photo-upload-form.vue'), 'utf8');
    const scopedStyle = (source.match(/<style lang="scss" scoped>([\s\S]*?)<\/style>/) || [])[1] || '';
    const containerStyle = (source.match(/<style lang="scss">([\s\S]*?)<\/style>/) || [])[1] || '';

    it('renders one header and one action row, in a fixed child order, for every width', async () => {
      const addListener = jest.spyOn(window, 'addEventListener');
      const wrapper = await mountForm();
      await wrapper.find('._open-button').trigger('click');

      expect(Array.from(wrapper.find('._header').element.children).map(child => child.className.split(' ')[0])).toEqual([
        '_header-icon',
        '_header-text',
        '_button'
      ]);
      expect(wrapper.findAll('._header')).toHaveLength(1);
      expect(wrapper.findAll('._actions')).toHaveLength(1);
      expect(wrapper.findAll('._open-button')).toHaveLength(1);
      expect(addListener.mock.calls.filter(([type]) => type === 'resize')).toHaveLength(0);
      addListener.mockRestore();
    });

    it('sizes the layout from the form container, not the viewport', () => {
      expect(scopedStyle).toMatch(/container:\s*photo-upload-form\s*\/\s*inline-size/);
      expect(scopedStyle).not.toMatch(/@media/);
      expect(containerStyle).not.toMatch(/@media/);
      expect(containerStyle.match(/@container photo-upload-form \(/g)).toHaveLength(2);
    });

    it('lets the unscoped container rules set only custom properties that the scoped styles read with a fallback', () => {
      const declarations = containerStyle.match(/[^{};\s][^{};]*:[^{};]*;/g) || [];
      const properties = declarations.map(declaration => declaration.split(':')[0].trim());
      expect(properties.length).toBeGreaterThan(0);
      expect(properties.every(property => property.startsWith('--photo-form-'))).toBe(true);
      for (const property of new Set(properties)) {
        expect(scopedStyle).toContain(`var(${property},`);
      }
    });

    it('wraps the action row instead of clipping it when container queries are unavailable', () => {
      expect(scopedStyle).toMatch(/\._actions\s*\{[^}]*flex-wrap:\s*wrap/);
    });
  });
});
