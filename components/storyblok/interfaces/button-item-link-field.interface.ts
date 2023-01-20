import { LinkField } from 'src/modules/vsf-storyblok-module';

export default interface ButtonItemLinkField extends Omit<LinkField, 'url'> {
  url?: string,
  email?: string
}
