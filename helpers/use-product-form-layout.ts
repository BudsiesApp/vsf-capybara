import { computed, ref, Ref } from 'vue';
import { isServer } from '@vue-storefront/core/helpers';

export enum LayoutType {
  WITH_IMAGES_GALLERY = 'with-images-gallery',
  VERTICAL = 'vertical',
  PHRASE_PILLOW = 'phrase-pillow',
  CREATION_WIZARD = 'creation-wizard',
}

export function useProductFormLayout (layout: Ref<LayoutType>) {
  const formComponent = computed<string>(() => {
    switch (layout.value) {
      case LayoutType.WITH_IMAGES_GALLERY:
        return 'form-with-images-gallery';
      case LayoutType.VERTICAL:
        return 'vertical-steps-form';
      case LayoutType.PHRASE_PILLOW:
        return 'phrase-pillow-form';
      case LayoutType.CREATION_WIZARD:
        return 'creation-wizard-form';
      default:
        return '';
    }
  });

  const formPlaceholderComponent = computed<string | undefined>(() => {
    switch (layout.value) {
      case LayoutType.WITH_IMAGES_GALLERY:
        return 'form-with-images-gallery-placeholder';
      case LayoutType.VERTICAL:
        return 'vertical-steps-form-placeholder';
      case LayoutType.PHRASE_PILLOW:
        return 'phrase-pillow-form-placeholder';
      case LayoutType.CREATION_WIZARD:
        return 'creation-wizard-form-placeholder';
      default:
        return undefined;
    }
  });

  const isFormMounted = ref(isServer);

  function onFormMounted () {
    isFormMounted.value = true;
  }

  return {
    formComponent,
    formPlaceholderComponent,
    isFormMounted,
    onFormMounted
  };
}
