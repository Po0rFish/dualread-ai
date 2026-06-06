export type ReadingBlockType = 'title' | 'subtitle' | 'note' | 'paragraph';

export interface DocumentInfo {
  id: string;
  title: string;
  fileName: string;
  totalPages: number;
  totalCharacters: number;
  createdAt: string;
}

export interface PdfTextLine {
  text: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
  pageWidth: number;
  pageHeight: number;
}

export interface PdfPageText {
  pageNumber: number;
  text: string;
  lines: PdfTextLine[];
  characterCount: number;
}

export interface ReadingBlock {
  id: string;
  documentId: string;
  pageNumber: number;
  originalText: string;
  translatedText?: string;
  isTranslationVisible: boolean;
  isTranslated: boolean;
  characterCount: number;
  type: ReadingBlockType;
}

export interface ReaderSettings {
  fontSize: number;
  theme: 'light' | 'sepia' | 'dark';
}

export interface Bookmark {
  id: string;
  documentId: string;
  blockId: string;
  pageNumber: number;
  textPreview: string;
  createdAt: string;
}

export interface SavedWord {
  id: string;
  documentId: string;
  word: string;
  translation?: string;
  contextSentence: string;
  pageNumber: number;
  createdAt: string;
}