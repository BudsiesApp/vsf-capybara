import { mount } from '@vue/test-utils';
import { defineComponent, nextTick, ref } from 'vue';
import { storeInjectionKey } from '@vue-storefront/core/application-services';
import { updateProductProductionTimeCustomizationData } from 'src/modules/customization-system';
import { useAlterationProductsLoader } from './use-alteration-products-loader';
import { useOrderItemAlterationProductLoader } from './use-order-item-alteration-product-loader';

jest.mock('src/modules/customization-system', () => ({
  updateProductProductionTimeCustomizationData: jest.fn((product, store, options) => ({ ...product, destination: options.isDomestic }))
}));

const project = updateProductProductionTimeCustomizationData as jest.Mock;
const item = (id: number) => ({ item_id: id, extension_attributes: { alteration_product: { sku: 'bundle' } } });
const order = (id: number, address?: any) => ({ items: [item(id)], shipping_address: address });
const store = () => ({ getters: { 'product/getProductBySkuDictionary': { bundle: { id: 831 } } }, dispatch: jest.fn().mockResolvedValue(undefined) });

describe('order alteration destination', () => {
  beforeEach(() => project.mockClear());

  it('projects shared bundle for each owning order and reacts to destination changes', async () => {
    const orders = ref<any[]>([order(1, { country_id: 'US' }), order(2, { country_id: 'CA' }), order(3, null), order(4, {}), order(5)]);
    let loader: ReturnType<typeof useAlterationProductsLoader>;
    const wrapper = mount(defineComponent({ setup () { loader = useAlterationProductsLoader(orders); return {}; }, render: h => h('div') }), {
      provide: { [storeInjectionKey as symbol]: store() }
    });
    expect(Object.values(loader.alterationProductByOrderItemId.value).map((value: any) => value.destination)).toEqual([true, false, false, false, false]);
    orders.value[1].shipping_address.country_id = 'US';
    await nextTick();
    expect((loader.alterationProductByOrderItemId.value[2] as any).destination).toBe(true);
    wrapper.destroy();
  });

  it('waits for the owning order and updates for absent address, missing country and changed order', async () => {
    const currentItem = ref<any>(item(1));
    const currentOrder = ref<any>(undefined);
    let loader: ReturnType<typeof useOrderItemAlterationProductLoader>;
    const wrapper = mount(defineComponent({ setup () { loader = useOrderItemAlterationProductLoader(currentItem, currentOrder); return {}; }, render: h => h('div') }), {
      provide: { [storeInjectionKey as symbol]: store() }
    });
    expect(loader.alterationProduct.value).toBeUndefined();
    expect(project).not.toHaveBeenCalled();
    for (const address of [null, undefined, {}, { country_id: 'CA' }, { country_id: 'US' }]) {
      currentOrder.value = order(1, address);
      await nextTick();
      expect((loader.alterationProduct.value as any).destination).toBe(address?.country_id === 'US');
    }
    wrapper.destroy();
  });

});
