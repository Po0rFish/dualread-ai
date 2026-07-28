const SHORT_FINGERPRINT_LENGTH = 16;

const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((byte) => {
      return byte.toString(16).padStart(2, '0');
    })
    .join('');
};

export const createDocumentFingerprint = async (
  file: File,
): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await globalThis.crypto.subtle.digest(
    'SHA-256',
    arrayBuffer,
  );

  const fullFingerprint = bytesToHex(new Uint8Array(hashBuffer));

  return fullFingerprint.slice(0, SHORT_FINGERPRINT_LENGTH);
};