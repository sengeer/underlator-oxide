/**
 * @module ProviderConstants
 * Provider-neutral конфигурация API-обёртки manage models.
 */

import type { SettingsApiConfig } from '../types/model-ipc';

/** Таймауты и retries существующей settings-обёртки; значения контракта не меняются. */
export const DEFAULT_CONFIG: SettingsApiConfig = {
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000,
  enableLogging: true,
};
