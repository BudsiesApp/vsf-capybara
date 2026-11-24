import { shallowMount } from '@vue/test-utils';
import PhoneInput from './m-phone-input.vue';

jest.mock('@vue-storefront/core/application-services', () => ({
  useI18n: () => ({ t: (key: string) => key })
}));
jest.mock('@storefront-ui/vue', () => ({ SfInput: { name: 'SfInput' } }));

describe('international phone input', () => {
  const SfInputStub = {
    props: ['value', 'valid', 'errorMessage'],
    template: `
      <div>
        <input
          :value="value"
          @input="$emit('input', $event.target.value)"
        >
        <span v-if="!valid" role="alert">{{ errorMessage }}</span>
      </div>
    `
  };

  function mountPhone (value = '') {
    return shallowMount(PhoneInput, {
      propsData: { value },
      mocks: { $t: (key: string) => key },
      stubs: { SfInput: SfInputStub }
    });
  }

  it('shows only the calling code in the collapsed selector', async () => {
    const wrapper = mountPhone();

    expect(wrapper.find('.phone-input__calling-code').text()).toContain('+1');
    expect(wrapper.find('.phone-input__calling-code').text()).not.toContain('United States');

    await wrapper.find('select').setValue('GB');

    expect(wrapper.find('.phone-input__calling-code').text()).toContain('+44');
    expect(wrapper.find('option[value="GB"]').text()).toBe('United Kingdom (+44)');
  });

  it('accepts a shared-code national number without changing country', async () => {
    const wrapper = mountPhone();

    await wrapper.find('input').setValue('416 555 0123');

    expect(wrapper.find('select').element.value).toBe('US');
    expect(wrapper.emitted('input')?.pop()).toEqual(['+14165550123']);
    expect(wrapper.emitted('validity')?.pop()).toEqual([true]);
  });

  it('retains partial international input and resolves a valid pasted number', async () => {
    const wrapper = mountPhone();
    const input = wrapper.find('input');
    const inputElement = input.element as HTMLInputElement;

    await input.setValue('+1');

    expect(inputElement.value).toBe('+1');
    expect(wrapper.emitted('input')?.pop()).toEqual(['']);

    await input.setValue('+1 416');

    expect(wrapper.find('select').element.value).toBe('US');
    expect(inputElement.value).toBe('+1 416');

    await input.setValue('+1 416 555 0123');

    expect(wrapper.find('select').element.value).toBe('CA');
    expect(inputElement.value).toBe('4165550123');
    expect(wrapper.emitted('input')?.pop()).toEqual(['+14165550123']);
  });

  it('recognizes US numbers entered internationally', async () => {
    const wrapper = mountPhone();

    await wrapper.find('input').setValue('+1 212 555 0123');

    expect(wrapper.find('select').element.value).toBe('US');
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('2125550123');
  });

  it('normalizes international input through the input event', async () => {
    const wrapper = mountPhone();

    await wrapper.find('input').setValue('+44 20 7946 0018');

    expect(wrapper.find('select').element.value).toBe('GB');
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('2079460018');
    expect(wrapper.emitted('input')?.pop()).toEqual(['+442079460018']);
  });

  it('uses a calling-code fallback only for a complete possible number', async () => {
    const wrapper = mountPhone();
    const input = wrapper.find('input');
    const inputElement = input.element as HTMLInputElement;

    await wrapper.find('select').setValue('CA');
    await input.setValue('+44');

    expect(wrapper.find('select').element.value).toBe('CA');
    expect(inputElement.value).toBe('+44');

    await input.setValue('+1 555 555 5555');

    expect(wrapper.find('select').element.value).toBe('CA');
    expect(inputElement.value).toBe('5555555555');
    expect(wrapper.emitted('validity')?.pop()).toEqual([false]);

    await wrapper.find('select').setValue('GB');
    await input.setValue('+1 555 555 5555');

    expect(wrapper.find('select').element.value).toBe('US');
  });

  it('restores and clears a parent value', async () => {
    const wrapper = mountPhone('+442079460018');

    expect(wrapper.find('select').element.value).toBe('GB');
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('2079460018');

    await wrapper.setProps({ value: '' });

    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('');
  });

  it('accepts and restores a non-geographic international phone without changing the country', async () => {
    const wrapper = mountPhone();

    await wrapper.find('input').setValue('+80012345678');

    expect(wrapper.find('select').element.value).toBe('US');
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('+80012345678');
    expect(wrapper.emitted('input')?.pop()).toEqual(['+80012345678']);
    expect(wrapper.emitted('validity')?.pop()).toEqual([true]);

    const restored = mountPhone('+80012345678');

    expect((restored.find('input').element as HTMLInputElement).value).toBe('+80012345678');
  });

  it('keeps invalid editing text on a parent echo and displays a parent-controlled error', async () => {
    const wrapper = mountPhone('+12125550123');

    await wrapper.find('input').setValue('123');

    expect(wrapper.emitted('input')?.pop()).toEqual(['']);
    expect(wrapper.emitted('validity')?.pop()).toEqual([false]);

    await wrapper.setProps({ value: '', showError: true });

    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('123');
    expect(wrapper.find('[role="alert"]').exists()).toBe(true);
  });
});
