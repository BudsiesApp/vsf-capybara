import { ref } from 'vue';

import { useErrorAccessibility } from './use-error-accessibility';

describe('useErrorAccessibility', () => {
  it('returns string tokens accepted by ARIA attributes and component props', () => {
    const hasError = ref(false);
    const { ariaInvalid } = useErrorAccessibility('test-widget', hasError);

    expect(ariaInvalid.value).toBe('false');

    hasError.value = true;

    expect(ariaInvalid.value).toBe('true');
  });
});
