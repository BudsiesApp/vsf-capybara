import { defineComponent, ref } from 'vue';

import { storeInjectionKey } from '@vue-storefront/core/application-services';
import { mount } from '@vue/test-utils';

import {
  saveOrderItemCustomizationsState,
  submitOrderItemCustomizationsState
} from 'src/modules/customization-system';
import { BudsieStatus } from 'src/modules/shared';

import { useCustomizeAction } from './use-customize-action';

jest.mock('src/modules/shared', () => ({
  ...jest.requireActual('src/modules/shared/types/budsie-status')
}));

jest.mock('src/modules/customization-system', () => ({
  ...jest.requireMock('src/modules/customization-system/helpers/order-items-customizations.service'),
  ...jest.requireActual('src/modules/customization-system/helpers/filter-customization-state'),
  ...jest.requireActual('src/modules/customization-system/helpers/is-image-upload-customization')
}));

jest.mock('src/modules/customization-system/helpers/order-items-customizations.service', () => ({
  saveOrderItemCustomizationsState: jest.fn(),
  submitOrderItemCustomizationsState: jest.fn()
}));

const save = saveOrderItemCustomizationsState as jest.Mock;
const submit = submitOrderItemCustomizationsState as jest.Mock;

const photos = [{ id: 'a', url: '/a.jpg' }, { id: 'b', url: '/b.jpg' }];
const productCustomizations = [
  { id: 'group', type: 'options_group' },
  { id: 'photos', type: 'option', optionData: { displayWidget: 'image_upload' } },
  { id: 'extra-photos', type: 'option', optionData: { displayWidget: 'image_upload' } },
  { id: 'name', type: 'option', optionData: { displayWidget: 'text_input' } }
];
const mixedState = [
  { customization_id: 'group', value: 'x', quantity: 1 },
  { customization_id: 'photos', value: photos, quantity: 1 },
  { customization_id: 'name', value: 'Rex', quantity: 1 },
  { customization_id: 'extra-photos', value: [photos[0]], quantity: 2 }
];

function setup (statusId: number, state: unknown[]) {
  let action: ReturnType<typeof useCustomizeAction>;
  mount(defineComponent({
    setup () {
      action = useCustomizeAction(
        ref(state) as never,
        ref({ id: 42, status_id: statusId, customization_state: [] }) as never,
        ref(productCustomizations) as never
      );
      return {};
    },
    render: h => h('div')
  }), {
    provide: {
      [storeInjectionKey as symbol]: { getters: { 'user/getUserToken': 'token' } }
    }
  });
  return () => action.confirmCustomization();
}

beforeEach(() => {
  jest.clearAllMocks();
  save.mockResolvedValue({ errors: [] });
  submit.mockResolvedValue({ errors: [] });
});

describe('useCustomizeAction', () => {
  it('saves only image entries with complete values for Awaiting artwork, then submits', async () => {
    const order: string[] = [];
    save.mockImplementation(async () => { order.push('save'); return { errors: [] }; });
    submit.mockImplementation(async () => { order.push('submit'); return { errors: [] }; });

    await setup(BudsieStatus.AWAITING_ARTWORK, mixedState)();

    expect(save).toHaveBeenCalledWith([{
      id: 42,
      status_id: BudsieStatus.AWAITING_ARTWORK,
      customization_state: [
        { customization_id: 'photos', value: photos, quantity: 1 },
        { customization_id: 'extra-photos', value: [photos[0]], quantity: 2 }
      ]
    }], 'token');
    expect(submit).toHaveBeenCalledWith([42], 'token');
    expect(order).toEqual(['save', 'submit']);
  });

  it('saves an empty state for Awaiting artwork when no image entry exists', async () => {
    await setup(BudsieStatus.AWAITING_ARTWORK, mixedState.filter(entry => entry.customization_id === 'name' || entry.customization_id === 'group'))();

    expect(save).toHaveBeenCalledWith([{
      id: 42,
      status_id: BudsieStatus.AWAITING_ARTWORK,
      customization_state: []
    }], 'token');
  });

  it('keeps non-image entries for Awaiting customization', async () => {
    await setup(BudsieStatus.AWAITING_CUSTOMIZATION, mixedState)();

    expect(save).toHaveBeenCalledWith([{
      id: 42,
      status_id: BudsieStatus.AWAITING_CUSTOMIZATION,
      customization_state: mixedState
    }], 'token');
  });
});
