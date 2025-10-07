import { computed, Ref } from '@vue/composition-api';

import { ProductId, ProductValue } from 'src/modules/budsies';

export function useBackendProductId (productId: Ref<string | number>) {
  const backendProductId = computed<ProductValue>(() => {
    switch (productId.value) {
      case ProductId.BOBBLEHEADS:
        return ProductValue.BOBBLEHEADS;
      case ProductId.BUDSIES:
      case ProductId.BUDSIES_PUPPETS:
      case ProductId.BUDSIES_NFT:
        return ProductValue.BUDSIE;
      case ProductId.BUDSIES_PALS:
        return ProductValue.BUDSIES_PALS;
      case ProductId.SELFIES:
      case ProductId.SELFIES_PUPPETS:
        return ProductValue.SELFIE;
      case ProductId.SPECIALTY_COMMISSION:
        return ProductValue.SPECIALTY_COMMISSION;
      case ProductId.CUSTOM_PILLOW:
      case ProductId.BUDDY_PILLOW:
        return ProductValue.PILLOW;
      case ProductId.PRINTED_SOCKS:
      case ProductId.PETSIES_PRINTED_SOCKS:
      case ProductId.SHOPIFY_PETSIES_PRINTED_SOCKS:
        return ProductValue.PRINTED_SOCKS;
      case ProductId.PRINTED_MASKS:
        return ProductValue.PRINTED_MASKS;
      case ProductId.PRINTED_KEYCHAINS:
        return ProductValue.PRINTED_KEYCHAINS;
      case ProductId.PHRASE_PILLOW:
      case ProductId.BUDSIES_PHRASE_PILLOWS:
        return ProductValue.PHRASE_PILLOW;
      case ProductId.FELTED_MAGNETS:
        return ProductValue.FELTED_MAGNETS;
      case ProductId.FELTED_ORNAMENTS:
        return ProductValue.FELTED_ORNAMENTS;
      case ProductId.FIGURINES:
        return ProductValue.FIGURINES;
      case ProductId.RENAISSANCE_BLANKETS:
      case ProductId.SHOPIFY_RENAISSANCE_BLANKETS:
        return ProductValue.RENAISSANCE_BLANKETS;
      case ProductId.CUT_OUT_BLANKETS:
      case ProductId.PETSIES_CUT_OUT_BLANKETS:
      case ProductId.SHOPIFY_PETSIES_CUT_OUT_BLANKETS:
        return ProductValue.CUT_OUT_BLANKETS;
      case ProductId.PETSIES_FIGURINES:
        return ProductValue.PETSIES_FIGURINES;
      case ProductId.PETSIES_BOBBLEHEADS:
        return ProductValue.PETSIES_BOBBLEHEADS;
      case ProductId.PAJAMAS:
      case ProductId.SHOPIFY_PAJAMAS:
        return ProductValue.PAJAMAS;
      case ProductId.CARTOON_PILLOW:
        return ProductValue.CARTOON_PILLOW;
      case ProductId.HAWAIIAN_SHIRTS:
        return ProductValue.HAWAIIAN_SHIRTS;
      case ProductId.GOLF_SHIRTS:
      case ProductId.SHOPIFY_GOLF_SHIRTS:
        return ProductValue.GOLF_SHIRTS;
      case ProductId.FOREVERS_DOG:
      case ProductId.SHOPIFY_FOREVERS_DOG:
        return ProductValue.FOREVERS_DOG;
      case ProductId.FOREVERS_CAT:
      case ProductId.SHOPIFY_FOREVERS_CAT:
        return ProductValue.FOREVERS_CAT;
      case ProductId.FOREVERS_OTHER:
      case ProductId.SHOPIFY_FOREVERS_OTHER:
        return ProductValue.FOREVERS_OTHER;
      case ProductId.GOLF_COVERS_DOG:
      case ProductId.SHOPIFY_GOLF_COVERS_DOG:
        return ProductValue.GOLF_COVERS_DOG;
      case ProductId.GOLF_COVERS_CAT:
      case ProductId.SHOPIFY_GOLF_COVERS_CAT:
        return ProductValue.GOLF_COVERS_CAT;
      case ProductId.GOLF_COVERS_OTHER:
      case ProductId.SHOPIFY_GOLF_COVERS_OTHER:
        return ProductValue.GOLF_COVERS_OTHER;
      case ProductId.PHOTO_PORTRAITS:
      case ProductId.SHOPIFY_PHOTO_PORTRAITS:
        return ProductValue.PHOTO_PORTRAITS;
      case ProductId.TUMBLERS:
      case ProductId.SHOPIFY_TUMBLERS:
        return ProductValue.TUMBLERS;
      case ProductId.PETSIES_HUGGABLES:
        return ProductValue.PETSIES_HUGGABLES;
      case ProductId.CLASSROOM_BUDSIE:
        return ProductValue.BUDSIE;
      case ProductId.CLASSROOM_SELFIE:
        return ProductValue.SELFIE;
      default:
        throw new Error(
          `Can't resolve Backend product ID for Magento '${productId.value}' product ID`
        );
    }
  });

  return {
    backendProductId
  }
}
