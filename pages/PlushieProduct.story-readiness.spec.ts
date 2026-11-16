import Vuex from 'vuex';
import Vue from 'vue';
import { shallowMount } from '@vue/test-utils';
import { useStore } from '@vue-storefront/core/application-services';
import { emitPageRenderedEvent } from 'src/modules/shared';

import Page from './PlushieProduct.vue';
import BlockStory from 'theme/components/molecules/m-block-story.vue';
import { PlushieType } from 'theme/interfaces/plushie.type';

jest.mock('@vue-storefront/core/application-services', () => ({ useStore: jest.fn() }));
jest.mock('@vue-storefront/core/request-services', () => ({
  useRequestServices: () => ({ host: 'test' })
}));
jest.mock('src/modules/vsf-storyblok-module', () => ({
  ...require('src/modules/vsf-storyblok-module/composables/use-storyblok-readiness-tracker'),
  ...require('src/modules/vsf-storyblok-module/helpers/wait-for-storyblok-content-render.function')
}));
jest.mock('src/modules/shared', () => ({
  emitPageRenderedEvent: jest.fn(),
  ProductEvent: {},
  ProductPurchaseFlow: { CUSTOMIZE_LATER: 'later' }
}));
jest.mock('@vue-storefront/core/compatibility/plugins/event-bus', () => ({
  __esModule: true,
  default: { $on: jest.fn(), $off: jest.fn(), $emit: jest.fn() }
}));
jest.mock('@vue-storefront/core/filters', () => ({ htmlDecode: value => value }));
jest.mock('@vue-storefront/core/helpers', () => ({
  isServer: false,
  onlineHelper: { isOnline: true }
}));
jest.mock('@vue-storefront/core/lib/multistore', () => ({ localizedRoute: value => value }));
jest.mock('@storefront-ui/vue', () => ({ SfHeading: {} }));
async function flushRenderQueue (): Promise<void> {
  for (let turn = 0; turn < 5; turn++) {
    await Vue.nextTick();
  }
}
jest.mock('@vue-storefront/core/i18n', () => ({
  __esModule: true,
  default: { t: value => value }
}));
jest.mock('@vue-storefront/core/modules/catalog/store/product/mutation-types', () => ({
  __esModule: true,
  default: {},
  PRODUCT_UNSET_CURRENT: jest.fn(() => ({}))
}));
jest.mock('theme/helpers/use-existing-cart-item', () => ({
  __esModule: true,
  default: {},
  useExistingCartItem: () => ({ existingCartItem: require('vue').ref(undefined) })
}));
jest.mock('theme/components/customization-system/forms/creation-wizard-form.vue', () => ({
  __esModule: true,
  default: {}
}));

it('reports cached Forevers to Golf to Forevers once per current type', async () => {
  Vue.use(Vuex);
  jest.useFakeTimers();

  const stories = Object.fromEntries(
    ['petsies_creation_page_top', 'golf_cover_creation_page_top'].map(slug => [
      `blocks/${slug}`,
      { story: { content: {} } }
    ])
  );
  const store = new Vuex.Store({
    actions: {
      'storyblok/loadStory': ({ state }, { fullSlug }) => state.storyblok.stories[fullSlug]?.story
    },
    state: { storyblok: { stories } }
  });

  (useStore as jest.Mock).mockReturnValue(store);
  (emitPageRenderedEvent as jest.Mock).mockClear();

  const wrapper = shallowMount(Page, {
    propsData: { plushieType: PlushieType.FOREVERS },
    store,
    stubs: { MBlockStory: BlockStory }
  });

  for (const [index, type] of [
    PlushieType.FOREVERS,
    PlushieType.GOLF_COVERS,
    PlushieType.FOREVERS
  ].entries()) {
    if (index) {
      await wrapper.setProps({ plushieType: type });
    }

    await flushRenderQueue();

    expect(emitPageRenderedEvent).toHaveBeenCalledTimes(index);

    jest.runOnlyPendingTimers();
    await flushRenderQueue();

    expect(emitPageRenderedEvent).toHaveBeenCalledTimes(index + 1);
  }
  wrapper.destroy();
  jest.useRealTimers();
});

jest.mock('src/modules/vsf-storyblok-module/components', () => ({
  components: { block: { render: h => h('div') } },
  loadStoryblokComponentGroup: jest.fn().mockResolvedValue(undefined),
  StoryblokComponentGroup: { CORE: 'core' }
}));
