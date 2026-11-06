import { readFileSync } from 'fs';
import { join } from 'path';

import { mount } from '@vue/test-utils';

import ImageUploadWidget from './image-upload-widget.vue';

jest.mock('config', () => ({ images: { fileuploaderUploadUrl: 'https://uploads.example.test/upload' } }));
jest.mock('src/modules/customization-system', () => ({
  ...jest.requireActual('src/modules/customization-system/composables/use-files-upload')
}));
jest.mock('theme/helpers/use-backend-product-id', () => {
  const { computed } = jest.requireActual('vue');
  return { useBackendProductId: () => ({ backendProductId: computed(() => 'backend-product') }) };
});
jest.mock('theme/components/molecules/m-artwork-upload.vue', () => ({
  name: 'MArtworkUpload',
  props: ['appearance', 'ariaDescribedby', 'ariaInvalid', 'ariaLabelledby', 'disabled', 'productId', 'uploadUrl', 'allowMultiple', 'initialItems', 'maxFiles'],
  methods: { getFiles: () => [], initFiles: jest.fn(), uploadFiles: jest.fn() },
  render: h => h('div', { class: 'artwork-upload' })
}));

const first = { id: 'first', url: 'first.jpg' };
const second = { id: 'second', url: 'second.jpg' };

function mountWidget (propsData: Record<string, unknown> = {}) {
  return mount(ImageUploadWidget, {
    propsData: { productId: 7, ...propsData },
    provide: { ImageHandlerService: { getOriginalImageUrl: (url: string) => `original/${url}` } }
  });
}

function upload (wrapper: ReturnType<typeof mountWidget>) {
  return wrapper.findComponent({ name: 'MArtworkUpload' });
}

describe('image upload widget', () => {
  it('leaves the uploader appearance unset by default', () => {
    const wrapper = mountWidget();
    expect(upload(wrapper).props('appearance')).toBeUndefined();
    expect(wrapper.classes()).not.toContain('-appearance-order-history');
  });

  it('forwards the order history appearance to the uploader and marks its own root', () => {
    const wrapper = mountWidget({ appearance: 'order-history' });
    expect(upload(wrapper).props('appearance')).toBe('order-history');
    expect(wrapper.classes()).toContain('-appearance-order-history');
  });

  it.each([
    [undefined, true, null],
    [1, false, 1],
    [3, true, 3],
    [5, true, 5]
  ])('keeps the configured limit %s unchanged with the appearance', (maxValuesCount, allowMultiple, maxFiles) => {
    const plain = mountWidget({ maxValuesCount });
    const themed = mountWidget({ maxValuesCount, appearance: 'order-history' });
    for (const wrapper of [plain, themed]) {
      expect(upload(wrapper).props()).toMatchObject({ allowMultiple, maxFiles, productId: 'backend-product', uploadUrl: 'https://uploads.example.test/upload' });
    }
  });

  it('passes saved values to the uploader as initial items', () => {
    const wrapper = mountWidget({ appearance: 'order-history', value: [first, second], maxValuesCount: 5 });
    expect(upload(wrapper).props('initialItems')).toEqual([
      { id: 'first', url: 'original/first.jpg' },
      { id: 'second', url: 'original/second.jpg' }
    ]);
  });

  it('keeps the array value representation when files are processed for a multi-image field', () => {
    const wrapper = mountWidget({ appearance: 'order-history', value: [first], maxValuesCount: 5 });
    upload(wrapper).vm.$emit('file-added', second);
    upload(wrapper).vm.$emit('file-processed', second.id);
    expect(wrapper.emitted('input')).toEqual([[[first, second]]]);
    upload(wrapper).vm.$emit('file-removed', second.id);
    expect(wrapper.emitted('input')?.[1]).toEqual([[first]]);
  });

  it('keeps the scalar value representation for a single-image field', () => {
    const wrapper = mountWidget({ appearance: 'order-history', maxValuesCount: 1 });
    upload(wrapper).vm.$emit('file-added', first);
    upload(wrapper).vm.$emit('file-processed', first.id);
    expect(wrapper.emitted('input')).toEqual([[first]]);
    upload(wrapper).vm.$emit('file-removed', first.id);
    expect(wrapper.emitted('input')?.[1]).toEqual([undefined]);
  });

  it('forwards busy changes and the disabled state', () => {
    const wrapper = mountWidget({ appearance: 'order-history', isDisabled: true });
    expect(upload(wrapper).props('disabled')).toBe(true);
    upload(wrapper).vm.$emit('is-busy-changed', true);
    expect(wrapper.emitted('widget-busy-changed')).toEqual([[true]]);
  });

  it.each([[undefined], ['order-history']])('associates a real validation error with the uploader for appearance %s', (appearance) => {
    const wrapper = mountWidget({ appearance, error: 'Photos are required' });
    const message = wrapper.find('._error-message');
    expect(message.text()).toBe('Photos are required');
    expect(message.attributes('aria-live')).toBe('polite');
    expect(message.classes()).toContain('-has-error');
    expect(upload(wrapper).props('ariaInvalid')).toBe('true');
    expect(upload(wrapper).props('ariaDescribedby')).toBe(message.attributes('id'));
  });

  it.each([[undefined], ['order-history']])('keeps an empty polite live region without the error modifier for appearance %s', (appearance) => {
    const wrapper = mountWidget({ appearance });
    const message = wrapper.find('._error-message');
    expect(message.text()).toBe('');
    expect(message.attributes('aria-live')).toBe('polite');
    expect(message.classes()).not.toContain('-has-error');
    expect(upload(wrapper).props('ariaInvalid')).toBe('false');
    expect(upload(wrapper).props('ariaDescribedby')).toBeUndefined();
  });

  describe('spacing contract', () => {
    const source = readFileSync(join(__dirname, 'image-upload-widget.vue'), 'utf8');
    const style = (source.match(/<style lang="scss" scoped>([\s\S]*?)<\/style>/) || [])[1] || '';
    const appearance = style.slice(style.indexOf('&.-appearance-order-history'));
    const defaults = style.slice(style.indexOf('._error-message'), style.indexOf('&.-appearance-order-history'));

    it('reserves no blank height or margin for an empty message in the opt-in appearance', () => {
      expect(appearance).not.toMatch(/min-height|min-block-size/);
      expect(appearance).toMatch(/height:\s*auto;/);
      expect(appearance).toMatch(/margin-top:\s*0;/);
      expect(appearance).toMatch(/&\.-has-error\s*\{[^}]*margin-top:\s*var\(--spacer-xs\)/);
    });

    it('keeps the default fixed one-line message and spacing for other upload fields', () => {
      expect(defaults).toMatch(/height:\s*calc\(var\(--font-xs\) \* 1\.2\);/);
      expect(defaults).toMatch(/margin-top:\s*var\(--spacer-xs\);/);
    });
  });
});
