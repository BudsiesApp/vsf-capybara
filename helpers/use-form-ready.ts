import {
  computed,
  onMounted,
  Ref,
  ref,
  SetupContext,
  watch
} from '@vue/composition-api';

export function useFormReady (
  formKey: Ref<string | undefined>,
  storyDependencies: Ref<string[]>,
  context: SetupContext,
  onFormReady: undefined | (() => void)
) {
  const mountedKey: Ref<string | undefined> = ref(undefined);
  const readyStoryDependencies: Ref<Record<string, boolean>> = ref({});
  const emittedFormReadyKey: Ref<string | undefined> = ref(undefined);

  function markMountedReady (): void {
    mountedKey.value = formKey.value;
  }

  function onStoryReady (
    dependencyName: string
  ): void {
    readyStoryDependencies.value = {
      ...readyStoryDependencies.value,
      [dependencyName]: true
    };
  }

  const isFormReady = computed<boolean>(() => {
    const currentFormKey = formKey.value;

    if (!currentFormKey || mountedKey.value !== currentFormKey) {
      return false;
    }

    if (storyDependencies.value.length === 0) {
      return true;
    }

    return Object.values(readyStoryDependencies.value).every((item) => item);
  });

  onMounted(() => {
    markMountedReady();
  });

  watch(formKey, () => {
    mountedKey.value = undefined;
    readyStoryDependencies.value = {};
    emittedFormReadyKey.value = undefined;
    markMountedReady();
  });

  watch(
    isFormReady,
    (value) => {
      const currentFormKey = formKey.value;

      if (!value || !currentFormKey || emittedFormReadyKey.value === currentFormKey) {
        return;
      }

      emittedFormReadyKey.value = currentFormKey;

      if (onFormReady) {
        return onFormReady();
      }

      context.emit('form-ready');
    },
    { immediate: true }
  );

  return {
    onStoryReady
  };
}
