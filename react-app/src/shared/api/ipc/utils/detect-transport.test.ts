/**
 * @module DetectTransportTests
 * Проверяет HTTP/Tauri detect и fail-fast удалённого явного режима.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpTransport } from '../transports/http-transport';
import { TauriTransport } from '../transports/tauri-transport';
import type { DetectTransportGlobals } from '../types/detect-transport';
import { createBackendClient } from './create-backend-client';
import { detectTransport } from './detect-transport';
import { BackendError } from './errors';

vi.mock('../transports/http-transport', () => ({ HttpTransport: vi.fn() }));
vi.mock('../transports/tauri-transport', () => ({ TauriTransport: vi.fn() }));

const legacyGlobals = {
  electron: { model: {} },
} as unknown as DetectTransportGlobals;

describe('detectTransport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('явный http побеждает runtime globals', () => {
    expect(
      detectTransport('http', {
        ...legacyGlobals,
        __TAURI_INTERNALS__: {},
      })
    ).toBe('http');
  });

  it('явный tauri выбран без runtime globals', () => {
    expect(detectTransport('tauri', {})).toBe('tauri');
  });

  it.each([{ __TAURI_INTERNALS__: {} }, { __TAURI__: {} }])(
    'Tauri globals выбирают tauri без флага: %j',
    (globals) => {
      expect(detectTransport('', globals)).toBe('tauri');
      expect(detectTransport(undefined, globals)).toBe('tauri');
    }
  );

  it('default без host — http', () => {
    expect(detectTransport('', {})).toBe('http');
    expect(detectTransport(undefined, {})).toBe('http');
  });

  it('legacy global игнорируется без создания legacy transport', () => {
    expect(detectTransport('', legacyGlobals)).toBe('http');
    expect(detectTransport(undefined, legacyGlobals)).toBe('http');
  });

  it('прочие unknown values сохраняют auto-detect', () => {
    expect(detectTransport('future-mode', {})).toBe('http');
    expect(detectTransport('future-mode', { __TAURI_INTERNALS__: {} })).toBe(
      'tauri'
    );
  });

  it('legacy flag даёт BackendError с поддерживаемыми режимами', () => {
    let thrown: unknown;
    try {
      detectTransport(' electron ', { __TAURI__: {} });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(BackendError);
    expect((thrown as BackendError).class).toBe('invalid');
    expect((thrown as BackendError).message).toContain('http');
    expect((thrown as BackendError).message).toContain('tauri');
    expect((thrown as BackendError).message).toContain('пустым');
  });

  it('legacy flag падает до создания HTTP/Tauri transport', () => {
    vi.stubEnv('VITE_BACKEND_MODE', 'electron');

    expect(() => createBackendClient()).toThrow(BackendError);
    expect(HttpTransport).not.toHaveBeenCalled();
    expect(TauriTransport).not.toHaveBeenCalled();
  });
});
