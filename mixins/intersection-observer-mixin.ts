import Vue from 'vue';

export default Vue.extend({
  data () {
    const intersectionObserverOptions: IntersectionObserverInit = {
      threshold: 1
    }
    return {
      intersectionObserver: undefined as IntersectionObserver | undefined,
      intersectionObserverOptions
    }
  },
  mounted (): void {
    const observableElement = this.getObservableElement();

    if (!observableElement) {
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      this.onIntersectHandler,
      this.intersectionObserverOptions
    );

    this.intersectionObserver.observe(this.getObservableElement());
  },
  beforeDestroy (): void {
    if (!this.intersectionObserver) {
      return;
    }

    this.intersectionObserver.unobserve(this.getObservableElement());
    this.intersectionObserver.disconnect();
  },
  methods: {
    onIntersectHandler (
      entries: IntersectionObserverEntry[],
      observer: IntersectionObserver
    ): void {
      throw new Error(`'onIntersectHandler' is not implemented`);
    },
    getObservableElement (): Element {
      throw new Error(`'getObservableElement' is not implemented`);
    }
  }
});
