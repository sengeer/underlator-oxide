/**
 * @module LegacySplashIpcTypes
 * Локальные structural types законсервированного splash IPC.
 */

import type {
  SplashCompleteCallback,
  SplashErrorCallback,
  SplashProgressCallback,
  SplashStatusCallback,
  SplashStatusData,
} from './splash-screen';

/** Минимальный legacy bridge splash-модуля, не часть BackendClient. */
export interface LegacySplashApi {
  /** Возвращает текущий статус инициализации. */
  getStatus: () => Promise<SplashStatusData>;
  /** Подписывает на обновления статуса. */
  onStatusUpdate: (callback: SplashStatusCallback) => () => void;
  /** Подписывает на обновления прогресса. */
  onProgressUpdate: (callback: SplashProgressCallback) => () => void;
  /** Подписывает на завершение инициализации. */
  onComplete: (callback: SplashCompleteCallback) => () => void;
  /** Подписывает на ошибки инициализации. */
  onError: (callback: SplashErrorCallback) => () => void;
}

/** Локальный снимок window только для законсервированного splash IPC. */
export type LegacySplashWindow = Window & {
  electron?: {
    splash?: LegacySplashApi;
  };
};

/**
 * Возвращает legacy splash bridge без глобальной типизации Window.
 * TODO(splash): использовать только при восстановлении desktop lifecycle.
 *
 * @returns Splash bridge либо `null` вне legacy runtime.
 */
export function getLegacySplashApi(): LegacySplashApi | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return (window as LegacySplashWindow).electron?.splash ?? null;
}
