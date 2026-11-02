import { createLocalVue, mount, RouterLinkStub, Wrapper } from '@vue/test-utils';
import Vue from 'vue';
import Vuex from 'vuex';

import OHeader from './o-header.vue';

const localVue = createLocalVue();
localVue.use(Vuex);

function mockRenderEmpty (h: Vue.CreateElement) {
  return h('div');
}

jest.mock('@storefront-ui/vue', () => ({
  SfHeader: {
    render (this: Vue, h: Vue.CreateElement) {
      return h('div', [
        this.$scopedSlots.logo?.({}),
        this.$scopedSlots.navigation?.({}),
        this.$scopedSlots['header-icons']?.({})
      ]);
    }
  },
  SfIcon: { render: (h: Vue.CreateElement) => h('span') },
  SfOverlay: {
    props: ['visible'],
    render (this: Vue & { visible: boolean }, h: Vue.CreateElement) {
      return h('div', { class: 'overlay-stub', attrs: { 'data-visible': String(this.visible) } });
    }
  }
}));

jest.mock('src/modules/currency', () => ({
  CurrencySelector: { render: mockRenderEmpty }
}));

jest.mock('theme/components/atoms/a-logo.vue', () => ({
  __esModule: true,
  default: { render: mockRenderEmpty }
}));

jest.mock('theme/components/atoms/a-account-icon.vue', () => ({
  __esModule: true,
  default: { render: mockRenderEmpty }
}));

jest.mock('theme/components/atoms/a-detailed-cart-icon.vue', () => ({
  __esModule: true,
  default: { render: mockRenderEmpty }
}));

jest.mock('theme/components/molecules/m-cta-button.vue', () => ({
  __esModule: true,
  default: { render: mockRenderEmpty }
}));

jest.mock('theme/components/molecules/m-menu.vue', () => ({
  __esModule: true,
  default: {
    props: ['visible'],
    render (this: Vue & { visible: boolean }, h: Vue.CreateElement) {
      return h('div', { class: 'm-menu sf-mega-menu', attrs: { 'data-visible': String(this.visible) } }, [
        h('a', { class: 'submenu-link', attrs: { href: '/submenu-link/' } }, 'Submenu link')
      ]);
    }
  }
}));

jest.mock('theme/components/molecules/m-educators-menu.vue', () => ({
  __esModule: true,
  default: {
    props: ['visible'],
    render (this: Vue & { visible: boolean }, h: Vue.CreateElement) {
      return h('div', { class: 'm-educators-menu sf-mega-menu', attrs: { 'data-visible': String(this.visible) } }, [
        h('a', { class: 'submenu-link', attrs: { href: '/teachers-link/' } }, 'Educators link')
      ]);
    }
  }
}));

describe('Header menus keyboard disclosure', () => {
  let wrapper: Wrapper<Vue> | undefined;
  let outsideButton: HTMLButtonElement;

  const mountHeader = () => mount(OHeader as any, {
    attachTo: document.body,
    localVue,
    store: new Vuex.Store({
      state: { ui: { searchpanel: false } },
      modules: {
        user: {
          namespaced: true,
          getters: { isLoggedIn: () => false }
        }
      }
    }),
    stubs: {
      'router-link': RouterLinkStub,
      SfHeaderNavigationItem: {
        template: '<div class="sf-header-navigation-item" v-on="$listeners"><slot /></div>'
      }
    },
    mocks: {
      $t: (message: string) => message
    }
  });

  const getWrapper = () => {
    if (!wrapper) {
      throw new Error('OHeader is not mounted');
    }

    return wrapper;
  };
  const findProductsItem = () => getWrapper().findAll('.sf-header-navigation-item').at(0);
  const findToggle = () => getWrapper().find('.o-header__submenu-toggle');
  const findMenu = () => getWrapper().find('.m-menu');
  const isMenuVisible = () => findMenu().attributes('data-visible') === 'true';
  const findEducatorsItem = () => getWrapper().findAll('.sf-header-navigation-item').at(1);
  const findEducatorsToggle = () => findEducatorsItem().find('.o-header__submenu-toggle');
  const findEducatorsMenu = () => getWrapper().find('.m-educators-menu');
  const isEducatorsMenuVisible = () => findEducatorsMenu().attributes('data-visible') === 'true';
  const pressEscape = async () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await Vue.nextTick();
  };

  beforeEach(() => {
    outsideButton = document.createElement('button');
    document.body.appendChild(outsideButton);
    wrapper = mountHeader();
  });

  afterEach(() => {
    wrapper?.destroy();
    wrapper = undefined;
    outsideButton.remove();
  });

  it('keeps the menu closed when the title link receives focus', async () => {
    const titleLink = findProductsItem().find('a');

    (titleLink.element as HTMLElement).focus();
    await titleLink.trigger('focusin');

    expect(isMenuVisible()).toBe(false);
    expect(titleLink.attributes('aria-expanded')).toBeUndefined();
  });

  it('toggles the menu with the disclosure button', async () => {
    const toggle = findToggle();

    expect(toggle.attributes('aria-expanded')).toBe('false');
    expect(toggle.attributes('aria-controls')).toBe(findMenu().attributes('id'));

    await toggle.trigger('click');

    expect(toggle.attributes('aria-expanded')).toBe('true');
    expect(isMenuVisible()).toBe(true);
    expect(findProductsItem().classes()).toContain('_expanded');
    expect(getWrapper().find('.overlay-stub').attributes('data-visible')).toBe('true');

    await toggle.trigger('click');

    expect(toggle.attributes('aria-expanded')).toBe('false');
    expect(isMenuVisible()).toBe(false);
  });

  it('closes the menu on Escape from a submenu link and focuses the toggle', async () => {
    await findToggle().trigger('click');
    (findMenu().find('.submenu-link').element as HTMLElement).focus();

    await pressEscape();

    expect(isMenuVisible()).toBe(false);
    expect(findToggle().attributes('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(findToggle().element);

    await findToggle().trigger('focusin');

    expect(isMenuVisible()).toBe(false);
  });

  it('keeps a hover-opened menu dismissed until the pointer re-enters', async () => {
    const productsItem = findProductsItem();

    await productsItem.trigger('mouseover');
    expect(isMenuVisible()).toBe(true);

    await pressEscape();

    expect(isMenuVisible()).toBe(false);
    expect(productsItem.classes()).toContain('_hover-dismissed');
    expect(document.activeElement).not.toBe(findToggle().element);

    await productsItem.trigger('mouseover');
    expect(isMenuVisible()).toBe(false);

    await productsItem.trigger('mouseleave');
    await productsItem.trigger('mouseover');

    expect(isMenuVisible()).toBe(true);
    expect(productsItem.classes()).not.toContain('_hover-dismissed');
  });

  it('collapses the keyboard-opened menu when focus leaves the navigation item', async () => {
    const productsItem = findProductsItem();

    await findToggle().trigger('click');
    await productsItem.trigger('focusout', { relatedTarget: findMenu().find('.submenu-link').element });

    expect(isMenuVisible()).toBe(true);

    await productsItem.trigger('focusout', { relatedTarget: outsideButton });

    expect(isMenuVisible()).toBe(false);
  });

  it('ignores Escape while the menu is closed', async () => {
    outsideButton.focus();

    await pressEscape();

    expect(document.activeElement).toBe(outsideButton);
    expect(findProductsItem().classes()).not.toContain('_hover-dismissed');
  });

  it('toggles the Educators menu with its own disclosure button', async () => {
    const toggle = findEducatorsToggle();

    expect(findEducatorsItem().find('a').attributes('aria-expanded')).toBeUndefined();
    expect(toggle.attributes('aria-controls')).toBe(findEducatorsMenu().attributes('id'));

    await toggle.trigger('click');

    expect(toggle.attributes('aria-expanded')).toBe('true');
    expect(isEducatorsMenuVisible()).toBe(true);
    expect(findEducatorsItem().classes()).toContain('_expanded');
  });

  it('closes the Educators menu on Escape from a submenu link and focuses its toggle', async () => {
    await findEducatorsToggle().trigger('click');
    (findEducatorsMenu().find('.submenu-link').element as HTMLElement).focus();

    await pressEscape();

    expect(isEducatorsMenuVisible()).toBe(false);
    expect(document.activeElement).toBe(findEducatorsToggle().element);
  });

  it('keeps a hover-opened Educators menu dismissed until the pointer re-enters', async () => {
    const educatorsItem = findEducatorsItem();

    await educatorsItem.trigger('mouseover');
    await pressEscape();

    expect(isEducatorsMenuVisible()).toBe(false);
    expect(educatorsItem.classes()).toContain('_hover-dismissed');

    await educatorsItem.trigger('mouseover');
    expect(isEducatorsMenuVisible()).toBe(false);

    await educatorsItem.trigger('mouseleave');
    await educatorsItem.trigger('mouseover');
    expect(isEducatorsMenuVisible()).toBe(true);
  });

  it('closes the other menu when one menu is opened', async () => {
    await findToggle().trigger('click');
    await findEducatorsToggle().trigger('click');

    expect(isMenuVisible()).toBe(false);
    expect(isEducatorsMenuVisible()).toBe(true);

    await findProductsItem().trigger('mouseover');

    expect(isMenuVisible()).toBe(true);
    expect(isEducatorsMenuVisible()).toBe(false);
  });

  it('removes the document Escape listener on destroy', () => {
    const removeEventListener = jest.spyOn(document, 'removeEventListener');

    getWrapper().destroy();
    wrapper = undefined;

    expect(removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    removeEventListener.mockRestore();
  });
});
