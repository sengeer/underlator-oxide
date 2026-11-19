/**
 * @module DetectTransport
 * Выбор транспорта: явный `VITE_BACKEND_MODE` побеждает runtime detect.
 */

import type {
  BackendMode,
  DetectTransportGlobals,
} from '../types/detect-transport';
import { BackendError } from './errors';

export type { BackendMode, DetectTransportGlobals };

/**
 * Читает host-глобали из `window` (пусто вне браузера).
 *
 * @returns Снимок Tauri globals.
 */
function readWindowGlobals(): DetectTransportGlobals {
  if (typeof window === 'undefined') {
    return {};
  }
  const win = window as Window & DetectTransportGlobals;
  return {
    __TAURI__: win.__TAURI__,
    __TAURI_INTERNALS__: win.__TAURI_INTERNALS__,
  };
}

/**
 * Определяет режим транспорта.
 * Legacy `electron` завершается ошибкой до создания транспорта и IO;
 * другие неизвестные значения сохраняют auto-detect.
 *
 * @param mode - Явный флаг (`http`/`tauri`); пустой = detect.
 * @param globals - Window-глобали (по умолчанию `window`).
 * @returns Режим BackendClient.
 * @throws BackendError с классом `invalid` для удалённого режима `electron`.
 */
export function detectTransport(
  mode: string | undefined = import.meta.env.VITE_BACKEND_MODE,
  globals: DetectTransportGlobals = readWindowGlobals()
): BackendMode {
  const explicit = mode?.trim();
  if (explicit === 'electron') {
    throw new BackendError(
      'invalid',
      "VITE_BACKEND_MODE=electron удалён. Поддерживаются 'http' и 'tauri'; оставьте флаг пустым для auto-detect."
    );
  }
  if (explicit === 'http' || explicit === 'tauri') {
    return explicit;
  }
  if (globals.__TAURI_INTERNALS__ || globals.__TAURI__) {
    return 'tauri';
  }
  return 'http';
}
