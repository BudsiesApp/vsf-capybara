import Vue, { defineComponent, ref } from 'vue';
import { mount, Wrapper } from '@vue/test-utils';

describe('Vue 2.7 template ref behavior', () => {
  let wrapper: Wrapper<Vue> | undefined;

  afterEach(() => {
    wrapper?.destroy();
    wrapper = undefined;
  });

  it('assigns and clears static and conditionally rendered setup refs', async () => {
    const staticTarget = ref<HTMLElement | null>(null);
    const conditionalTarget = ref<HTMLElement | null>(null);
    const isConditionalTargetVisible = ref(true);
    const Fixture = defineComponent({
      name: 'StaticConditionalRefFixture',
      template: `
        <div>
          <span ref="staticTarget">static</span>
          <input v-if="isConditionalTargetVisible" ref="conditionalTarget">
        </div>
      `,
      setup () {
        return {
          conditionalTarget,
          isConditionalTargetVisible,
          staticTarget
        };
      }
    });

    wrapper = mount(Fixture as any);
    expect(staticTarget.value).toBeInstanceOf(HTMLSpanElement);
    expect(conditionalTarget.value).toBeInstanceOf(HTMLInputElement);

    isConditionalTargetVisible.value = false;
    await Vue.nextTick();
    expect(staticTarget.value).toBeInstanceOf(HTMLSpanElement);
    expect(conditionalTarget.value).toBeNull();

    isConditionalTargetVisible.value = true;
    await Vue.nextTick();
    expect(conditionalTarget.value).toBeInstanceOf(HTMLInputElement);
  });

  it('records repeated setup-ref behavior through reorder and removal', async () => {
    const optionRefs = ref<HTMLElement[]>([]);
    const options = ref([
      { id: 'first', label: 'First' },
      { id: 'second', label: 'Second' }
    ]);
    const Fixture = defineComponent({
      name: 'RepeatedRefFixture',
      template: `
        <div>
          <button
            v-for="option in options"
            :key="option.id"
            ref="optionRefs"
            :data-option-id="option.id"
          >
            {{ option.label }}
          </button>
        </div>
      `,
      setup () {
        return {
          optionRefs,
          options
        };
      }
    });

    wrapper = mount(Fixture as any);
    const getOptionIds = () => optionRefs.value.map(
      element => element.dataset.optionId
    );
    expect(getOptionIds()).toEqual(['first', 'second']);

    options.value = [options.value[1], options.value[0]];
    await Vue.nextTick();
    expect(wrapper.findAll('button').wrappers.map(
      button => button.attributes('data-option-id')
    )).toEqual(['second', 'first']);
    expect(getOptionIds()).toEqual(['first', 'second']);

    options.value = [options.value[0]];
    await Vue.nextTick();
    expect(getOptionIds()).toEqual(['second']);
  });
});
