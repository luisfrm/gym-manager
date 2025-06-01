/**
 * Safely trims a string value that can be null, undefined, or empty
 * @param value - The value to trim (can be string, null, undefined, or any type)
 * @returns A trimmed string or empty string if value is null/undefined/empty
 */
const safeTrim = (value: any): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  return typeof value === 'string' ? value.trim() : String(value).trim();
};

export default safeTrim; 