export const vuelidateErrorClassName = 'vuelidate--invalid';

export function vuelidateScrollToFirstError (formElement: HTMLElement): void {
  const firstError = formElement.querySelector(`.${vuelidateErrorClassName}`);
  firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
