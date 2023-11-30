export function vuelidateScrollToFirstError (): void {
  const firstError = document.querySelector('.vuelidate--invalid');
  firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
