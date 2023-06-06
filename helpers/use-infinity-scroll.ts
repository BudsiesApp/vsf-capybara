import { ComputedRef, Ref, computed, onMounted, onUnmounted, ref } from '@vue/composition-api';

import { isServer } from '@vue-storefront/core/helpers';

import { useIntersectionObservable } from './use-intersection-observable';

const INFINITY_SCROLLING_ACTIVATION_BREAKPOINT = 1024;

export function useInfinityScroll (
  itemsLoadAction: () => Promise<void>,
  nextPageLoadingThreshold: Ref<Element | null>
): {
    isInfinityScrollingEnabled: ComputedRef<boolean>,
    isLoadingItems: Ref<boolean>
  } {
  const browserWidth = ref(0);
  const isLoadingItems = ref(false);

  const isInfinityScrollingEnabled = computed(() => {
    return !isServer && browserWidth.value < INFINITY_SCROLLING_ACTIVATION_BREAKPOINT;
  });

  function onResizeHandler (): void {
    browserWidth.value = window.innerWidth;
  }

  async function loadItems (): Promise<void> {
    if (!isInfinityScrollingEnabled.value || isLoadingItems.value) {
      return;
    }

    isLoadingItems.value = true;
    await itemsLoadAction();
    isLoadingItems.value = false;
  }

  function onIntersectHandler (
    entries: IntersectionObserverEntry[]
  ): void {
    const entry = entries[0];

    if (!entry || !entry.isIntersecting) {
      return;
    }

    void loadItems();
  }

  useIntersectionObservable(
    nextPageLoadingThreshold,
    onIntersectHandler
  )

  onMounted(() => {
    window.addEventListener('resize', onResizeHandler);
    onResizeHandler();
  });

  onUnmounted(() => {
    window.removeEventListener('resize', onResizeHandler);
  });

  return {
    isInfinityScrollingEnabled,
    isLoadingItems
  }
}
