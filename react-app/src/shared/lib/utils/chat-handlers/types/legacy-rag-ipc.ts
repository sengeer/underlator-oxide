/**
 * @module LegacyChatRagIpcTypes
 * Type-only aliases для закомментированного восстановления chat RAG loader.
 */

import type {
  LegacyRagApi,
  LegacyRagWindow,
} from '../../../../apis/rag-ipc/types/legacy-rag-ipc';

/** RAG API для будущего восстановления loader, без runtime import в no-op путь. */
export type LegacyChatRagApi = LegacyRagApi;

/** Window snapshot для будущего восстановления loader без global augmentation. */
export type LegacyChatRagWindow = LegacyRagWindow;
