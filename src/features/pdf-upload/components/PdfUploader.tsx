import type { ChangeEvent } from 'react';
import { pdfUploadConfig } from '../config/pdfUploadConfig';

interface PdfUploaderProps {
  readonly onFileSelect: (file: File) => void;
}

export default function PdfUploader({
  onFileSelect,
}: PdfUploaderProps) {
  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    const file = event.target.files?.item(0);

    if (!file) {
      return;
    }

    onFileSelect(file);

    event.target.value = '';
  };

  return (
    <div className="pdf-uploader">
      <label className="pdf-uploader__label">
        <span className="pdf-uploader__label-text">
          Choose PDF file
        </span>

        <input
          type="file"
          className="pdf-uploader__input"
          accept={`${pdfUploadConfig.acceptedMimeType},${pdfUploadConfig.acceptedExtension}`}
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}