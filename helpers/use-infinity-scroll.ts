import { ComputedRef, Ref, computed, onMounted, onUnmounted, ref } from '@vue/composition-api';

import { isServer } from '@vue-storefront/core/helpers';

import { useIntersectionObservable } from './use-intersection-observable';

const INFINITY_SCROLLING_ACTIVATION_BREAKPOINT = 1024;

export function useInfinityScroll (
  itemsLoadAction: () => Promise<void>,
  nextPageLoadingThreshold: Ref<Element | null>
): {
    isInfinityScrollingEnabled: ComputedRef<boolean>
  } {
  const browserWidth = ref(0);

  const isInfinityScrollingEnabled = computed(() => {
    return !isServer && browserWidth.value < INFINITY_SCROLLING_ACTIVATION_BREAKPOINT;
  });

  function onResizeHandler (): void {
    browserWidth.value = window.innerWidth;
  }

  async function loadItems (): Promise<void> {
    if (!isInfinityScrollingEnabled.value) {
      return;
    }

    await itemsLoadAction();
  }

  useIntersectionObservable(
    nextPageLoadingThreshold,
    loadItems
  )

  onMounted(() => {
    window.addEventListener('resize', onResizeHandler);
    onResizeHandler();
  });

  onUnmounted(() => {
    window.removeEventListener('resize', onResizeHandler);
  });

  return {
    isInfinityScrollingEnabled
  }
}
