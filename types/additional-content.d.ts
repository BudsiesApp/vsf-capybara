import Vue, { VueConstructor } from 'vue';

declare module 'core/types/additional-content' {
  interface AdditionalContent {
    footerLinks?: {component: VueConstructor<Vue>, key: string}[]
  }
}
