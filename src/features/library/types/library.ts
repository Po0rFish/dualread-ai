export interface LibraryDocument {
  readonly id: string;
  readonly fileName: string;
  readonly fileType: string;
  readonly fileSize: number;
  readonly fileBlob: Blob;
  readonly pagesCount: number;
  readonly createdAt: string;
  readonly lastOpenedAt: string;
}

export interface LibraryDocumentInfo {
  readonly id: string;
  readonly fileName: string;
  readonly fileType: string;
  readonly fileSize: number;
  readonly pagesCount: number;
  readonly createdAt: string;
  readonly lastOpenedAt: string;
}

export interface CreateLibraryDocumentParams {
  readonly file: File;
  readonly pagesCount: number;
}