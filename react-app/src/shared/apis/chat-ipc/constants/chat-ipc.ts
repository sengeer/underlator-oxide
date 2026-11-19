/**
 * @module ChatIpcConstants
 * Константы для работы с Chat IPC API.
 */

import type { ChatApiConfig } from '../types/chat-ipc';

/**
 * Конфигурация по умолчанию для API клиента.
 * Базовые настройки существующей Chat API-обёртки над BackendClient.
 */
export const DEFAULT_CONFIG: ChatApiConfig = {
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000,
};
