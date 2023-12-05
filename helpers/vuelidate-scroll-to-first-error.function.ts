export function vuelidateScrollToFirstError (errorClassName: string): void {
  const firstError = document.querySelector(`.${errorClassName}`);
  firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
