import Vue, { CreateElement } from 'vue';
import { Wrapper } from '@vue/test-utils';
import { ApplicationServices } from '@vue-storefront/core/application-services';
import { mountWithApplicationServices } from '../../../../test/unit/utils/application-services';
import ImageHandlerService from 'src/modules/file-storage/image-handler.service';
import { fetchOrderItemDeliverables } from 'src/modules/customization-system';
import OrderItemDeliverablesDownload from './OrderItemDeliverablesDownload.vue';

jest.mock('src/modules/customization-system', () => ({ fetchOrderItemDeliverables: jest.fn() }));
jest.mock('src/modules/budsies', () => ({ BaseImage: {} }));
jest.mock('src/modules/currency', () => ({ GET_ACTIVE_CURRENCY: 'currency/active' }));
jest.mock('src/modules/shared', () => ({ ProductEvent: { PRODUCT_CARD_CLICK: 'product-click' } }));
jest.mock('@vue-storefront/core/modules/catalog', () => ({ PRODUCT_LOCALIZED_PRICE_DICTIONARY: 'prices' }));
jest.mock('theme/helpers', () => ({ prepareCategoryProduct: (product: unknown) => product }));
jest.mock('theme/components/organisms/o-product-card.vue', () => ({}));
jest.mock('@storefront-ui/vue', () => ({
  SfButton: {}, SfHeading: {}
}));

describe('portrait downloads', () => {
  let wrapper: Wrapper<Vue>;
  const originalFetch = global.fetch;
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;
  const transport = jest.fn();
  const dispatch = jest.fn();
  const resolve = jest.fn();
  const translate = jest.fn((message: string) => `translated:${message}`);
  const imageBlob = new Blob(['portrait'], { type: 'image/jpeg' });
  let save: jest.SpyInstance;

  beforeEach(() => {
    transport.mockReset().mockResolvedValue({ ok: true, blob: jest.fn().mockResolvedValue(imageBlob) });
    dispatch.mockReset().mockResolvedValue(undefined);
    resolve.mockReset().mockReturnValue({ href: '/customize' });
    global.fetch = transport;
    URL.createObjectURL = jest.fn().mockReturnValue('blob:portrait');
    URL.revokeObjectURL = jest.fn();
    save = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe('123');
      expect(this.href).toBe('blob:portrait');
      expect(document.body.contains(this)).toBe(true);
    });
  });

  afterEach(() => {
    wrapper?.destroy();
    jest.restoreAllMocks();
    global.fetch = originalFetch;
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  async function mountPortrait (path: string, host = 'https://photos.example.test/') {
    (fetchOrderItemDeliverables as jest.Mock).mockResolvedValue([
      { storage_item_id: 1, storage_item_url: path },
      { storage_item_id: 2, storage_item_url: 'second.jpg' }
    ]);
    wrapper = mountWithApplicationServices(OrderItemDeliverablesDownload, {
      store: { dispatch, getters: { 'product/getProductBySkuDictionary': {
        customTumblers_bundle: { id: 1, sku: 'customTumblers_bundle' },
        unrelated: { id: 2, sku: 'unrelated' }
      } } },
      router: { resolve }, route: {}, i18n: { t: translate }
    } as unknown as ApplicationServices, {
      propsData: { orderItemId: 123 },
      provide: { QaPhotosHandlerService: new ImageHandlerService(host) },
      stubs: {
        BaseImage: { props: ['src'], render (createElement: CreateElement) { return createElement('img', { attrs: { src: this.src } }); } },
        SfHeading: { render (createElement: CreateElement) { return createElement('h1'); } },
        SfButton: { render (createElement: CreateElement) { return createElement('button', { on: { click: () => this.$emit('click') } }, this.$slots.default); } },
        OProductCard: { props: ['product', 'link'], render (createElement: CreateElement) { return createElement('a', { class: 'product', attrs: { href: this.link } }); } }
      },
      mocks: { $t: translate }
    });
    await Vue.nextTick();
    await Vue.nextTick();
  }

  async function download () {
    await (wrapper.vm as Vue & { downloadDeliverable: (portrait: unknown) => Promise<void> }).downloadDeliverable(
      (wrapper.vm as Vue & { deliverables: unknown[] }).deliverables[0]
    );
  }

  it.each([
    ['budsies-qa-photos/portrait.jpg', 'https://photos.example.test/', 'portrait.jpg'],
    ['portrait.jpg', 'https://alternate.example.test/originals/', 'portrait.jpg'],
    ['budsies-qa-photos-extra/portrait.jpg', 'https://photos.example.test/', 'budsies-qa-photos-extra/portrait.jpg'],
    ['folder/budsies-qa-photos/portrait.jpg', 'https://photos.example.test/', 'folder/budsies-qa-photos/portrait.jpg']
  ])('selects the same original for %s', async (path, host, expectedPath) => {
    await mountPortrait(path, host);
    const expectedUrl = host + expectedPath;
    expect(wrapper.find('img').attributes('src')).toBe(expectedUrl);
    expect(wrapper.findAll('.product')).toHaveLength(1);
    expect(resolve).toHaveBeenCalledWith({ name: 'tumblers-creation', query: { 'image-url': expectedUrl } });
    await download();
    expect(transport).toHaveBeenCalledWith(expectedUrl);
    expect(URL.createObjectURL).toHaveBeenCalledWith(imageBlob);
    expect(save).toHaveBeenCalledTimes(1);
    expect(document.querySelector('a[download]')).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:portrait');
  });

  it.each([403, 404, 'network'])('reports %s and permits a fresh successful attempt', async failure => {
    await mountPortrait('portrait.jpg');
    const failedBlob = jest.fn();
    if (failure === 'network') {
      transport.mockRejectedValueOnce(new Error('network unavailable'));
    } else {
      transport.mockResolvedValueOnce({ ok: false, status: failure, blob: failedBlob });
    }
    await download().catch(() => undefined);
    expect(dispatch).toHaveBeenCalledWith('notification/spawnNotification', {
      type: 'danger', message: 'translated:Something went wrong', action1: { label: 'translated:OK' }
    });
    expect(failedBlob).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(wrapper.findAll('button')).toHaveLength(2);
    expect(wrapper.find('._not-found').exists()).toBe(false);
    const notificationCount = dispatch.mock.calls.filter(([action]) => action === 'notification/spawnNotification').length;
    await download();
    expect(transport).toHaveBeenCalledTimes(2);
    expect(transport).toHaveBeenLastCalledWith('https://photos.example.test/portrait.jpg');
    expect(save).toHaveBeenCalledTimes(1);
    expect(URL.createObjectURL).toHaveBeenCalledWith(imageBlob);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:portrait');
    expect(document.querySelector('a[download]')).toBeNull();
    expect(dispatch.mock.calls.filter(([action]) => action === 'notification/spawnNotification')).toHaveLength(notificationCount);
  });
});
