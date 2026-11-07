const CATEGORY_DESCRIPTION_STORY_PARENT_FOLDER_NAME = 'category-descriptions';

export function getCategoryDescriptionStoryFullSlug (categoryPath: string): string {
  return `${CATEGORY_DESCRIPTION_STORY_PARENT_FOLDER_NAME}/${categoryPath.replace('/', '_')}`;
}
