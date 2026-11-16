import Vue, { computed, defineComponent, h, reactive, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { createRenderer } from 'vue-server-renderer';
import Widget from './production-time-timeline-widget.vue';
import { useCustomizationStatePreservation } from 'src/modules/customization-system/composables/use-customization-state-preservation';

const mockGetCookie = jest.fn();
let mockStore;
const mockDraftStorage = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() };
jest.mock('@vue-storefront/core/lib/storage-manager', () => ({ StorageManager: { get: () => mockDraftStorage } }));
jest.mock('@vue-storefront/core/lib/logger', () => ({ Logger: { error: () => () => {} } }));
jest.mock('@vue-storefront/core/application-services', () => ({ useStore: () => mockStore }));
jest.mock('@vue-storefront/core/request-services', () => ({ useRequestServices: () => ({ getCookie: mockGetCookie }) }));
jest.mock('src/modules/persisted-customer-data', () => ({ PERSISTED_CUSTOMER_SHIPPING_COUNTRY: 'persisted/country', PERSISTED_CUSTOMER_SHIPPING_COUNTRY_SETTLED: 'persisted/settled' }));
jest.mock('theme/helpers/use-error-accessibility', () => ({ useErrorAccessibility: () => ({ ariaDescribedby: undefined, ariaInvalid: undefined, errorMessageId: 'error' }) }));
jest.mock('../production-time-option-card.vue', () => ({ name: 'ProductionTimeOptionCard', render (h) { return h('span', this.optionName); }, props: ['optionName', 'price', 'slotsLeft'] }));
jest.mock('src/modules/customization-system', () => {
  const { computed } = require('vue');
  const location = require('src/modules/customization-system/composables/use-holiday-delivery-location');
  return {
    ...location,
    ListWidgetInputType: require('src/modules/customization-system/types/list-widget-input-type').ListWidgetInputType,
    PRODUCTION_TIME_SELECTOR_STANDARD_OPTION_VALUE_ID: 'standard',
    useListWidget: require('src/modules/customization-system/composables/use-list-widget').useListWidget,
    useOptionValuesPrice: values => ({ optionValuePriceDictionary: computed(() => Object.fromEntries(values.value.map(value => [value.id, value.testPrice || { regular: 0, special: null }]))) })
  };
});

describe('production time Holiday loading', () => {
  beforeEach(() => {
    Vue.prototype.$t = key => key;
    mockGetCookie.mockReset().mockReturnValue('FR');
    mockStore = { getters: reactive({
      'persisted/country': undefined,
      'persisted/settled': false,
      'budsies/getProductRushAddons': () => [
        { id: '', isDomestic: true, text: 'US standard', turnaroundTime: 10 },
        { id: '', isDomestic: false, text: 'International standard', turnaroundTime: 10 }
      ]
    }) };
  });
  afterEach(() => { delete Vue.prototype.$t; });
  const propsData = { isHolidayPeriod: true, productId: 1, maxValuesCount: 1, values: [{ id: 'standard', sn: 0 }], restorationSettled: false };
  const mocks = { $t: key => key };

  it('renders neutral on SSR, waits for country, then supports a manual location change', async () => {
    const html = await createRenderer().renderToString(new Vue({ render: h => h(Widget, { props: propsData }) }));
    expect(html).toContain('Loading delivery options');
    expect(html).not.toMatch(/International|United States|<input|<button/);
    expect(mockGetCookie).not.toHaveBeenCalled();
    const wrapper = mount(Widget, { propsData, mocks });
    expect(wrapper.text()).toContain('Loading delivery options');
    expect(wrapper.find('button').exists()).toBe(false);
    expect(wrapper.emitted('input')).toBeUndefined();
    mockStore.getters['persisted/settled'] = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.find('button').exists()).toBe(false);
    expect(wrapper.find('input').exists()).toBe(false);
    expect(wrapper.attributes('aria-busy')).toBe('true');
    expect(wrapper.emitted('input')).toBeUndefined();
    await wrapper.setProps({ restorationSettled: true });
    expect(wrapper.text()).toContain('International');
    expect(wrapper.emitted('input')).toEqual([['standard']]);
    await wrapper.find('button').trigger('click');
    expect(wrapper.text()).toContain('United States');
    wrapper.destroy();
  });

  it('hydrates the actual server markup without replacing it or exposing controls while pending', async () => {
    const hydrationProps = { ...propsData, restorationSettled: true };
    const html = await createRenderer().renderToString(new Vue({ render: h => h(Widget, { props: hydrationProps }) }));
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const original = container.firstChild;
    const app = new Vue({ render: h => h(Widget, { props: hydrationProps }) });
    app.$mount(original as Element, true);
    expect(app.$el).toBe(original);
    expect(app.$el.textContent).toContain('Loading delivery options');
    expect(app.$el.querySelector('input,button')).toBeNull();
    mockStore.getters['persisted/settled'] = true;
    await Vue.nextTick();
    expect(app.$el.textContent).toContain('International');
    app.$destroy();
    container.remove();
  });

  it('retains a shared Rush across locations and falls back only when invalid', async () => {
    mockStore.getters['budsies/getProductRushAddons'] = () => [
      { id: '', isDomestic: true, text: 'US standard', turnaroundTime: 10 },
      { id: '', isDomestic: false, text: 'International standard', turnaroundTime: 10 },
      { id: 'shared', isDomestic: true, text: 'US rush', turnaroundTime: 3 },
      { id: 'shared', isDomestic: false, text: 'International rush', turnaroundTime: 4 },
      { id: 'domestic', isDomestic: true, text: 'US only', turnaroundTime: 2 }
    ];
    mockStore.getters['persisted/settled'] = true;
    const values = [{ id: 'standard', sn: 0 }, { id: 'shared-id', sku: 'shared', sn: 1 }, { id: 'domestic-id', sku: 'domestic', sn: 2 }];
    const wrapper = mount(Widget, { propsData: { ...propsData, values, value: 'shared-id', restorationSettled: true }, mocks });
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('International rush');
    expect(wrapper.emitted('input')).toBeUndefined();
    await wrapper.find('button').trigger('click');
    expect(wrapper.text()).toContain('US rush');
    expect(wrapper.emitted('input')).toBeUndefined();
    await wrapper.setProps({ value: 'domestic-id' });
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('input')).toEqual([['standard']]);
    wrapper.destroy();
  });

  it('reports only country/restoration readiness when a product form opts in', async () => {
    const wrapper = mount(Widget, { propsData: { ...propsData, reportReadinessBusy: true }, mocks });
    expect(wrapper.emitted('widget-busy-changed').slice(-1)).toEqual([[true]]);
    mockStore.getters['persisted/settled'] = true;
    await Vue.nextTick();
    expect(wrapper.emitted('widget-busy-changed').slice(-1)).toEqual([[true]]);
    await wrapper.setProps({ restorationSettled: true });
    expect(wrapper.emitted('widget-busy-changed').slice(-1)).toEqual([[false]]);
    wrapper.destroy();
  });

  it('does not report readiness busy to shared consumers by default', async () => {
    const wrapper = mount(Widget, { propsData, mocks });
    await Vue.nextTick();
    expect(wrapper.emitted('widget-busy-changed')).toBeUndefined();
    wrapper.destroy();
  });

  it('does not require a new restoration prop from existing direct widget consumers', async () => {
    mockStore.getters['persisted/settled'] = true;
    const wrapper = mount(Widget, { propsData: { isHolidayPeriod: true, productId: 1, maxValuesCount: 1, values: [{ id: 'standard', sn: 0 }] }, mocks });
    await Vue.nextTick();
    expect(wrapper.text()).not.toContain('Loading delivery options');
    expect(wrapper.find('input').exists()).toBe(true);
    wrapper.destroy();
  });

  it.each(['country-first', 'draft-first'])('waits for restoration and location in %s order', async order => {
    let complete;
    mockDraftStorage.getItem.mockImplementation((_key, callback) => { complete = callback; return new Promise(() => {}); });
    mockDraftStorage.setItem.mockReset().mockResolvedValue(undefined);
    const addons = [
      { id: '', isDomestic: false, text: 'International standard', turnaroundTime: 10 },
      { id: 'rush', isDomestic: false, text: 'International rush', turnaroundTime: 3 }
    ];
    mockStore.getters['budsies/getProductRushAddons'] = () => addons;
    const state = ref<any[]>([]);
    const inputs = jest.fn();
    const Form = defineComponent({
      setup () {
        const owner = useCustomizationStatePreservation(ref('synthetic-product'), state, ref(undefined), [], ref(true), value => { state.value = value; }, () => ({}));
        return () => h('form', [h(Widget, {
          props: { ...propsData, values: [{ id: 'standard', sn: 0 }, { id: 'rush-id', sku: 'rush', sn: 1 }], value: state.value[0]?.value, restorationSettled: owner.restorationSettled.value },
          on: { input: value => { inputs(value); state.value = [{ customization_id: 'production', value }]; } }
        })]);
      }
    });
    const wrapper = mount(Form, { mocks });
    for (let i = 0; i < 10; i++) await Promise.resolve();
    if (order === 'country-first') {
      mockStore.getters['persisted/settled'] = true;
      await Vue.nextTick();
      expect(inputs).not.toHaveBeenCalled();
    }
    complete(null, { customizationState: [{ customization_id: 'production', value: 'rush-id' }] });
    for (let i = 0; i < 10; i++) await Promise.resolve();
    await Vue.nextTick();
    if (order === 'draft-first') {
      expect(inputs).not.toHaveBeenCalled();
      mockStore.getters['persisted/settled'] = true;
    }
    await Vue.nextTick();
    await Vue.nextTick();
    expect(state.value[0].value).toBe('rush-id');
    expect(inputs).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('International rush');
    wrapper.destroy();
  });

  it('defaults and saves normally after ambiguous draft absence', async () => {
    let complete;
    mockDraftStorage.getItem.mockImplementation((_key, callback) => { complete = callback; return new Promise(() => {}); });
    mockDraftStorage.setItem.mockReset().mockResolvedValue(undefined);
    mockStore.getters['persisted/settled'] = true;
    const state = ref<any[]>([]);
    const Form = defineComponent({
      setup () {
        const owner = useCustomizationStatePreservation(ref('synthetic-product'), state, ref(undefined), [], ref(true), value => { state.value = value; }, () => ({}));
        return () => h('form', [h(Widget, {
          props: { ...propsData, value: state.value[0]?.value, restorationSettled: owner.restorationSettled.value },
          on: { input: value => { state.value = [{ customization_id: 'production', value }]; } }
        })]);
      }
    });
    const wrapper = mount(Form, { mocks });
    for (let i = 0; i < 10; i++) await Promise.resolve();
    expect(state.value).toEqual([]);
    expect(mockDraftStorage.setItem).not.toHaveBeenCalled();
    complete(null, null);
    for (let i = 0; i < 15; i++) await Promise.resolve();
    await Vue.nextTick();
    expect(state.value[0].value).toBe('standard');
    expect(mockDraftStorage.setItem).toHaveBeenCalledWith('form-state/synthetic-product', expect.objectContaining({ customizationState: state.value }));
    wrapper.destroy();
  });

  it('does not reconcile temporarily empty options and leaves regular mode independent of location', async () => {
    mockStore.getters['persisted/settled'] = true;
    const holiday = mount(Widget, { propsData: { ...propsData, values: [], value: 'rush-id', restorationSettled: true }, mocks });
    await Vue.nextTick();
    expect(holiday.emitted('input')).toBeUndefined();
    holiday.destroy();
    mockStore.getters['persisted/settled'] = false;
    const regular = mount(Widget, { propsData: { ...propsData, isHolidayPeriod: false, value: 'standard' }, mocks });
    expect(regular.find('input').exists()).toBe(true);
    expect(regular.text()).not.toContain('Loading delivery options');
    expect(regular.emitted('input')).toBeUndefined();
    regular.destroy();
  });

  it('keeps prices, ordering, availability and emitted option IDs in the responsive controls', async () => {
    mockStore.getters['persisted/settled'] = true;
    mockStore.getters['budsies/getProductRushAddons'] = () => [
      { id: '', isDomestic: false, text: 'Standard', turnaroundTime: 10 },
      { id: 'rush', isDomestic: false, text: 'Rush', turnaroundTime: 5, slotsLeft: 5 },
      { id: 'fast', isDomestic: false, text: 'Fast', turnaroundTime: 2, slotsLeft: 0 }
    ];
    const values = [
      { id: 'fast-id', sku: 'fast', sn: 0, testPrice: { regular: 99, special: null } },
      { id: 'standard', sn: 2, testPrice: { regular: 0, special: null } },
      { id: 'rush-id', sku: 'rush', sn: 1, testPrice: { regular: 45, special: 35 } }
    ];
    const wrapper = mount(Widget, { propsData: { ...propsData, values, radioGroupName: 'production-time', restorationSettled: true, value: 'standard' }, mocks });
    await Vue.nextTick();
    const inputs = wrapper.findAll('input');
    expect(inputs.wrappers.map(input => (input.element as HTMLInputElement).value)).toEqual(['standard', 'rush-id', 'fast-id']);
    expect(inputs.wrappers.every(input => input.attributes('name') === 'production-time')).toBe(true);
    expect((inputs.at(2).element as HTMLInputElement).disabled).toBe(true);
    const cards = wrapper.findAllComponents({ name: 'ProductionTimeOptionCard' });
    expect(cards.at(1).props('price')).toEqual({ regular: 45, special: 35 });
    expect(cards.at(2).props('slotsLeft')).toBe(0);
    await inputs.at(1).setChecked();
    expect(wrapper.emitted('input')).toEqual([['rush-id']]);
    expect(wrapper.find('._options-list').exists()).toBe(true);
    wrapper.destroy();
  });

  it.each([375, 1280])('keeps the same usable controls at viewport width %s', async width => {
    const previousWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
    try {
      mockStore.getters['persisted/settled'] = true;
      const wrapper = mount(Widget, { propsData: { ...propsData, restorationSettled: true }, mocks });
      await Vue.nextTick();
      expect(wrapper.find('button').exists()).toBe(true);
      expect(wrapper.find('input').attributes('type')).toBe('radio');
      wrapper.destroy();
    } finally {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: previousWidth });
    }
  });

  it('retains the mobile grid and desktop flex breakpoint in the compiled stylesheet', () => {
    const fs = require('fs');
    const sass = require('sass');
    const source = fs.readFileSync(require.resolve('./production-time-timeline-widget.vue'), 'utf8');
    const breakpoints = fs.readFileSync('node_modules/@storefront-ui/shared/styles/helpers/_breakpoints.scss', 'utf8');
    const scss = source.match(/<style lang="scss" scoped>([\s\S]*?)<\/style>/)[1].replace('@import "~@storefront-ui/shared/styles/helpers/breakpoints";', breakpoints);
    const css = sass.compileString(scss, { silenceDeprecations: ['import', 'global-builtin', 'color-functions'] }).css;
    expect(css).toMatch(/\._options-list\s*\{\s*display:\s*grid/);
    expect(css).toMatch(/@media\s*\(min-width:\s*1024px\)[\s\S]*?\._options-list\s*\{\s*display:\s*flex/);
  });
});
