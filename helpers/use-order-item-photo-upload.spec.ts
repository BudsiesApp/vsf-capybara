import { mount } from '@vue/test-utils';
import {
  defineComponent,
  ref
} from 'vue';

import {
  i18nInjectionKey,
  storeInjectionKey
} from '@vue-storefront/core/application-services';

import {
  fetchOrderItemCustomizationsState,
  saveOrderItemCustomizationsState,
  submitOrderItemCustomizationsState
} from 'src/modules/customization-system';
import { OrderItem } from 'src/modules/orders-history/types/order-item';

import { useOrderItemPhotoUpload } from './use-order-item-photo-upload';

jest.mock('@vue-storefront/core/lib/logger', () => ({ Logger: { error: jest.fn(() => jest.fn()) } }));

jest.mock('src/modules/orders-history', () => ({ FETCH_ORDERS_HISTORY_ACTION: 'ordersHistory/FETCH_ORDERS_HISTORY' }));
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

const fetchDraft = fetchOrderItemCustomizationsState as jest.Mock;
const save = saveOrderItemCustomizationsState as jest.Mock;
const submit = submitOrderItemCustomizationsState as jest.Mock;
const retained = { id: 'saved', url: '/saved.jpg' };
const added = { id: 'new', url: '/new.jpg' };
const eligible = { id: 'photos', isLocked: false, optionData: { displayWidget: 'image_upload' }, flowAvailability: ['customize-later-completion'] };
const settle = async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); };

function setup (customizations: unknown[] = [eligible]) {
  const validate = jest.fn().mockResolvedValue(true);
  const dispatch = jest.fn().mockImplementation((action: string) => Promise.resolve(action === 'product/loadProduct' ? { id: 7, customizations } : undefined));
  let upload: ReturnType<typeof useOrderItemPhotoUpload>;
  const wrapper = mount(defineComponent({
    setup () {
      const item: OrderItem = {
        item_id: 42, display_id: 42, quantity: 1, estimated_shipment_date: '', shipments: [],
        product: { id: 7, sku: 'pet', name: 'Pet', thumbnail: '', image: '', small_image: '' },
        progress_tracker: { status_id: 4, status_list: [], cancelled: false, completed: false },
        available_actions: ['awaiting_artwork'].map(code => ({ code, name: code, message: code, blocking_progress: true, url: null, open_in_new_tab: false }))
      };
      upload = useOrderItemPhotoUpload(ref(item), validate);
      return {};
    },
    render: h => h('div')
  }), {
    provide: {
      [storeInjectionKey as symbol]: { dispatch, getters: { 'user/getUserToken': 'token' } },
      [i18nInjectionKey as symbol]: { t: (key: string) => key }
    }
  });
  return {
    get upload () {
      return upload;
    },
    dispatch,
    validate,
    wrapper
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  fetchDraft.mockResolvedValue({ id: 42, status_id: 1, customization_state: [
    { customization_id: 'photos', value: [retained] },
    { customization_id: 'email', value: 'private@example.test' }
  ] });
  save.mockResolvedValue({ success: [{ orderItemId: 42 }], errors: [] });
  submit.mockResolvedValue({ success: [{ orderItemId: 42 }], errors: [] });
});

describe('order item photo upload', () => {
  it('loads locally, ignores tracker status and seeds the first eligible field with retained photos', async () => {
    const { upload, dispatch } = setup([{ ...eligible, isLocked: true }, eligible, { ...eligible, id: 'other' }]);
    expect(upload.isReady.value).toBe(false);
    await settle();
    expect(dispatch).toHaveBeenCalledWith('product/loadProduct', { parentSku: 'pet', setCurrent: false });
    expect(fetchDraft).toHaveBeenCalledWith('42');
    expect(upload.isReady.value).toBe(true);
    expect(upload.customization.value.id).toBe('photos');
    expect(upload.customizationOptionValue.value).toEqual({ photos: [retained] });
  });

  it.each([
    { ...eligible, isLocked: true },
    { ...eligible, optionData: { displayWidget: 'text_input' } },
    { ...eligible, flowAvailability: undefined },
    { ...eligible, flowAvailability: [] }
  ])('keeps fallback for ineligible configuration %p', async option => {
    const { upload } = setup([option]);
    await settle();
    expect(upload.isReady.value).toBe(false);
    expect(fetchDraft).not.toHaveBeenCalled();
  });

  it('sends only the complete selected photo value, saves before submit, then notifies and refreshes', async () => {
    const { upload, dispatch } = setup();
    await settle();
    upload.updateCustomizationOptionValue({ customizationId: 'photos', value: [retained, added] });
    let finishSave: (value: unknown) => void;
    save.mockImplementation(() => new Promise(resolve => { finishSave = resolve; }));
    const pending = upload.submitPhotos();
    await settle();
    expect(save).toHaveBeenCalledWith([{ id: 42, status_id: 1, customization_state: [{ customization_id: 'photos', quantity: 1, value: [retained, added] }] }], 'token');
    expect(submit).not.toHaveBeenCalled();
    finishSave({ errors: [] });
    await pending;
    expect(submit).toHaveBeenCalledWith([42], 'token');
    expect(dispatch.mock.calls.slice(-2)).toEqual([
      ['notification/spawnNotification', { type: 'success', message: 'Your photos have been submitted.', action1: { label: 'OK' } }],
      ['ordersHistory/FETCH_ORDERS_HISTORY', { filters: { excludeAlterationProducts: true } }]
    ]);
  });

  it.each(['save transport', 'save item', 'submit transport', 'submit item'])('retains photos on %s failure', async failure => {
    const { upload, dispatch } = setup();
    await settle();
    const request = failure.startsWith('save') ? save : submit;
    if (failure.endsWith('transport')) request.mockRejectedValue(new Error('failed'));
    else request.mockResolvedValue({ errors: [{ errorMessage: 'failed' }] });
    await upload.submitPhotos();
    if (failure.startsWith('save')) expect(submit).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenLastCalledWith('notification/spawnNotification', expect.objectContaining({ type: 'danger', message: 'Something went wrong. Please try again.' }));
    expect(upload.customizationOptionValue.value.photos).toEqual([retained]);
    expect(upload.isPending.value).toBe(false);
  });

  it.each(['empty', 'invalid', 'busy'])('blocks %s submission', async guard => {
    const { upload, validate } = setup();
    await settle();
    if (guard === 'empty') upload.updateCustomizationOptionValue({ customizationId: 'photos', value: [] });
    if (guard === 'invalid') validate.mockResolvedValue(false);
    if (guard === 'busy') upload.onEntityBusyChanged({ entityId: 'photos', isBusy: true });
    await upload.submitPhotos();
    expect(save).not.toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
  });

  it('latches before asynchronous validation and through refresh', async () => {
    const { upload, validate, dispatch } = setup();
    await settle();
    let finishValidation: (value: boolean) => void;
    validate.mockImplementation(() => new Promise(resolve => { finishValidation = resolve; }));
    let finishRefresh: () => void;
    dispatch.mockImplementation(action => action === 'ordersHistory/FETCH_ORDERS_HISTORY' ? new Promise<void>(resolve => { finishRefresh = resolve; }) : Promise.resolve());
    const pending = upload.submitPhotos();
    await upload.submitPhotos();
    expect(validate).toHaveBeenCalledTimes(1);
    finishValidation(true);
    await settle();
    await upload.submitPhotos();
    expect(save).toHaveBeenCalledTimes(1);
    expect(upload.isPending.value).toBe(true);
    finishRefresh();
    await pending;
    expect(upload.isPending.value).toBe(false);
  });
});
