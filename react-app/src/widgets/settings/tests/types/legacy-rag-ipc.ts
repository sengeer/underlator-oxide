/**
 * @module LegacySettingsRagIpcTypes
 * Structural type операций законсервированного settings RAG helper.
 */

import type {
  CollectionStats,
  DeleteCollectionRequest,
  DeleteCollectionResult,
  ProcessDocumentResult,
  RagProcessingProgress,
  RagQueryRequest,
  RagResponse,
  UploadAndProcessDocumentConfig,
  VectorCollection,
} from '../../../../shared/apis/rag-ipc/types/rag-ipc';

/** Только RAG-операции публичного helper-фасада, которые использует test UI. */
export interface LegacySettingsRagApi {
  /** Загружает и обрабатывает документ. */
  uploadAndProcessDocument: (
    file: File,
    chatId: string,
    config: UploadAndProcessDocumentConfig
  ) => Promise<ProcessDocumentResult>;
  /** Ищет релевантные документы. */
  queryDocuments: (
    params: RagQueryRequest,
    config: QueryDocumentsConfig
  ) => Promise<RagResponse>;
  /** Возвращает статистику коллекции. */
  getCollectionStats: (chatId: string) => Promise<CollectionStats>;
  /** Возвращает список коллекций. */
  listCollections: () => Promise<VectorCollection[]>;
  /** Удаляет коллекцию документов чата. */
  deleteDocumentCollection: (
    params: DeleteCollectionRequest
  ) => Promise<DeleteCollectionResult>;
  /** Подписывает на прогресс обработки. */
  onProcessingProgress: (
    callback: (progress: RagProcessingProgress) => void
  ) => () => void;
}
