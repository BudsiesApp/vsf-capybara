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

function mockMenu (className: string) {
  return {
    __esModule: true,
    default: {
      props: ['visible'],
      render (this: Vue & { visible: boolean }, h: Vue.CreateElement) {
        return h('div', { class: `${className} sf-mega-menu`, attrs: { 'data-visible': String(this.visible) } }, [
          h('a', { class: 'submenu-link', attrs: { href: '/submenu-link/' } }, 'Submenu link')
        ]);
      }
    }
  };
}

jest.mock('theme/components/molecules/m-about-menu.vue', () => mockMenu('m-about-menu'));
jest.mock('theme/components/molecules/m-menu.vue', () => mockMenu('m-menu'));

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
  const menus = [
    { name: 'About', index: 0, menuClass: '.m-about-menu' },
    { name: 'Products', index: 1, menuClass: '.m-menu' }
  ];
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

  describe.each(menus)('$name menu', ({ index, menuClass }) => {
    const findItem = () => getWrapper().findAll('.sf-header-navigation-item').at(index);
    const findTitleButton = () => findItem().find('.o-header__submenu-button');
    const findMenu = () => getWrapper().find(menuClass);
    const isMenuVisible = () => findMenu().attributes('data-visible') === 'true';
    const clickTitleWithPointer = async () => {
      findTitleButton().element.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
      await Vue.nextTick();
    };

    it('uses the title as the disclosure button and keeps the menu closed on focus', async () => {
      const titleButton = findTitleButton();

      expect(titleButton.element.tagName).toBe('BUTTON');
      expect(titleButton.attributes('role')).toBeUndefined();
      expect(titleButton.attributes('aria-controls')).toBe(findMenu().attributes('id'));
      expect(findItem().findAll('.o-header__submenu-toggle').length).toBe(0);

      (titleButton.element as HTMLElement).focus();
      await titleButton.trigger('focusin');

      expect(isMenuVisible()).toBe(false);
      expect(titleButton.attributes('aria-expanded')).toBe('false');
    });

    it('toggles the menu with the title button', async () => {
      await findTitleButton().trigger('click');

      expect(findTitleButton().attributes('aria-expanded')).toBe('true');
      expect(isMenuVisible()).toBe(true);
      expect(findItem().classes()).toContain('_expanded');
      expect(getWrapper().find('.overlay-stub').attributes('data-visible')).toBe('true');

      await findTitleButton().trigger('click');

      expect(findTitleButton().attributes('aria-expanded')).toBe('false');
      expect(isMenuVisible()).toBe(false);
    });

    it('closes the menu on Escape from a submenu link and focuses the title button', async () => {
      await findTitleButton().trigger('click');
      (findMenu().find('.submenu-link').element as HTMLElement).focus();

      await pressEscape();

      expect(isMenuVisible()).toBe(false);
      expect(document.activeElement).toBe(findTitleButton().element);
    });

    it('keeps a hover-opened menu dismissed until the pointer re-enters', async () => {
      const item = findItem();

      await item.trigger('mouseover');
      await pressEscape();

      expect(isMenuVisible()).toBe(false);
      expect(item.classes()).toContain('_hover-dismissed');

      await item.trigger('mouseover');
      expect(isMenuVisible()).toBe(false);

      await item.trigger('mouseleave');
      await item.trigger('mouseover');
      expect(isMenuVisible()).toBe(true);
    });

    it('keeps a mouse-clicked menu open only while the pointer is over the item', async () => {
      const item = findItem();

      await item.trigger('mouseover');
      await clickTitleWithPointer();

      expect(isMenuVisible()).toBe(true);
      expect(item.classes()).not.toContain('_expanded');

      await clickTitleWithPointer();
      expect(isMenuVisible()).toBe(true);

      await item.trigger('mouseleave');
      expect(isMenuVisible()).toBe(false);
    });

    it('reopens an Escape-dismissed menu on mouse click', async () => {
      const item = findItem();

      await item.trigger('mouseover');
      await pressEscape();
      await clickTitleWithPointer();

      expect(isMenuVisible()).toBe(true);
      expect(item.classes()).not.toContain('_hover-dismissed');

      await item.trigger('mouseleave');
      expect(isMenuVisible()).toBe(false);
    });

    it('collapses the keyboard-opened menu when focus leaves the navigation item', async () => {
      await findTitleButton().trigger('click');
      await findItem().trigger('focusout', { relatedTarget: findMenu().find('.submenu-link').element });

      expect(isMenuVisible()).toBe(true);

      await findItem().trigger('focusout', { relatedTarget: outsideButton });

      expect(isMenuVisible()).toBe(false);
    });
  });

  it('ignores Escape while the menus are closed', async () => {
    outsideButton.focus();

    await pressEscape();

    expect(document.activeElement).toBe(outsideButton);
  });

  it('removes the document Escape listener on destroy', () => {
    const removeEventListener = jest.spyOn(document, 'removeEventListener');

    getWrapper().destroy();
    wrapper = undefined;

    expect(removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    removeEventListener.mockRestore();
  });
});
