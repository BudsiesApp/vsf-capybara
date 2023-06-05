import { ComputedRef, Ref, computed, onMounted, onUnmounted, ref } from '@vue/composition-api';

import { isServer } from '@vue-storefront/core/helpers';

const LAZY_LOADING_ACTIVATION_BREAKPOINT = 1024;

export function useItemsLazyLoading (
  itemsLoadAction: () => Promise<void>
): {
    isLazyLoadingEnabled: ComputedRef<boolean>,
    browserWidth: Ref<number>,
    isLoadingItems: Ref<boolean>,
    loadItems: () => Promise<void>
  } {
  const browserWidth = ref(0);
  const isLoadingItems = ref(false);

  const isLazyLoadingEnabled = computed(() => {
    return !isServer && browserWidth.value < LAZY_LOADING_ACTIVATION_BREAKPOINT;
  });

  function onResizeHandler (): void {
    browserWidth.value = window.innerWidth;
  }

  async function loadItems (): Promise<void> {
    if (!isLazyLoadingEnabled.value || isLoadingItems.value) {
      return;
    }

    isLoadingItems.value = true;
    await itemsLoadAction();
    isLoadingItems.value = false;
  }

  onMounted(() => {
    window.addEventListener('resize', onResizeHandler);
    onResizeHandler();
  });

  onUnmounted(() => {
    window.removeEventListener('resize', onResizeHandler);
  });

  return {
    isLazyLoadingEnabled,
    browserWidth,
    isLoadingItems,
    loadItems
  }
}
