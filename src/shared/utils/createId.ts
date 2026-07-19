export const createId = (): string => {
  return globalThis.crypto.randomUUID();
};