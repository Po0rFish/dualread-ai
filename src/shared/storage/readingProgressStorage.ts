const STORAGE_KEY = 'dualread-ai:reading-progress';

export interface ReadingProgress {
  readonly documentId: string;
  readonly pageNumber: number;
  readonly segmentId?: string;
  readonly updatedAt: string;
}

type ReadingProgressMap = Record<string, ReadingProgress>;

const readProgressMap = (): ReadingProgressMap => {
  const rawValue = localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return {};
  }

  try {
    return JSON.parse(rawValue) as ReadingProgressMap;
  } catch {
    return {};
  }
};

const writeProgressMap = (progressMap: ReadingProgressMap): void => {
  if (Object.keys(progressMap).length === 0) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(progressMap));
};

export const setReadingProgress = (
  progress: ReadingProgress,
): void => {
  const progressMap = readProgressMap();

  progressMap[progress.documentId] = progress;

  writeProgressMap(progressMap);
};

export const getReadingProgress = (
  documentId: string,
): ReadingProgress | null => {
  const progressMap = readProgressMap();

  return progressMap[documentId] ?? null;
};

export const deleteReadingProgress = (documentId: string): void => {
  const progressMap = readProgressMap();

  delete progressMap[documentId];

  writeProgressMap(progressMap);
};

export const deleteOrphanReadingProgress = (
  existingDocumentIds: string[],
): void => {
  const existingDocumentIdsSet = new Set(existingDocumentIds);
  const progressMap = readProgressMap();

  const nextProgressMap: ReadingProgressMap = {};

  Object.values(progressMap).forEach((progress) => {
    if (existingDocumentIdsSet.has(progress.documentId)) {
      nextProgressMap[progress.documentId] = progress;
    }
  });

  writeProgressMap(nextProgressMap);
};