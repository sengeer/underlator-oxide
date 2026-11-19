/**
 * @module WireSitesTests
 * MVP call sites используют BackendClient; conserved RAG/splash остаются no-op.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, '../../../..');

/**
 * Читает исходник относительно `src/`.
 *
 * @param rel - Относительный путь от `src/`.
 * @returns Содержимое файла.
 */
function read(rel: string): string {
  return readFileSync(join(src, rel), 'utf8');
}

describe('wiring call sites', () => {
  it('feature-provider использует BackendClient без обхода MVP model API', () => {
    const source = read('shared/lib/hooks/use-model/feature-provider.ts');
    expect(source).toMatch(/getBackendClient/);
    expect(source).not.toMatch(/window\.electron\.model/);
    expect(source).not.toMatch(/apis\/model-ipc/);
    expect(source).not.toMatch(/from ['"]\.\/apis\/model-ipc/);
  });

  it('use-model.stop идёт через BackendClient.model', () => {
    const source = read('shared/lib/hooks/use-model/use-model.ts');
    expect(source).toMatch(/getBackendClient/);
    expect(source).toMatch(/\.model\.stop\(/);
    expect(source).not.toMatch(/window\.electron\.model/);
  });

  it('settings catalog/model идёт через shared BackendClient', () => {
    const source = read('widgets/settings/apis/model-and-catalog-ipc.ts');
    expect(source).toMatch(/getBackendClient/);
    expect(source).not.toMatch(/window\.electron\.(?:model|catalog)/);
  });

  it('settings MVP и conserved RAG generate используют BackendClient.model', () => {
    const modelHelper = read('widgets/settings/tests/model-ipc.ts');
    const ragHelper = read('widgets/settings/tests/rag-ipc.ts');
    expect(modelHelper).toMatch(/getBackendClient/);
    expect(ragHelper).toMatch(/getBackendClient\(\)\.model\.generate/);
    expect(ragHelper).toMatch(/TODO\(rag\)/);
    expect(ragHelper).not.toMatch(/\(window as any\)\.electron\.model/);
  });

  it('settings chat helper сохраняет цепочку chatIpc → BackendClient.chat', () => {
    const helper = read('widgets/settings/tests/chat-ipc.ts');
    const chatApi = read('shared/apis/chat-ipc/chat-ipc.ts');
    expect(helper).toMatch(/chatIpc/);
    expect(chatApi).toMatch(/getBackendClient/);
  });

  it('chat-sidebar delete не блокируется RAG: deleteChat без живого ragIpc', () => {
    const source = read('widgets/chat/ui/chat-sidebar.tsx');
    expect(source).toMatch(/deleteChat/);
    expect(source).toMatch(
      /TODO\(rag\).*deleteDocumentCollection|deleteDocumentCollection/
    );
    expect(source).toMatch(/deleteChat\(\{/);
    const withoutBlockComments = source.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(withoutBlockComments).not.toMatch(
      /await\s+ragIpc\.deleteDocumentCollection/
    );
  });

  it('RAG/splash используют local legacy accessors, TODO и не расширяют BackendClient', () => {
    const rag = read('shared/apis/rag-ipc/rag-ipc.ts');
    const splash = read('pages/main/apis/splash-screen-ipc.ts');
    expect(rag).toMatch(/TODO\(rag\)/);
    expect(rag).toMatch(/requireLegacyRagApi/);
    expect(rag).not.toMatch(/getBackendClient/);
    expect(splash).toMatch(/TODO\(splash\)/);
    expect(splash).toMatch(/getLegacySplashApi/);
    expect(splash).not.toMatch(/getBackendClient/);
  });

  it('RAG/splash entry points остаются отключёнными, а модули не удалены', () => {
    const ragLoader = read('shared/lib/utils/chat-handlers/chat-rag-loader.ts');
    const splashUi = read('pages/main/ui/splash-screen.tsx');
    const settingsTests = read('widgets/settings/ui/tests.tsx');

    expect(ragLoader).toMatch(/TODO\(rag\)/);
    expect(ragLoader).toMatch(/void context;\s*return\s*\{/);
    expect(splashUi).toMatch(/TODO\(splash\)/);
    expect(splashUi).toMatch(
      /dispatch\(complete\(\)\);\s*dispatch\(hide\(\)\);\s*return;/
    );
    expect(settingsTests).toMatch(/TODO\(rag\)/);
    expect(settingsTests).toMatch(/\/\/\s+testGenerateWithRagContext/);
  });
});
