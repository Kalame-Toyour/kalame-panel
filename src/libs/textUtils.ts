export const isRTL = (text: string): boolean => {
  const rtlChars = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
  return rtlChars.test(text);
};

export const checkTextDirection = (text: string, local: boolean): boolean => {
  if (text.length === 0) {
    return local;
  }
  return isRTL(text);
};
