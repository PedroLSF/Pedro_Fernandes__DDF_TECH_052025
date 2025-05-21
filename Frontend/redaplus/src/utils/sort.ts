export const compareValues = (
  aProp: string | number | Date | null,
  bProp: string | number | Date | null,
  order: string
) => {
  if (typeof aProp === 'string' && typeof bProp === 'string') {
    return order === 'asc' ? aProp.localeCompare(bProp) : bProp.localeCompare(aProp);
  }

  if (typeof aProp === 'number' && typeof bProp === 'number') {
    return order === 'asc' ? aProp - bProp : bProp - aProp;
  }

  if (aProp instanceof Date && bProp instanceof Date) {
    return order === 'asc' ? aProp.getTime() - bProp.getTime() : bProp.getTime() - aProp.getTime();
  }

  return 0;
};
