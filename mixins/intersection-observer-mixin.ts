import Vue from 'vue';

export default Vue.extend({
  data () {
    return {
      intersectionObserver: undefined as IntersectionObserver | undefined,
      intersectionObserverOptions: undefined as IntersectionObserverInit | undefined
    }
  },
  mounted (): void {
    this.intersectionObserver = new IntersectionObserver(
      this.onIntersectHandler,
      this.intersectionObserverOptions
    );
    this.intersectionObserver.observe(this.getObservableElement());
  },
  beforeDestroy (): void {
    this.intersectionObserver?.unobserve(this.getObservableElement());
    this.intersectionObserver?.disconnect();
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
