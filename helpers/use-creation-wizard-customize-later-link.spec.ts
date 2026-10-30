import { ref } from 'vue';

import CartItem from 'core/modules/cart/types/CartItem';
import Product from 'core/modules/catalog/types/Product';
import { ProductCustomizationMode } from 'src/modules/customization-system/types/customizable-product-flow.type';
import { PlushieType } from 'theme/interfaces/plushie.type';

import getForeversSkuByType from './get-forevers-sku-by-type.function';
import { useCreationWizardCustomizeLaterLink } from './use-creation-wizard-customize-later-link';

jest.mock('src/modules/shared', () => jest.requireActual('src/modules/shared/types/forevers-product-skus'));

function createProduct (sku: string): Product {
  return {
    sku,
    id: 1,
    name: 'Forevers',
    category_ids: [],
    description: '',
    image: '',
    media_gallery: [],
    minimal_price: 0,
    minimal_regular_price: 0,
    price: 0,
    regular_price: 0,
    status: 1,
    stock: {},
    type_id: 'bundle',
    url_key: '',
    visibility: 4
  };
}

function createCartItem (sku: string): CartItem {
  return {
    ...createProduct(sku),
    qty: 1,
    options: [],
    server_item_id: 1,
    server_cart_id: 1,
    totals: {
      base_discount_amount: 0,
      base_price: 0,
      base_price_incl_tax: 0,
      base_row_total: 0,
      base_row_total_incl_tax: 0,
      base_tax_amount: 0,
      discount_amount: 0,
      discount_percent: 0,
      item_id: 1,
      name: 'Forevers',
      options: [],
      price: 0,
      price_incl_tax: 0,
      qty: 1,
      row_total: 0,
      row_total_incl_tax: 0,
      row_total_with_discount: 0,
      tax_amount: 0,
      tax_percent: 0
    }
  };
}

function createLink (type = 'dog') {
  const plushieType = ref(PlushieType.FOREVERS);
  const currentProduct = ref<Product | undefined>(createProduct(getForeversSkuByType(type)));
  const existingCartItem = ref<CartItem | undefined>();
  const customizationMode = ref(ProductCustomizationMode.ADD_TO_CART);
  const { customizeLaterLink } = useCreationWizardCustomizeLaterLink(
    plushieType, currentProduct, existingCartItem, customizationMode
  );

  return {
    customizeLaterLink,
    plushieType,
    currentProduct,
    existingCartItem,
    customizationMode
  };
}

describe('useCreationWizardCustomizeLaterLink', () => {
  it.each(['dog', 'cat', 'other'])('links a new %s with only the product type', (product) => {
    expect(createLink(product).customizeLaterLink.value).toEqual({
      name: 'forevers-customize-later', query: { product }
    });
  });

  it('excludes missing products, cart edits, customization mode and golf covers reactively', () => {
    const state = createLink();
    state.currentProduct.value = undefined;
    expect(state.customizeLaterLink.value).toBeUndefined();
    state.currentProduct.value = createProduct(getForeversSkuByType('dog'));
    state.existingCartItem.value = createCartItem(getForeversSkuByType('dog'));
    expect(state.customizeLaterLink.value).toBeUndefined();
    state.existingCartItem.value = undefined;
    state.customizationMode.value = ProductCustomizationMode.CUSTOMIZE;
    expect(state.customizeLaterLink.value).toBeUndefined();
    state.customizationMode.value = ProductCustomizationMode.ADD_TO_CART;
    state.plushieType.value = PlushieType.GOLF_COVERS;
    expect(state.customizeLaterLink.value).toBeUndefined();
    state.plushieType.value = PlushieType.FOREVERS;
    expect(state.customizeLaterLink.value).toBeDefined();
  });

  it('follows the current product type', () => {
    const state = createLink();
    state.currentProduct.value = createProduct(getForeversSkuByType('cat'));
    expect(state.customizeLaterLink.value).toEqual({ name: 'forevers-customize-later', query: { product: 'cat' } });
  });
});
