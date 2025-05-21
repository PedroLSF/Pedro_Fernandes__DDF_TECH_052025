import { ICategory } from 'src/types/category';

export const getCategoryId = (selectedCategory: ICategory | ICategory[] | null) => {
  if (Array.isArray(selectedCategory)) {
    return selectedCategory.map((cat) => cat.id);
  }
  if (selectedCategory) {
    return selectedCategory.id;
  }
  return null;
};

export const getRootCategory = (category: ICategory | null): any => {
  if (!category || !category.id) {
    return {};
  }

  let currentCategory = category;
  let i = 0;

  while (currentCategory && i < 15) {
    if (!currentCategory.parent) {
      break;
    }
    currentCategory = currentCategory.parent;
    i += 1;
  }

  return currentCategory;
};
