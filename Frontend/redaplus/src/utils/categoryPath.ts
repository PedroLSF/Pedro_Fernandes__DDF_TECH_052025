export const categoryPath = (category: any) => {
  if (!category || !category.name) {
    return 'Sem categoria atribuída';
  }

  const segments = [];
  let currentCategory = category;
  let i = 0;

  while (currentCategory && i < 15) {
    segments.unshift(currentCategory.name);
    currentCategory = currentCategory.parent;
    i += 1;
  }

  // Uncomment to active the feature
  // if (segments.length > 2 && segments[0].length + segments[segments.length - 1].length > 50) {
  //   segments = [segments[0], '...', ...segments.slice(-1)];
  // } else if (segments.length > 2) {
  //   segments = [segments[0], '...', ...segments.slice(-2)];
  // }

  return `/${segments.join('/')}`;
};
