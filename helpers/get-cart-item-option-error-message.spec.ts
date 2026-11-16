import TaskResponseError from '@vue-storefront/core/lib/sync/types/TaskResponseError';
import ServerError from 'src/modules/shared/types/server-error';

import { getCartItemOptionErrorMessage } from './get-cart-item-option-error-message';

jest.mock('@vue-storefront/core/i18n', () => ({ __esModule: true, default: { t: (key: string) => key } }));

describe('getCartItemOptionErrorMessage', () => {
  it('shows the fallback instead of a technical response error with the request URL', () => {
    const error = new TaskResponseError('Error with response - bad content-type! https://api.example.com/api/cart/update?token=secret&cartId=cart', 502);

    expect(getCartItemOptionErrorMessage(error)).toBe('Something went wrong');
  });

  it('keeps a cart server message', () => {
    expect(getCartItemOptionErrorMessage(new ServerError('Product is out of stock'))).toBe('Product is out of stock');
  });

  it('keeps a network failure message as before', () => {
    expect(getCartItemOptionErrorMessage(new TypeError('Failed to fetch'))).toBe('Failed to fetch');
  });

  it('shows the fallback for an error without a message', () => {
    expect(getCartItemOptionErrorMessage('rejected')).toBe('Something went wrong');
  });
});
