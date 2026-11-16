const PRODUCT_DESCRIPTION_STORY_PARENT_FOLDER_NAME = 'product-descriptions';

export function getProductDescriptionStoryFullSlug (productSku: string): string {
  return `${PRODUCT_DESCRIPTION_STORY_PARENT_FOLDER_NAME}/${productSku}`;
}
