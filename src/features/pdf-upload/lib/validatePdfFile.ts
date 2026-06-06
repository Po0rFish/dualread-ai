export const validatePdfFile = (file: File): string | null => {
  if (file.type !== 'application/pdf') {
    return 'Please upload a PDF file.';
  }

  if (file.size === 0) {
    return 'The selected PDF file is empty.';
  }

  return null;
};