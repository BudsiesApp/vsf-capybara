import { onUnmounted, ref } from '@vue/composition-api';

export function useComponentUnmountedChecker () {
  const isUnmounted = ref<boolean>(false);

  onUnmounted(() => {
    isUnmounted.value = true;
  });

  return {
    isUnmounted
  }
}
