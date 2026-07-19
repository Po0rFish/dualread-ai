import { pdfUploadConfig } from '../config/pdfUploadConfig';

export interface PdfValidationResult {
  readonly isValid: boolean;
  readonly errorMessage?: string;
}

export const validatePdfFile = (file: File): PdfValidationResult => {
  const {
    acceptedMimeType,
    acceptedExtension,
    maxFileSizeBytes,
    maxFileSizeMb,
  } = pdfUploadConfig;

  const isPdfMimeType = file.type === acceptedMimeType;
  const hasPdfExtension = file.name
    .toLowerCase()
    .endsWith(acceptedExtension);

  if (!isPdfMimeType && !hasPdfExtension) {
    return {
      isValid: false,
      errorMessage: 'Please select a PDF file.',
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      errorMessage: 'The selected PDF file is empty.',
    };
  }

  if (file.size > maxFileSizeBytes) {
    return {
      isValid: false,
      errorMessage: `PDF file is too large. Maximum size is ${maxFileSizeMb} MB.`,
    };
  }

  return {
    isValid: true,
  };
};