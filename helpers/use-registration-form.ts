import { ref } from 'vue';

export function useRegistrationForm () {
  const showRegistrationForm = ref<boolean>(false);
  const registrationToken = ref<string>('');

  function onRegistrationRequired (token: string) {
    showRegistrationForm.value = true;
    registrationToken.value = token;
  }

  return {
    onRegistrationRequired,
    showRegistrationForm,
    registrationToken
  }
}
