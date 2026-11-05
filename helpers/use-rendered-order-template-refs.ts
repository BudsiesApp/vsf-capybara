import { ref, Ref } from 'vue';

interface ElementBackedRef {
  $el: Element
}

type RenderedTemplateRef = Element | ElementBackedRef;

function getElement (templateRef: RenderedTemplateRef): Element {
  return templateRef instanceof Element ? templateRef : templateRef.$el;
}

export function getTemplateRefsInRenderedOrder<T extends RenderedTemplateRef> (
  templateRefs: T | T[] | null
): T[] {
  const refs = Array.isArray(templateRefs)
    ? [...templateRefs]
    : templateRefs ? [templateRefs] : [];

  return refs.sort((firstRef, secondRef) => {
    const position = getElement(firstRef).compareDocumentPosition(
      getElement(secondRef)
    );

    if (position & Node.DOCUMENT_POSITION_DISCONNECTED) {
      return 0;
    }

    if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
      return -1;
    }

    if (position & Node.DOCUMENT_POSITION_PRECEDING) {
      return 1;
    }

    return 0;
  });
}

export function useRenderedOrderTemplateRefs<T extends RenderedTemplateRef> (): {
  templateRef: Ref<T | T[] | null>,
  getRefsInRenderedOrder: () => T[]
} {
  const templateRef: Ref<T | T[] | null> = ref(null);

  return {
    templateRef,
    getRefsInRenderedOrder: () =>
      getTemplateRefsInRenderedOrder(templateRef.value)
  };
}
