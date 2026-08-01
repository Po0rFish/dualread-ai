import { TEXT_MODEL_VERSION } from '../config/textModelConfig';
import {
  getTextModelsDatabase,
  TEXT_MODELS_STORE,
} from '../storage/textModelDb';
import type { PdfDocumentTextModel } from '../types/documentText';

export const textModelRepo = {
  async save(
    textModel: PdfDocumentTextModel,
  ): Promise<PdfDocumentTextModel> {
    const database = await getTextModelsDatabase();

    await database.put(TEXT_MODELS_STORE, textModel);

    return textModel;
  },

  async get(
    documentId: string,
  ): Promise<PdfDocumentTextModel | null> {
    const database = await getTextModelsDatabase();

    const textModel = await database.get(
      TEXT_MODELS_STORE,
      documentId,
    );

    if (!textModel) {
      return null;
    }

    if (textModel.modelVersion !== TEXT_MODEL_VERSION) {
      await database.delete(TEXT_MODELS_STORE, documentId);

      return null;
    }

    return textModel;
  },

  async delete(documentId: string): Promise<void> {
    const database = await getTextModelsDatabase();

    await database.delete(TEXT_MODELS_STORE, documentId);
  },

  async clear(): Promise<void> {
    const database = await getTextModelsDatabase();

    await database.clear(TEXT_MODELS_STORE);
  },
};