import { Ref, onMounted, onUnmounted, unref } from '@vue/composition-api';

export function useIntersectionObservable (
  observableElement: Ref<Element | null>,
  onIntersectHandler: (
    entries: IntersectionObserverEntry[],
    observer: IntersectionObserver
  ) => void,
  intersectionObserverOptions: IntersectionObserverInit = {
    threshold: 1
  }
): void {
  let intersectionObserver: IntersectionObserver | undefined;

  onMounted(() => {
    if (!observableElement.value) {
      return;
    }

    intersectionObserver = new IntersectionObserver(
      onIntersectHandler,
      intersectionObserverOptions
    );

    intersectionObserver.observe(observableElement.value);
  });

  onUnmounted(() => {
    if (!intersectionObserver) {
      return;
    }

    if (observableElement.value) {
      intersectionObserver.unobserve(observableElement.value);
    }

    intersectionObserver.disconnect();
  });
}
