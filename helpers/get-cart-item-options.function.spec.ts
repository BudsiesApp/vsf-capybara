import { onlineHelper } from '@vue-storefront/core/helpers';
import CartItem from 'core/modules/cart/types/CartItem';
import { getCartItemOptions } from './get-cart-item-options.function';

jest.mock('@vue-storefront/core/helpers', () => ({ onlineHelper: { isOnline: true } }));

describe.each([true, false])('getCartItemOptions online=%s', (online) => {
  beforeEach(() => { onlineHelper.isOnline = online; });

  it.each([
    ['Children&#039;s Hospital of Atlanta', "Children's Hospital of Atlanta"],
    ['A &amp; B', 'A & B'],
    ['&lt;img src=x onerror=alert(1)&gt;', '<img src=x onerror=alert(1)>']
  ])('decodes %s without changing source data', (value, expected) => {
    const option = { label: 'Hospital name', value };
    const other = { label: 'Other', value: 'unused' };
    const source = {
      custom_options: [{ title: 'Hospital name' }],
      options: [online ? other : option],
      totals: { options: [online ? option : other] }
    } as unknown as CartItem;
    const original = JSON.stringify(source);

    expect(getCartItemOptions(source)).toEqual([
      { label: 'Hospital name', value: expected, isCustom: true }
    ]);
    expect(JSON.stringify(source)).toBe(original);
  });
});

it('returns no options without supported metadata', () => {
  expect(getCartItemOptions({ options: [{ label: 'Hospital name', value: 'A &amp; B' }] } as unknown as CartItem)).toEqual([]);
});
