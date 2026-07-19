const BYTES_IN_KILOBYTE = 1024;
const KILOBYTES_IN_MEGABYTE = 1024;

const megabytesToBytes = (megabytes: number): number => {
  return megabytes * KILOBYTES_IN_MEGABYTE * BYTES_IN_KILOBYTE;
};

const MAX_PDF_FILE_SIZE_MB = 20;

export const pdfUploadConfig = {
  maxFileSizeMb: MAX_PDF_FILE_SIZE_MB,
  maxFileSizeBytes: megabytesToBytes(MAX_PDF_FILE_SIZE_MB),
  acceptedMimeType: 'application/pdf',
  acceptedExtension: '.pdf',
} as const;