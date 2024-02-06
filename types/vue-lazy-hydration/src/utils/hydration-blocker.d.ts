declare module 'vue-lazy-hydration/src/utils/hydration-blocker' {
  import Vue, { ComponentOptions } from 'vue';
  import { AsyncComponentPromise } from 'vue/types/options';
  import { ExtendedVue } from 'vue/types/vue';

  interface HydrationBlockerData {
    never?: boolean,
    whenVisible?: boolean | IntersectionObserverInit,
    whenIdle?: boolean,
    idleTimeout?: number,
    interactionEvents?: string[],
    Nonce: Vue
  }

  interface HydrationBlockerMethods {
    hydrate: () => void,
    hydrationPromise: Promise<void>,
    cleanup: () => void
  }

  type HydrationBlockerComponent = Vue & HydrationBlockerData & HydrationBlockerMethods;

  type MakeHydrationBlockerFunction = (
    component: Vue | (() => AsyncComponentPromise<Vue>),
    options: ComponentOptions<HydrationBlockerComponent>
  ) => ExtendedVue<Vue & HydrationBlockerComponent, any, any, any, any>;

  const makeHydrationBlocker: MakeHydrationBlockerFunction;

  export { makeHydrationBlocker }
}
