import { computed, Ref } from '@vue/composition-api';

import Product from '@vue-storefront/core/modules/catalog/types/Product';

import { ProductId, ProductValue } from 'src/modules/budsies';

export function useBackendProductId (product: Ref<Product>) {
  const backendProductId = computed<ProductValue>(() => {
    switch (product.value.id) {
      case ProductId.CUSTOM_PILLOW:
      case ProductId.BUDDY_PILLOW:
        return ProductValue.PILLOW;
      case ProductId.PRINTED_SOCKS:
      case ProductId.PETSIES_PRINTED_SOCKS:
        return ProductValue.PRINTED_SOCKS;
      case ProductId.PRINTED_MASKS:
        return ProductValue.PRINTED_MASKS;
      case ProductId.PRINTED_KEYCHAINS:
      case ProductId.PETSIES_PRINTED_KEYCHAINS:
        return ProductValue.PRINTED_KEYCHAINS;
      case ProductId.FELTED_MAGNETS:
        return ProductValue.FELTED_MAGNETS;
      case ProductId.FELTED_ORNAMENTS:
        return ProductValue.FELTED_ORNAMENTS;
      case ProductId.RENAISSANCE_BLANKETS:
        return ProductValue.RENAISSANCE_BLANKETS;
      case ProductId.CUT_OUT_BLANKETS:
      case ProductId.PETSIES_CUT_OUT_BLANKETS:
        return ProductValue.CUT_OUT_BLANKETS;
      case ProductId.PETSIES_FIGURINES:
        return ProductValue.PETSIES_FIGURINES;
      case ProductId.PETSIES_BOBBLEHEADS:
        return ProductValue.PETSIES_BOBBLEHEADS;
      case ProductId.PAJAMAS:
      case ProductId.PETSIES_PAJAMAS:
        return ProductValue.PAJAMAS;
      case ProductId.CARTOON_PILLOW:
        return ProductValue.CARTOON_PILLOW;
      case ProductId.HAWAIIAN_SHIRTS:
        return ProductValue.HAWAIIAN_SHIRTS;
      case ProductId.GOLF_SHIRTS:
      case ProductId.PETSIES_GOLF_SHIRTS:
        return ProductValue.GOLF_SHIRTS;
      case ProductId.FOREVERS_DOG:
        return ProductValue.FOREVERS_DOG;
      case ProductId.FOREVERS_CAT:
        return ProductValue.FOREVERS_CAT;
      case ProductId.FOREVERS_OTHER:
        return ProductValue.FOREVERS_OTHER;
      case ProductId.GOLF_COVERS_DOG:
        return ProductValue.GOLF_COVERS_DOG;
      case ProductId.GOLF_COVERS_CAT:
        return ProductValue.GOLF_COVERS_CAT;
      case ProductId.GOLF_COVERS_OTHER:
        return ProductValue.GOLF_COVERS_OTHER;
      case ProductId.PHOTO_PORTRAITS:
        return ProductValue.PHOTO_PORTRAITS;
      default:
        throw new Error(
          `Can't resolve Backend product ID for Magento '${product.value.id}' product ID`
        );
    }
  });

  return {
    backendProductId
  }
}
