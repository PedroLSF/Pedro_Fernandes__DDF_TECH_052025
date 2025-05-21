import CryptoJS from 'crypto-js';

import { FileWithMetadataId } from '../types/file';

export const putIdOnFile = (file: File): FileWithMetadataId => {
  const withId: FileWithMetadataId = file as File & {
    id: string;
    path: string;
  };
  withId.id = CryptoJS.MD5(file.name + file.type + file.size + file.lastModified).toString(
    CryptoJS.enc.Hex
  );
  return withId;
};

export const decrypt = (cipherText: string, secretKey: string) => {
  // Descriptografando o texto
  const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
  const originalText = bytes.toString(CryptoJS.enc.Utf8); // Obtém o texto original (em string)
  return originalText;
};
