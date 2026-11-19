/**
 * @module LegacyDesktopIpcTypes
 * Локальный structural type best-effort desktop translation bridge.
 */

/** Минимальный translation API, сохранённый как desktop compatibility surface. */
export interface LegacyDesktopIpc {
  /** Обновляет переводы host-меню, если старый bridge доступен. */
  updateTranslations: (message: Record<string, string>) => void | Promise<void>;
}

/** Локальный снимок window без глобального расширения Window. */
export type LegacyDesktopWindow = Window & {
  electron?: LegacyDesktopIpc;
};

/**
 * Возвращает desktop translation bridge или `null` в HTTP/Tauri runtime.
 *
 * @returns Legacy translation bridge, если он существует.
 */
export function getLegacyDesktopIpc(): LegacyDesktopIpc | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return (window as LegacyDesktopWindow).electron ?? null;
}
