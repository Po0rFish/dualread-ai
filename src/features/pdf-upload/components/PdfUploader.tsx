import { validatePdfFile } from '../lib/validatePdfFile';
import { Button } from '../../../shared/components';

interface PdfUploaderProps {
  readonly onFileSelect: (file: File) => void;
  readonly isLoading?: boolean;
}

export function PdfUploader({
  onFileSelect,
  isLoading = false,
}: PdfUploaderProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    const errorMessage = validatePdfFile(selectedFile);

    if (errorMessage) {
      alert(errorMessage);
      event.target.value = '';
      return;
    }

    onFileSelect(selectedFile);
    event.target.value = '';
  };

  return (
    <div className="pdf-uploader">
      <input
        id="pdf-file-input"
        className="pdf-uploader__input"
        type="file"
        accept="application/pdf"
        onChange={handleChange}
        disabled={isLoading}
      />

      <label htmlFor="pdf-file-input" className="pdf-uploader__label">
        <Button as="span" disabled={isLoading}>
          {isLoading ? 'Reading PDF...' : 'Choose PDF file'}
        </Button>
      </label>
    </div>
  );
}