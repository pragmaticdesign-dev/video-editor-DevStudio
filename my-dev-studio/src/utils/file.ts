// src/utils/file.ts

/**
 * Converts a File object (from <input type="file">) to a Base64 string.
 * This allows us to embed images/audio directly into the JSON.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};