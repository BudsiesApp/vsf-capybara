import { Options } from '@glidejs/glide';

declare module '@glidejs/glide' {
  interface Static {
    /* eslint-disable  @typescript-eslint/no-misused-new */
    new (selector: string | HTMLElement, options?: Options): Static
  }
}
