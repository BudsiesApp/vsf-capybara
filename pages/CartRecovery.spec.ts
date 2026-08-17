import CartRecovery from './CartRecovery.vue';

jest.mock('@vue-storefront/core/lib/multistore', () => ({
  localizedRoute: jest.fn((route: unknown) => route)
}));

jest.mock('@vue-storefront/core/lib/logger', () => ({
  Logger: {
    error: jest.fn(() => jest.fn())
  }
}));

jest.mock('@vue-storefront/core/compatibility/plugins/event-bus', () => ({
  __esModule: true,
  default: {
    $emit: jest.fn(),
    $off: jest.fn(),
    $on: jest.fn(),
    $once: jest.fn()
  }
}));

jest.mock('@storefront-ui/vue', () => ({
  SfButton: { template: '<button><slot /></button>' },
  SfHeading: { template: '<h1 />' }
}));

interface RecoveryViewModel {
  $route: {
    params: { id: string, code: string },
    query: Record<string, unknown>
  },
  $router: { push: jest.Mock },
  $store: {
    commit: jest.Mock,
    dispatch: jest.Mock
  },
  isLoading: boolean,
  isShowError: boolean
}

const recoverCart = (CartRecovery as any).options.methods.recoverCart as (
  this: RecoveryViewModel
) => Promise<void>;

function createViewModel (query: Record<string, unknown>, dispatch: jest.Mock): RecoveryViewModel {
  return {
    $route: {
      params: { id: 'recovery-id', code: 'recovery-code' },
      query
    },
    $router: { push: jest.fn() },
    $store: {
      commit: jest.fn(),
      dispatch
    },
    isLoading: true,
    isShowError: false
  };
}

describe('CartRecovery', () => {
  it('reuses the promo-code payload when recovery is retried after authorization', async () => {
    const dispatch = jest.fn()
      .mockRejectedValueOnce({ code: 401 })
      .mockResolvedValue('cart-token');
    const viewModel = createViewModel({ applyPromoCode: 'true' }, dispatch);

    await recoverCart.call(viewModel);

    const expectedPayload = {
      recoveryId: 'recovery-id',
      recoveryCode: 'recovery-code',
      applyPromoCode: 'true'
    };

    expect(dispatch).toHaveBeenNthCalledWith(
      1,
      'budsies/loadRecoverableCart',
      expectedPayload
    );
    expect(dispatch).toHaveBeenNthCalledWith(
      2,
      'budsies/loadRecoverableCart',
      expectedPayload
    );
  });

  it('omits the promo-code instruction for existing recovery links', async () => {
    const dispatch = jest.fn().mockResolvedValue('cart-token');
    const viewModel = createViewModel({}, dispatch);

    await recoverCart.call(viewModel);

    expect(dispatch).toHaveBeenCalledWith(
      'budsies/loadRecoverableCart',
      {
        recoveryId: 'recovery-id',
        recoveryCode: 'recovery-code'
      }
    );
  });
});
