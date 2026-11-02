import { shallowMount, Wrapper } from '@vue/test-utils';
import Vue from 'vue';

import BudsiesPalsKitProduct from './BudsiesPalsKitProduct.vue';

jest.mock('@storefront-ui/vue', () => ({
  SfHeading: {
    name: 'SfHeading',
    props: ['level', 'title'],
    template: '<h1 :data-level="level">{{ title }}</h1>'
  }
}));

jest.mock('@vue-storefront/core/compatibility/plugins/event-bus', () => ({
  __esModule: true,
  default: { $emit: jest.fn() }
}));

jest.mock('@vue-storefront/core/filters', () => ({
  htmlDecode: (value: string) => value
}));

jest.mock('@vue-storefront/core/modules/catalog-next/hooks', () => ({
  catalogHooksExecutors: { productPageVisited: jest.fn() }
}));

jest.mock('src/modules/budsies', () => ({
  ProductStructuredData: { template: '<div />' }
}));

jest.mock('src/modules/shared', () => ({
  ProductEvent: { PRODUCT_PAGE_SHOW: 'product-page-show' }
}));

jest.mock('theme/components/molecules/m-block-story.vue', () => ({
  __esModule: true,
  default: { template: '<div />' }
}));

jest.mock('theme/components/organisms/o-budsies-pals-kit-product-order-form.vue', () => ({
  __esModule: true,
  default: {
    name: 'OBudsiesPalsKitProductOrderForm',
    props: ['hospitalsList', 'product'],
    template: '<form />'
  }
}));

interface CatalogProduct {
  name: string,
  sku: string
}

function mountPage (product: CatalogProduct | null, isDataLoaded = true): Wrapper<Vue> {
  const palsKitProduct = product || { name: 'Loaded Product', sku: 'palsKit' };

  return shallowMount(BudsiesPalsKitProduct as any, {
    data: () => ({ isDataLoaded }),
    mocks: {
      $store: {
        dispatch: jest.fn().mockResolvedValue(undefined),
        getters: {
          'product/getCurrentProduct': product,
          'product/getProductBySkuDictionary': {
            palsKit: palsKitProduct
          }
        }
      },
      $t: (message: string) => message
    },
    provide: {
      WindowObject: {}
    }
  });
}

describe('BudsiesPalsKitProduct', () => {
  let wrapper: Wrapper<Vue> | undefined;

  afterEach(() => {
    wrapper?.destroy();
    wrapper = undefined;
  });

  it.each([
    'Budsies Pals Vouchers',
    'Future Catalog Name'
  ])('renders the Magento product name in both headings: %s', (name) => {
    wrapper = mountPage({ name, sku: 'palsKit' });

    const headings = wrapper.findAllComponents({ name: 'SfHeading' });
    expect(headings.at(0).props('title')).toBe(name);
    expect(headings.at(1).props('title')).toBe(`Purchase ${name}`);
    expect(wrapper.text()).not.toContain('Budsies Pals Kit');
  });

  it('does not render product headings without the validated current product', () => {
    wrapper = mountPage(null);

    expect(wrapper.findAllComponents({ name: 'SfHeading' })).toHaveLength(0);
  });

  it('passes the current product object to the order form unchanged', () => {
    const product = { name: 'Budsies Pals Vouchers', sku: 'palsKit' };
    wrapper = mountPage(product);

    expect(wrapper.findComponent({ name: 'OBudsiesPalsKitProductOrderForm' }).props('product')).toBe(product);
  });
});