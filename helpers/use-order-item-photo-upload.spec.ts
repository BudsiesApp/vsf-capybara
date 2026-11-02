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

import { useOrderItemPhotoUpload } from './use-order-item-photo-upload';

jest.mock('@vue-storefront/core/lib/logger', () => ({ Logger: { error: jest.fn(() => jest.fn()) } }));

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
  const onSubmitted = jest.fn();
  const dispatch = jest.fn().mockImplementation((action: string) => Promise.resolve(action === 'product/loadProduct' ? { id: 7, customizations } : undefined));
  let upload: ReturnType<typeof useOrderItemPhotoUpload>;
  const wrapper = mount(defineComponent({
    setup () {
      upload = useOrderItemPhotoUpload(ref(42), ref('pet'), validate, onSubmitted);
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
    onSubmitted,
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

  it('sends only the complete selected photo value, saves before submit, then notifies and reports submission', async () => {
    const { upload, dispatch, onSubmitted } = setup();
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
    expect(dispatch).toHaveBeenLastCalledWith('notification/spawnNotification', { type: 'success', message: 'Your photos have been submitted.', action1: { label: 'OK' } });
    expect(onSubmitted).toHaveBeenCalledTimes(1);
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

  it('opens the form and discards unsaved photos on cancel', async () => {
    const { upload } = setup();
    await settle();
    expect(upload.isFormOpen.value).toBe(false);
    upload.openForm();
    upload.updateCustomizationOptionValue({ customizationId: 'photos', value: [retained, added] });
    upload.cancel();
    expect(upload.isFormOpen.value).toBe(false);
    expect(upload.customizationOptionValue.value).toEqual({ photos: [retained] });
  });

  it('keeps the form open on cancel while a photo is uploading', async () => {
    const { upload } = setup();
    await settle();
    upload.openForm();
    upload.onEntityBusyChanged({ entityId: 'photos', isBusy: true });
    upload.cancel();
    expect(upload.isFormOpen.value).toBe(true);
  });

  it('latches before asynchronous validation and stays locked after submission', async () => {
    const { upload, validate, onSubmitted } = setup();
    await settle();
    let finishValidation: (value: boolean) => void;
    validate.mockImplementation(() => new Promise(resolve => { finishValidation = resolve; }));
    const pending = upload.submitPhotos();
    await upload.submitPhotos();
    expect(validate).toHaveBeenCalledTimes(1);
    finishValidation(true);
    await pending;
    await upload.submitPhotos();
    expect(save).toHaveBeenCalledTimes(1);
    expect(onSubmitted).toHaveBeenCalledTimes(1);
    expect(upload.isPending.value).toBe(true);
  });

  it('unlocks after failed validation', async () => {
    const { upload, validate } = setup();
    await settle();
    validate.mockResolvedValue(false);
    await upload.submitPhotos();
    expect(upload.isPending.value).toBe(false);
  });
});
