import { randomBytes } from 'crypto';

const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const generatePublicId = (size = 8): string => {
  const bytes = randomBytes(size);
  let id = '';
  for (let i = 0; i < size; i += 1) {
    id += alphabet[bytes[i] % alphabet.length];
  }
  return id;
};
