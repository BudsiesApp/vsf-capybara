import { Ref, computed, inject, ref } from '@vue/composition-api';

import CartItem from 'core/modules/cart/types/CartItem';
import Product from 'core/modules/catalog/types/Product';

import { Dictionary, ProductValue } from 'src/modules/budsies';
import { ImageHandlerService, Item } from 'src/modules/file-storage';
import { CustomerImage } from 'src/modules/shared';

export function useArtworkUpload (product: Product, existingCartItem: CartItem | undefined) {
  const imageHandlerService = inject<ImageHandlerService>('ImageHandlerService');
  const backendProductId = computed<string>(() => {
    switch (product.id) {
      case 550: // TODO
        return ProductValue.PET_PORTRAITS
      default:
        throw new Error(
          `Can't resolve Backend product id for Magento '${product.id}' product ID`
        );
    }
  });
  const customerImage = ref<CustomerImage | undefined>();
  const artworkUploaderBusyState = ref<Dictionary<boolean>>({});
  const artworkUploadInitialItems = ref<CustomerImage[]>([]);

  const isSomeUploaderBusy = computed<boolean>(() => {
    return !!Object.values(artworkUploaderBusyState.value)
      .find((isBusy) => isBusy);
  });

  function fillExistingCartItemData (): void {
    if (!existingCartItem || !existingCartItem.customerImages?.length) {
      (artworkUploadInitialItems as any).value = [];
      customerImage.value = undefined;
      return;
    }

    (artworkUploadInitialItems as any).value = existingCartItem.customerImages || [];
    customerImage.value = existingCartItem.customerImages[0]
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
    artworkUploaderBusyState.value[key] = isBusy;
  }

  fillExistingCartItemData();

  return {
    artworkUploadInitialItems,
    backendProductId,
    customerImage,
    imageHandlerService,
    isSomeUploaderBusy,
    onArtworkAdd,
    onArtworkRemove,
    onArtworkUploadBusyStatusChanged
  }
}
