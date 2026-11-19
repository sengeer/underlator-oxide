/**
 * @module LegacyRagIpcTypes
 * Локальные structural types законсервированного RAG IPC.
 */

import type {
  CollectionStats,
  DeleteCollectionRequest,
  DeleteCollectionResult,
  ProcessDocumentResult,
  RagProcessingProgress,
  RagResponse,
  UploadAndProcessDocumentConfig,
  UploadAndProcessDocumentRequest,
  VectorCollection,
} from './rag-ipc';

/** Envelope legacy RAG IPC с телом операции либо сообщением ошибки. */
export interface LegacyIpcEnvelope<T> {
  /** Признак успешного ответа host. */
  success: boolean;
  /** Тело результата при успехе. */
  data?: T;
  /** Сообщение ошибки host. */
  error?: string;
}

/** Ответ listCollections: envelope либо исторический неупакованный массив. */
export type LegacyCollectionListResponse =
  | LegacyIpcEnvelope<VectorCollection[]>
  | VectorCollection[];

/** Минимальный RAG API, сохранённый до реализации rust-core RAG. */
export interface LegacyRagApi {
  /** Обрабатывает уже доступный host-документ. */
  processDocument: (request: {
    filePath: string;
    chatId: string;
  }) => Promise<LegacyIpcEnvelope<ProcessDocumentResult>>;
  /** Ищет документы по запросу. */
  queryDocuments: (
    request: { query: string; chatId: string },
    config: QueryDocumentsConfig
  ) => Promise<LegacyIpcEnvelope<RagResponse>>;
  /** Удаляет коллекцию документов чата. */
  deleteDocumentCollection: (
    request: DeleteCollectionRequest
  ) => Promise<LegacyIpcEnvelope<DeleteCollectionResult>>;
  /** Возвращает статистику коллекции. */
  getCollectionStats: (
    chatId: string
  ) => Promise<LegacyIpcEnvelope<CollectionStats>>;
  /** Возвращает список коллекций. */
  listCollections: () => Promise<LegacyCollectionListResponse>;
  /** Подписывает на прогресс обработки. */
  onProcessingProgress: (
    callback: (progress: RagProcessingProgress) => void
  ) => () => void;
  /** Загружает и обрабатывает документ. */
  uploadAndProcessDocument: (
    request: UploadAndProcessDocumentRequest,
    config: UploadAndProcessDocumentConfig
  ) => Promise<LegacyIpcEnvelope<ProcessDocumentResult>>;
}

/** Локальный снимок window только для законсервированного RAG IPC. */
export type LegacyRagWindow = Window & {
  electron?: {
    rag?: LegacyRagApi;
  };
};
