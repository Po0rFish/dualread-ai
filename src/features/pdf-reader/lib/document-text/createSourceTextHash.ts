const SHORT_HASH_LENGTH = 16;

const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((byte) => {
      return byte.toString(16).padStart(2, '0');
    })
    .join('');
};

export const normalizeTextForHash = (text: string): string => {
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
};

export const createSourceTextHash = async (
  text: string,
): Promise<string> => {
  const normalizedText = normalizeTextForHash(text);
  const encodedText = new TextEncoder().encode(normalizedText);

  const hashBuffer = await globalThis.crypto.subtle.digest(
    'SHA-256',
    encodedText,
  );

  const fullHash = bytesToHex(new Uint8Array(hashBuffer));

  return fullHash.slice(0, SHORT_HASH_LENGTH);
};