import { nextTick, onMounted, ref } from 'vue';

interface FocusableComponent {
  $el: HTMLElement;
}

type FocusTarget = FocusableComponent | HTMLElement;

export const useHeadingFocus = () => {
  const heading = ref<FocusTarget | null>(null);

  const focusHeading = async () => {
    await nextTick();

    if (!heading.value) {
      return;
    }

    const element = '$el' in heading.value ? heading.value.$el : heading.value;

    element.focus();
  };

  onMounted(focusHeading);

  return { heading, focusHeading };
};
