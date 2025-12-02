import { onMounted } from '@vue/composition-api';

const ONE_PASSWORD_INPUT_IGNORE_ATTRIBUTE = 'data-1p-ignore';

export function use1PasswordDisable (
  getInputElement: () => HTMLInputElement | Element | null | undefined
) {
  onMounted(() => {
    const inputElement = getInputElement();

    if (!inputElement) {
      return;
    }

    inputElement.setAttribute(ONE_PASSWORD_INPUT_IGNORE_ATTRIBUTE, '');
  });
}
