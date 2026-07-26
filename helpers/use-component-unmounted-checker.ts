import { onUnmounted, ref } from 'vue';

export function useComponentUnmountedChecker () {
  const isUnmounted = ref<boolean>(false);

  onUnmounted(() => {
    isUnmounted.value = true;
  });

  return {
    isUnmounted
  }
}
