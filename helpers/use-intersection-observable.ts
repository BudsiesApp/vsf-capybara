import { Ref, onMounted, onUnmounted, unref } from '@vue/composition-api';

export function useIntersectionObservable (
  observableElement: Ref<Element | null>,
  onIntersectHandler: () => void,
  intersectionObserverOptions: IntersectionObserverInit = {
    threshold: 1
  }
): void {
  let intersectionObserver: IntersectionObserver | undefined;

  function intersectionObserverCallback (
    entries: IntersectionObserverEntry[]
  ) {
    const entry = entries[0];

    if (!entry || !entry.isIntersecting) {
      return;
    }

    onIntersectHandler();
  }

  onMounted(() => {
    if (!observableElement.value) {
      return;
    }

    intersectionObserver = new IntersectionObserver(
      intersectionObserverCallback,
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
