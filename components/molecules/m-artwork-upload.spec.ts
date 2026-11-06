import { readFileSync } from 'fs';
import { join } from 'path';

import { mount } from '@vue/test-utils';

import MArtworkUpload from './m-artwork-upload.vue';

let mockFiles: { status: number, serverId?: string }[] = [];

jest.mock('filepond', () => ({
  FileOrigin: { LOCAL: 3 },
  FileStatus: { PROCESSING_QUEUED: 9, PROCESSING: 3, LOADING: 7, PROCESSING_COMPLETE: 5 }
}));
jest.mock('filepond-plugin-file-validate-size', () => ({}));
jest.mock('filepond-plugin-file-validate-type', () => ({}));
jest.mock('filepond-plugin-image-exif-orientation', () => ({}));
jest.mock('filepond-plugin-image-preview', () => ({}));
jest.mock('filepond-plugin-image-transform', () => ({}));
jest.mock('vue-filepond', () => () => ({
  name: 'FilePond',
  inheritAttrs: false,
  methods: {
    getFiles: () => mockFiles,
    addFiles: jest.fn(),
    removeFiles: jest.fn(),
    browse: jest.fn()
  },
  render: h => h('div', { class: 'filepond-stub' })
}));
jest.mock('src/modules/file-storage', () => ({ ImageType: { Artwork: 'artwork' } }));
jest.mock('src/modules/budsies', () => ({}));
jest.mock('src/modules/shared', () => ({}));
jest.mock('theme/helpers/get-current-theme-class', () => () => '-skin-petsies');

const legacyLabelIdle = "Drag + Drop or <span class='filepond--label-action' tabindex='0' role='button'> Select File </span>";
const server = { uploadFile: jest.fn() };

function mountUpload (propsData: Record<string, unknown> = {}, translate = (key: string) => key) {
  return mount(MArtworkUpload, {
    propsData: { productId: 'backend-product', uploadUrl: 'https://uploads.example.test/upload', ...propsData },
    mocks: { $t: translate, $store: { commit: jest.fn() } },
    provide: {
      ErrorConverterService: { describeError: () => ['error'] },
      FileProcessingRepositoryFactory: { create: () => server },
      WindowObject: window
    }
  });
}

function pondAttrs (wrapper: ReturnType<typeof mountUpload>): Record<string, unknown> {
  const attrs = wrapper.findComponent({ name: 'FilePond' }).vm.$attrs as Record<string, unknown>;
  return Object.fromEntries(Object.entries(attrs).map(([key, value]) => [
    key.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase()),
    value
  ]));
}

function describeValue (value: unknown): unknown {
  return typeof value === 'function' ? '[function]' : JSON.parse(JSON.stringify(value));
}

function withoutPresentation (attrs: Record<string, unknown>) {
  const { labelIdle, styleItemPanelAspectRatio, server: serverOptions, ...rest } = attrs;
  return {
    rest: Object.fromEntries(Object.entries(rest).map(([key, value]) => [key, describeValue(value)])),
    handlers: Object.entries(serverOptions as Record<string, unknown>).map(([key, value]) => `${key}:${typeof value}`)
  };
}

beforeEach(() => {
  mockFiles = [];
});

describe('artwork upload default presentation', () => {
  it('keeps the legacy label, options and DOM when no appearance is set', () => {
    const wrapper = mountUpload({ allowMultiple: true, maxFiles: 5 });
    const attrs = pondAttrs(wrapper);

    expect(attrs.labelIdle).toBe(legacyLabelIdle);
    expect(attrs).not.toHaveProperty('styleItemPanelAspectRatio');
    expect(attrs).toMatchObject({
      acceptedFileTypes: 'image/gif, image/jpeg, image/png, image/heic, image/heif, application/pdf',
      imageTransformOutputMimeType: 'image/jpeg',
      maxFileSize: '20MB',
      allowDrop: false,
      dropOnElement: false
    });
    expect(wrapper.classes()).toEqual(['m-artwork-upload', '_drop-zone', '-skin-petsies', '-multiple-items']);
    expect(wrapper.attributes('style')).toBeUndefined();
    expect(wrapper.find('._error-text').exists()).toBe(false);
  });

  it('shows the max files warning only while it is active', async () => {
    const wrapper = mountUpload({ allowMultiple: true, maxFiles: 5 });
    (wrapper.vm as unknown as { showMaxFilesLimitWarning: () => void }).showMaxFilesLimitWarning();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('._error-text').text()).toBe('You can only upload {count} files');
    expect(wrapper.find('._error-text').attributes('aria-live')).toBeUndefined();
    wrapper.destroy();
  });
});

describe('artwork upload order history appearance', () => {
  it('adds only the native square tile ratio, a translated label and the layout modifier', () => {
    const wrapper = mountUpload({ appearance: 'order-history', allowMultiple: true, maxFiles: 5 });
    const attrs = pondAttrs(wrapper);

    expect(wrapper.classes()).toContain('-appearance-order-history');
    expect(attrs.styleItemPanelAspectRatio).toBe('1');
    expect(attrs.labelIdle).toBe("Drag + Drop photos or <span class='filepond--label-action' tabindex='0' role='button'>Select Photos</span>");
  });

  it('leaves the upload configuration identical to the default appearance', () => {
    const props = { allowMultiple: true, maxFiles: 5, initialItems: [{ id: 'saved', url: '/saved.jpg' }] };
    const plain = withoutPresentation(pondAttrs(mountUpload(props)));
    const themed = withoutPresentation(pondAttrs(mountUpload({ ...props, appearance: 'order-history' })));

    expect(themed.rest).toEqual(plain.rest);
    expect(themed.handlers).toEqual(plain.handlers);
    expect(themed.handlers).toEqual(['process:function', 'revert:function', 'load:function']);
  });

  it('escapes translated label text before it reaches the native label', () => {
    const wrapper = mountUpload({ appearance: 'order-history' }, key => `<img src=x onerror=1> ${key} & "q"`);
    const label = pondAttrs(wrapper).labelIdle as string;
    expect(label).not.toContain('<img');
    expect(label).toContain('&lt;img src=x onerror=1&gt; Drag + Drop photos or &amp; &quot;q&quot;');
    expect(label.match(/<span /g)).toHaveLength(1);
  });

  it.each([
    [null, '1', '2'],
    [undefined, '1', '2'],
    [1, '1', '1'],
    [2, '1', '1'],
    [3, '1', '2'],
    [5, '1', '2']
  ])('reserves rows for configured max %s without limiting it', (maxFiles, rows, mobileRows) => {
    const wrapper = mountUpload({ appearance: 'order-history', allowMultiple: true, maxFiles });
    const style = (wrapper.element as HTMLElement).style;
    expect(style.getPropertyValue('--artwork-upload-reserved-rows')).toBe(rows);
    expect(style.getPropertyValue('--artwork-upload-reserved-rows-mobile')).toBe(mobileRows);
    expect(pondAttrs(wrapper).maxFiles).toBe(maxFiles ?? null);
  });

  it('keeps the max files warning as an empty polite live region until it is shown', async () => {
    const wrapper = mountUpload({ appearance: 'order-history', allowMultiple: true, maxFiles: 3 });
    const warning = wrapper.find('._error-text');
    expect(warning.exists()).toBe(true);
    expect(warning.attributes('aria-live')).toBe('polite');
    expect(warning.text()).toBe('');
    expect(warning.classes()).not.toContain('-active');

    (wrapper.vm as unknown as { showMaxFilesLimitWarning: () => void }).showMaxFilesLimitWarning();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('._error-text').text()).toBe('You can only upload {count} files');
    expect(wrapper.find('._error-text').classes()).toContain('-active');
    expect(wrapper.find('._error-text').attributes('aria-live')).toBe('polite');
    wrapper.destroy();
  });

  it('keeps the single image options for a single image field', () => {
    const wrapper = mountUpload({ appearance: 'order-history', allowMultiple: false, maxFiles: 1 });
    expect(pondAttrs(wrapper)).toMatchObject({ allowMultiple: false, maxFiles: 1 });
    expect(wrapper.classes()).not.toContain('-multiple-items');
  });
});

describe('artwork upload events with the appearance', () => {
  it('still reports processed files and busy state', async () => {
    const wrapper = mountUpload({ appearance: 'order-history', allowMultiple: true, maxFiles: 5 });
    const pond = wrapper.findComponent({ name: 'FilePond' });

    mockFiles = [{ status: 3 }];
    pond.vm.$emit('processfilestart');
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('is-busy-changed')).toEqual([[true]]);

    mockFiles = [{ status: 5, serverId: 'server-id' }];
    pond.vm.$emit('processfile', null, mockFiles[0]);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('file-processed')).toEqual([['server-id']]);
    expect(wrapper.emitted('is-busy-changed')).toEqual([[true], [false]]);
  });
});

describe('artwork upload order history responsive contract', () => {
  const source = readFileSync(join(__dirname, 'm-artwork-upload.vue'), 'utf8');
  const scopedStyle = (source.match(/<style lang="scss" scoped>([\s\S]*?)<\/style>/) || [])[1] || '';
  const containerStyle = (source.match(/<style lang="scss">([\s\S]*?)<\/style>/) || [])[1] || '';

  it('sizes columns and the browse band from the uploader width, not the viewport', () => {
    const appearance = scopedStyle.slice(scopedStyle.indexOf('&.-appearance-order-history'));
    expect(appearance).toMatch(/container:\s*artwork-upload\s*\/\s*inline-size/);
    expect(appearance).not.toMatch(/@media/);
    expect(containerStyle).toMatch(/@container artwork-upload \(max-width: 26rem\)/);
    expect(containerStyle).not.toMatch(/@media/);
  });

  it('lets the narrow container rule override only variables that the scoped styles declare and read', () => {
    const properties = (containerStyle.match(/--[a-z-]+(?=:)/g) || []);
    expect(new Set(properties)).toEqual(new Set([
      '--artwork-upload-columns',
      '--artwork-upload-rows',
      '--artwork-upload-label-band'
    ]));
    for (const property of properties) {
      expect(scopedStyle).toContain(`${property}:`);
      expect(scopedStyle).toContain(`var(${property})`);
    }
  });

  it('reserves no blank height or margin for the empty warning, only while it is shown', () => {
    const appearance = scopedStyle.slice(scopedStyle.indexOf('&.-appearance-order-history'));
    const warning = appearance.slice(appearance.indexOf('._error-text'), appearance.indexOf('::v-deep'));
    expect(warning).not.toMatch(/min-height|min-block-size|height:/);
    expect(warning).toMatch(/margin-top:\s*0;/);
    expect(warning).toMatch(/&\.-active\s*\{[^}]*margin-top:\s*var\(--spacer-xs\)/);
  });

  it('applies the narrow rule only to the opt-in appearance', () => {
    expect(containerStyle).toContain('.m-artwork-upload.-appearance-order-history ._uploader');
  });
});
