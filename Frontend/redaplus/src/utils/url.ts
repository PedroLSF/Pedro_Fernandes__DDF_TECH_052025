export const isUrl = (str?: string): boolean => {
  if (!str || str === '') {
    return false;
  }
  const urlPattern: RegExp = /^(ftp|http|https):\/\/[^ "]+$/;
  return urlPattern.test(str);
};
