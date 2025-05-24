export const sanitizeNumberInput = (value: string): string => {
  const cleanValue = value.replace(/[^\d.]/g, '');
  const parts = cleanValue.split('.');
  return parts[0] + (parts.length > 1 ? `.${parts[1]}` : '');
};
