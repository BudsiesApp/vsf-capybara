import { mount } from '@vue/test-utils';

import CustomizationOption from './customization-option.vue';

let mockWidgetComponent = 'ImageUploadWidget';

jest.mock('vee-validate', () => ({
  ValidationProvider: { name: 'ValidationProvider', render (h) { return h('div', this.$scopedSlots.default({ errors: [] })); } }
}));
jest.mock('src/modules/customization-system', () => {
  const { computed, ref } = jest.requireActual('vue');
  return {
    WidgetType: { CHECKBOX: 'checkbox' },
    useCustomizationOptionValidation: () => ({
      validationRef: ref('photos'),
      validationRules: ref({}),
      isFieldRequired: ref(false)
    }),
    useCustomizationOptionWidget: () => ({
      maxValuesCount: ref(undefined),
      selectedOption: ref(undefined),
      useCompactSpacing: ref(false),
      widget: computed(() => ({ component: mockWidgetComponent, props: { productId: 7 } }))
    }),
    useWidgetBusyState: () => ({ onWidgetBusyChanged: jest.fn() })
  };
});
jest.mock('./widgets/image-upload-widget.vue', () => ({ name: 'ImageUploadWidget', props: ['appearance'], render: h => h('div', { class: 'image-widget' }) }));
jest.mock('./widgets/text-input-widget.vue', () => ({ name: 'TextInputWidget', render: h => h('div', { class: 'text-widget' }) }));
jest.mock('./widgets/cards-list-widget.vue', () => ({ name: 'CardsListWidget', render: h => h('div') }));
jest.mock('./widgets/checkbox-widget.vue', () => ({ name: 'CheckboxWidget', render: h => h('div') }));
jest.mock('./widgets/colors-list-widget.vue', () => ({ name: 'ColorsListWidget', render: h => h('div') }));
jest.mock('./widgets/dropdown-widget.vue', () => ({ name: 'DropdownWidget', render: h => h('div') }));
jest.mock('./widgets/search-field-widget.vue', () => ({ name: 'SearchFieldWidget', render: h => h('div') }));
jest.mock('./widgets/textarea-widget.vue', () => ({ name: 'TextAreaWidget', render: h => h('div') }));
jest.mock('./widgets/thumbnails-list-widget.vue', () => ({ name: 'ThumbnailsListWidget', render: h => h('div') }));
jest.mock('./widgets/production-time-timeline-widget.vue', () => ({ name: 'ProductionTimeTimelineWidget', render: h => h('div') }));

const customization = { id: 'photos', name: 'photos', title: 'Photos', optionData: { description: 'Configured help', hint: 'Configured hint' } };

function mountOption (propsData: Record<string, unknown> = {}) {
  return mount(CustomizationOption, { propsData: { productId: 7, customization, ...propsData } });
}

describe('customization option image upload appearance', () => {
  beforeEach(() => {
    mockWidgetComponent = 'ImageUploadWidget';
  });

  it('leaves the image widget appearance unset by default', () => {
    const wrapper = mountOption();
    expect(wrapper.findComponent({ name: 'ImageUploadWidget' }).props('appearance')).toBeUndefined();
  });

  it('forwards the opt-in appearance to the image widget only', () => {
    const wrapper = mountOption({ imageUploadAppearance: 'order-history' });
    expect(wrapper.findComponent({ name: 'ImageUploadWidget' }).props('appearance')).toBe('order-history');
  });

  it('does not forward the appearance to other widgets', () => {
    mockWidgetComponent = 'TextInputWidget';
    const wrapper = mountOption({ imageUploadAppearance: 'order-history' });
    const widget = wrapper.find('.text-widget');
    expect(widget.exists()).toBe(true);
    expect(widget.attributes('appearance')).toBeUndefined();
  });

  it('keeps the configured label, description and hint', () => {
    const wrapper = mountOption({ imageUploadAppearance: 'order-history' });
    expect(wrapper.find('._option-label').text()).toBe('Photos');
    expect(wrapper.find('._option-description').text()).toBe('Configured help');
    expect(wrapper.find('._option-hint').text()).toBe('Configured hint');
  });
});
