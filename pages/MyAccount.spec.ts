import { shallowMount, Wrapper } from '@vue/test-utils';
import Vue from 'vue';

import MyAccountPage from './MyAccount.vue';
import MyAccountProfile from '../components/organisms/o-my-account-profile.vue';

jest.mock('@vue-storefront/core/pages/MyAccount', () => ({
  __esModule: true,
  default: {}
}));

jest.mock('@vue-storefront/core/lib/multistore', () => ({
  localizedRoute: jest.fn((path: string) => path)
}));

jest.mock('theme/components/molecules/m-update-personal-data', () => ({
  __esModule: true,
  default: { template: '<div />' }
}));

jest.mock('@storefront-ui/vue', () => ({
  SfBreadcrumbs: { template: '<div><slot /></div>' },
  SfHeading: { template: '<div />' },
  SfList: { template: '<ul><slot /></ul>' },
  SfTabs: { template: '<div><slot /></div>' }
}));

describe('My Account logout controls', () => {
  let wrapper: Wrapper<Vue> | undefined;
  let store: {
    commit: jest.Mock,
    dispatch: jest.Mock
  };

  beforeEach(() => {
    store = {
      commit: jest.fn(),
      dispatch: jest.fn().mockResolvedValue(undefined)
    };
  });

  afterEach(() => {
    wrapper?.destroy();
    wrapper = undefined;
  });

  const mountOptions = () => ({
    mocks: {
      $route: { name: 'orders-history' },
      $store: store,
      $t: (message: string) => message
    },
    stubs: {
      RouterLink: { template: '<a><slot /></a>' },
      RouterView: { template: '<div />' },
      SfListItem: { template: '<li><slot /></li>' },
      SfTab: { template: '<div><slot /></div>' }
    }
  });

  it('dispatches logout from the account navigation button', async () => {
    wrapper = shallowMount(MyAccountPage as any, mountOptions());

    const logoutButton = wrapper.find('button._logout-button');
    expect(logoutButton.attributes('type')).toBe('button');

    await logoutButton.trigger('click');

    expect(store.dispatch).toHaveBeenCalledWith('user/logout', {});
  });

  it('dispatches logout from the mobile profile button', async () => {
    wrapper = shallowMount(MyAccountProfile as any, mountOptions());

    const logoutButton = wrapper.find('button._logout-button');
    expect(logoutButton.attributes('type')).toBe('button');

    await logoutButton.trigger('click');

    expect(store.dispatch).toHaveBeenCalledWith('user/logout', {});
  });
});
