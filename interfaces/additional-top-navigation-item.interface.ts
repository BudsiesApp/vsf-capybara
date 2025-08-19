import { RawLocation } from 'vue-router';

export interface AdditionalTopNavigationItem {
  label: string,
  icon: string,
  link: RawLocation,
  class: string
}
