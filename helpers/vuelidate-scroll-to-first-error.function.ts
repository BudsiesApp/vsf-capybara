export const vuelidateErrorClassName = 'vuelidate--invalid';

export function vuelidateScrollToFirstError (formElement: HTMLElement): void {
  const firstError = formElement.querySelector<HTMLElement>(`.${vuelidateErrorClassName}`);

  if (!firstError) {
    return;
  }

  firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });

  let focusable = firstError.querySelector<HTMLElement>('[tabindex="0"]');

  if (!focusable) {
    focusable = firstError.querySelector<HTMLElement>(
      'input, select, textarea, a[href], button:not([disabled])'
    );
  }

  focusable?.focus();
}
