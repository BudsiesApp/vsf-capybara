import { computed, inject, Ref, ref, set } from '@vue/composition-api';

import CartItem from 'core/modules/cart/types/CartItem';

import { Dictionary } from 'src/modules/budsies';
import { ImageHandlerService, Item } from 'src/modules/file-storage';
import { CustomerImage } from 'src/modules/shared';

export function useArtworkUpload (existingCartItem: Ref<CartItem | undefined>) {
  const imageHandlerService = inject<ImageHandlerService>('ImageHandlerService');
  const customerImage = ref<CustomerImage | undefined>();
  const artworkUploaderBusyState = ref<Dictionary<boolean>>({});
  const artworkUploadInitialItems = ref<CustomerImage[]>([]);
  const isSomeUploaderBusy = computed<boolean>(() => {
    return !!Object.values(artworkUploaderBusyState.value)
      .find((isBusy) => isBusy);
  });

  function fillExistingCartItemData (): void {
    const cartItem = existingCartItem.value;

    if (!cartItem || !cartItem.customerImages?.length) {
      (artworkUploadInitialItems as any).value = [];
      customerImage.value = undefined;
      return;
    }

    customerImage.value = cartItem.customerImages[0];
    (artworkUploadInitialItems as any).value = customerImage.value ? [customerImage.value] : [];
  }

  function onArtworkAdd (item: Item): void {
    if (!imageHandlerService) {
      throw new Error('ImageHandlerService is not defined');
    }

    customerImage.value = {
      id: item.id,
      url: imageHandlerService.getOriginalImageUrl(item.url)
    };
  }

  function onArtworkRemove (): void {
    customerImage.value = undefined;
  }

  function onArtworkUploadBusyStatusChanged (key: string, isBusy: boolean): void {
    set(artworkUploaderBusyState.value, key, isBusy);
  }

  fillExistingCartItemData();

  return {
    artworkUploadInitialItems,
    customerImage,
    imageHandlerService,
    isSomeUploaderBusy,
    onArtworkAdd,
    onArtworkRemove,
    onArtworkUploadBusyStatusChanged
  }
}
