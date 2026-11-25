import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import { cartHooks } from '@vue-storefront/core/modules/cart/hooks';

import OBulkorderQuotationForm from './o-bulkorder-quotation-form.vue';

jest.mock('@storefront-ui/vue', () => ({ SfButton: {}, SfHeading: {}, SfRadio: {} }));
jest.mock('@vue-storefront/core/modules/catalog/helpers', () => ({ getProductGallery: jest.fn() }));
jest.mock('@vue-storefront/core/modules/catalog', () => ({ PRODUCT_PRICE_DICTIONARY: 'product/priceDictionary' }));
jest.mock('src/modules/shared', () => ({ PriceHelper: {} }));
jest.mock('src/modules/vsf-storyblok-module/components', () => ({ components: {} }));
jest.mock('src/modules/vsf-storyblok-module', () => ({}));
jest.mock('src/modules/budsies', () => ({ BulkOrderStatus: {}, BulkorderQuoteProductId: {} }));
jest.mock('theme/helpers/use-form-validation', () => ({ useFormValidation: () => ({}) }));
jest.mock('theme/components/molecules/m-addons-selector.vue', () => ({}));
jest.mock('theme/components/molecules/m-form-errors.vue', () => ({}));

Vue.use(Vuex);

const SAMPLE_SKU = 'keychainBulkSample_bundle';
const totalsDto = { final_price: 25, regular_price: 25 };

function deferred () {
  let resolveDeferred!: () => void;
  const promise = new Promise<void>(resolve => { resolveDeferred = resolve; });
  return { promise, resolve: resolveDeferred };
}

function line (serverItemId: number, sku = SAMPLE_SKU) {
  return {
    sku,
    qty: 1,
    server_item_id: serverItemId,
    extension_attributes: { budsies_quote_item_totals: { ...totalsDto, item: serverItemId } }
  };
}

describe('Get Sample Prototype', () => {
  const onAdd = jest.fn();
  cartHooks.afterAddToCart(onAdd);

  function setUp ({ cartBefore = [] as any[], serverCart = [] as any[], choiceFails = false } = {}) {
    const totals = deferred();
    const syncOptions: any[] = [];
    const store: Store<any> = new Vuex.Store({
      modules: {
        cart: {
          namespaced: true,
          state: { cartItems: cartBefore },
          getters: { getCartItems: state => state.cartItems },
          actions: {
            create: () => undefined,
            // Like the core merge: the server lines are imported first, the totals refresh follows.
            async sync ({ state }, options) {
              syncOptions.push(options);
              state.cartItems = serverCart;
              if (options.waitForTotalsUpdate !== false) await totals.promise;
            }
          }
        },
        budsies: {
          namespaced: true,
          actions: {
            chooseBulkOrderQuote: async () => {
              if (choiceFails) throw new Error('Error while choosing bulk order quote');
            }
          }
        }
      }
    });
    const push = jest.fn();
    const form = {
      isSubmitting: false,
      quoteId: '7',
      selectedAddons: [],
      sampleProduct: { sku: SAMPLE_SKU },
      validateAndGoToFirstError: async () => true,
      get3dRenderingAddonOptionValueId: () => undefined,
      $store: store,
      $router: { push }
    };
    const submit = () => (OBulkorderQuotationForm as any).options.methods.submitQuote.call(form);

    return { submit, push, syncOptions, totals, form };
  }

  beforeEach(() => onAdd.mockClear());

  it('opens the cart without waiting for the totals refresh and reports the new prototype line once', async () => {
    const existing = line(10);
    const unrelated = line(11, 'otherProduct_bundle');
    const restoredSameSku = line(12);
    const prototype = line(13);
    const { submit, push, syncOptions } = setUp({
      cartBefore: [existing],
      serverCart: [existing, unrelated, restoredSameSku, prototype]
    });

    await submit();

    expect(syncOptions).toEqual([{ forceSync: true, waitForTotalsUpdate: false }]);
    expect(push).toHaveBeenCalledWith({ name: 'detailed-cart' });
    expect(onAdd).toHaveBeenCalledTimes(1);

    const { cartItem, diffLog, source } = onAdd.mock.calls[0][0];
    expect(cartItem).toBe(prototype);
    expect(source).toBeUndefined();
    expect(diffLog.serverResponses).toEqual([{
      status: 200,
      sku: SAMPLE_SKU,
      result: { item_id: 13, qty: 1, extension_attributes: { budsies_quote_item_totals: prototype.extension_attributes.budsies_quote_item_totals } }
    }]);
  });

  it('stays silent when the choice fails', async () => {
    const { submit, push, syncOptions, form } = setUp({ choiceFails: true });

    await expect(submit()).rejects.toThrow('Error while choosing bulk order quote');

    expect(syncOptions).toEqual([]);
    expect(push).not.toHaveBeenCalled();
    expect(onAdd).not.toHaveBeenCalled();
    expect(form.isSubmitting).toBe(false);
  });

  it('stays silent when the synchronized cart has no new prototype line', async () => {
    const existing = line(10);
    const { submit, push } = setUp({ cartBefore: [existing], serverCart: [existing, line(14, 'otherProduct_bundle')] });

    await submit();

    expect(push).toHaveBeenCalledTimes(1);
    expect(onAdd).not.toHaveBeenCalled();
  });
});
