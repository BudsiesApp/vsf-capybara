import Vuex from 'vuex';
import Vue, { ref } from 'vue';
import { shallowMount } from '@vue/test-utils';
import { useStore } from '@vue-storefront/core/application-services';
import { emitPageRenderedEvent } from 'src/modules/shared';

import Page from './ForeversCustomizeLater.vue';
import { useMultiProductsPage } from 'theme/helpers/use-multi-products-page';
import BlockStory from 'theme/components/molecules/m-block-story.vue';

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
jest.mock('@storefront-ui/vue', () => ({}));
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
jest.mock('src/modules/budsies', () => ({
  __esModule: true,
  default: {},
  ProductStructuredData: jest.fn(() => ({}))
}));
jest.mock('src/modules/customization-system', () => ({
  __esModule: true,
  default: {},
  Customization: jest.fn(() => ({})),
  CustomizationOptionValue: jest.fn(() => ({})),
  CustomizationType: jest.fn(() => ({})),
  OptionType: jest.fn(() => ({})),
  OptionValue: jest.fn(() => ({})),
  WidgetType: jest.fn(() => ({}))
}));
jest.mock('theme/helpers/use-existing-cart-item', () => ({
  __esModule: true,
  default: {},
  useExistingCartItem: () => ({ existingCartItem: require('vue').ref(undefined) })
}));
jest.mock('theme/helpers/use-multi-products-page', () => ({
  __esModule: true,
  default: {},
  useMultiProductsPage: jest.fn(() => ({}))
}));
jest.mock('theme/components/customization-system/customization-option.vue', () => ({
  __esModule: true,
  default: {}
}));
jest.mock('theme/components/customization-system/forms/form-with-images-gallery.vue', () => ({
  __esModule: true,
  default: {}
}));
jest.mock(
  'theme/components/customization-system/forms/placeholders/form-with-images-gallery-placeholder.vue',
  () => ({ __esModule: true, default: {} })
);

it('retains its rendered stable top slug without remounting when the selected SKU changes', async () => {
  Vue.use(Vuex);
  jest.useFakeTimers();

  const currentProduct = ref({ sku: 'A' });

  (useMultiProductsPage as jest.Mock).mockReturnValue({ currentProduct, isDataLoaded: ref(true) });

  const store = new Vuex.Store({
    actions: {
      'storyblok/loadStory': ({ state }, { fullSlug }) => state.storyblok.stories[fullSlug]?.story
    },
    state: {
      storyblok: { stories: { 'blocks/petsies_creation_page_top': { story: { content: {} } } } }
    }
  });

  (emitPageRenderedEvent as jest.Mock).mockClear();

  const Form = {
    name: 'FormWithImagesGallery',
    render(h) {
      return h('div', this.$scopedSlots.description?.({}));
    }
  };
  const wrapper = shallowMount(Page, {
    store,
    stubs: { FormWithImagesGallery: Form, MBlockStory: BlockStory }
  });

  await flushRenderQueue();

  const top = wrapper.findComponent(BlockStory).vm;
  const onStoryRendered = jest.fn();

  top.$on('story-rendered', onStoryRendered);
  wrapper.findComponent(Form).vm.$emit('form-ready');
  await flushRenderQueue();

  expect(emitPageRenderedEvent).not.toHaveBeenCalled();

  jest.runOnlyPendingTimers();
  await flushRenderQueue();

  expect(emitPageRenderedEvent).toHaveBeenCalledTimes(1);

  currentProduct.value = { sku: 'B' };
  await flushRenderQueue();

  expect(wrapper.findComponent(BlockStory).vm).toBe(top);
  expect(emitPageRenderedEvent).toHaveBeenCalledTimes(1);

  wrapper.findComponent(Form).vm.$emit('form-ready');
  await flushRenderQueue();

  expect(emitPageRenderedEvent).toHaveBeenCalledTimes(2);
  expect(onStoryRendered).toHaveBeenCalledTimes(1);

  wrapper.destroy();
  jest.useRealTimers();
});

jest.mock('src/modules/vsf-storyblok-module/components', () => ({
  components: { block: { render: h => h('div') } },
  loadStoryblokComponentGroup: jest.fn().mockResolvedValue(undefined),
  StoryblokComponentGroup: { CORE: 'core' }
}));
