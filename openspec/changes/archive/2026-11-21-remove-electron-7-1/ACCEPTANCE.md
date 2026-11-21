# Acceptance

## 1. Baseline и входные gates

- **Дата фиксации:** 2026-11-18.
- **Baseline/recovery commit SHA:** `bf224272749dca78d0e1b7f0f8e119b00960c0d4` (`master`).
- **Legacy tree на baseline:** `git ls-tree -d --name-only HEAD -- electron-app` → `electron-app`.

### 1.1. Атом 5.2 — закрытый Fedora AppImage gate

**Исторический gate: pass**, это ранее полученное доказательство поставки.

- [Матрица `docs/DESKTOP_TAURI.md`, строки 227–235](../../../docs/DESKTOP_TAURI.md#L227-L235): Fedora Workstation 44 AppImage — **verified**; macOS arm64 DMG и Windows 11 portable zip — **unverified**. Матрица не изменялась.
- [Ручной чеклист атома 5.2, строки 70–92](../archive/2026-09-23-desktop-tauri-build-docs-5-2/tasks.md#L70-L92), архивный SHA `5f5f538ddeebff449063a18dc93675372465f4a9`: `AppImage gate = pass` от 2026-09-23, канонический `Underlator-0.1.0-beta-linux-x86_64.AppImage`, живой `UNDERLATOR_ACCEPTANCE_SMOKE` против локального Ollama, `acceptance-smoke.json` с **`all_ok: true`**. `tauri dev`, unit/mock и факт сборки бинаря не использовались как замена gate.
- Runtime-файл `${UNDERLATOR_DATA_DIR}/acceptance-smoke.json` не версионируется; сохранённое доказательство — датированная архивная отметка `all_ok: true` и неизменная ссылка на него в матрице.

### 1.2. Атомы 6.1–6.4

- **6.1:** [архивные tasks](../archive/2026-09-26-conserve-rag-ui-6-1/tasks.md), SHA `2b5e9bc5ae4b5c7b3226ff53f628ace8f37fd3f0`. RAG-входы отключены, модули и `TODO(rag)` сохранены.
- **6.2:** [архивные tasks](../archive/2026-09-26-conserve-splash-ui-6-2/tasks.md), SHA `1fb9a72a804f1c91f00d2d0794d4bc9c1fe63c59`. Старт не зависит от splash IPC, модули и `TODO(splash)` сохранены.
- **6.3:** [архивные tasks](../archive/2026-09-27-provider-settings-ollama-url-6-3/tasks.md), SHA `4064854c20b469ebd2829900c53d19c8f1d329cb`. Settings = `Ollama` + `url` + manage models по этому URL.
- **6.4:** [архивные tasks](../archive/2026-10-12-react-ux-perf-lazy-6-4/tasks.md), SHA `eef5f57a2d5b997e6375589380493a67dab1cee9`. Пользовательские отметки **1.6, 2.4, 3.5 и 4.6** — `[x]`.

## 2. Pre-removal live parity (1.2–1.4)

**Пользовательское подтверждение от 2026-11-18: автоматический parity на реальном Tauri с живым Ollama пройден; владелец отметил 1.2–1.4 в `tasks.md`.** Это принятое пользователем evidence, а не повторный запуск агента. Отдельные ручной паспорт и дублирующие таблицы по решению владельца не ведутся.

- **1.2 `model`: pass.** Подтверждены list, generate с progress/финальным текстом, stop активного stream, install/remove безопасной тестовой модели с cleanup, ошибки недоступного provider/неизвестной модели, cancellation и отсутствие фиктивного success при обрыве.
- **1.3 `catalog`: pass.** Подтверждены get (`ollama`/`totalCount`/`lastUpdated`), search с фильтром, карточка существующей модели, `null` для missing, прокидка settings `id`/`url` и classified provider error.
- **1.4 `chat`: pass.** Подтверждены create/list/get/update/addMessage/delete отдельного тестового чата, persist после фактического restart host в `chats/*.chat.json`, `not_found` для unknown id, delete без RAG и старт без splash.

## 3. Recovery tag (1.5)

- **Annotated tag:** `legacy-electron`; force-overwrite не применялся, существующего тега перед созданием не было.
- **Tag object SHA:** `85cafb6380de1dab139cd12b511ae513e637462b`.
- **Commit SHA:** `bf224272749dca78d0e1b7f0f8e119b00960c0d4` — последний commit с legacy tree на момент удаления.
- `git cat-file -t legacy-electron` → `tag`.
- `git cat-file -e 'legacy-electron^{tag}'` → exit 0.
- `git ls-tree -d --name-only legacy-electron -- electron-app` → `electron-app`.

## 4. Post-change smoke (7.1–7.3)

**Дата smoke:** 2026-11-21. **SHA smoke-дерева:** `38f9ec155941cb976b186c4ab362337804383978`
(`refactor: remove Electron and shelve splash screen and RAG on frontend`).
**Baseline сравнения:** `bf224272749dca78d0e1b7f0f8e119b00960c0d4`.

### 4.0. Неизменность контракта (7.3)

- `git diff --stat bf22427..HEAD -- crates` → 8 файлов, только rustdoc/комментарии и
  переименования тестов (`retry_policy_defaults_match_electron` → `..._match_contract`,
  `core_event_names_match_electron_ipc` → `..._match_stable_contract`).
- Ни одна строка literals/serde-ключей, `IPC`/SSE-имён, routes/commands, `CHAT_VERSION`,
  retry/timeout defaults и chat paths не менялась; канон — `openspec/specs/mvp-api-contract/spec.md`
  (`model:generate|stop|install|remove|list`, `catalog:get|search|get-model-info`,
  `chat:create|get|update|delete|list|add-message`, `model:generate-progress`,
  `model:install-progress`, `/api/model|catalog|chat`).

### 4.1. Desktop Tauri (7.1) — `pass`

- **Сборка/артефакт:** Fedora 44, из дерева:
  `cd crates/underlator-tauri && NO_STRIP=1 APPIMAGE_EXTRACT_AND_RUN=1 cargo tauri build --features desktop --bundles appimage`,
  запуск `./target/release/bundle/appimage/Underlator_0.1.0-beta_amd64.AppImage`.
- **Ollama:** `http://127.0.0.1:11434`, модель `gemma3:1b`.
- **Restart host:** выполнен; чаты после перезапуска читаются с диска.

| Проверка | Evidence | Результат |
| --- | --- | --- |
| `model` list / generate + progress / stop | пользовательский прогон по основным юзеркейсам | pass |
| `catalog` get / search | пользовательский прогон по основным юзеркейсам | pass |
| `chat` create/list/get/update/addMessage/delete | пользовательский прогон по основным юзеркейсам | pass |
| `chat` persist после restart | `~/.local/share/app.underlator.desktop/chats/chat_1795272567838_8d8819b88f194755960db0f1b67f8e7c.chat.json` | pass |
| classified error | `HTTP-статус 404: {"error":"model 'qwen3:0.6b' not found"}`; класс `http` (маппинг `CoreError::HttpStatus` → `HostErrorClass::Http`) | pass |
| старт без RAG/splash | основной UI стартует, splash IPC и RAG не требуются | pass |

### 4.2. Docker server (7.2) — `pass`

- **Base URL:** `http://localhost:8080` (compose `UNDERLATOR_HOST_PORT` по умолчанию).
- **Compose project:** `docker` (`docker compose -f docker/docker-compose.yml ls` →
  `docker running(1) /home/sengeer/projects/underlator-oxide/docker/docker-compose.yml`).
- **Остановка:** тестовый project остановлен; `down -v` не запускался, пользовательский volume
  не пересоздавался (чаты и `backup/` от 14:05/14:28 на месте).
- **Ollama:** `http://192.168.1.174:11434`, модель `srchmnmichael/qwen3.5-9B-uncensored:latest`.
- **Restart host:** выполнен; чаты после перезапуска читаются с диска.

| Проверка | Evidence | Результат |
| --- | --- | --- |
| SPA доступен | base URL открывается | pass |
| `model` generate + SSE (не WebSocket) / stop / list | пользовательский прогон по основным юзеркейсам | pass |
| `catalog` get / search | пользовательский прогон по основным юзеркейсам | pass |
| `chat` CRUD | пользовательский прогон по основным юзеркейсам | pass |
| `chat` persist в `/data/chats/` | `chat_1795123511480_762df6ca2de24bbc9709dd93db3367a4.chat.json`, `chat_1795270138151_b366aac8019a42229ae017be410927b4.chat.json`, `backup/` | pass |
| classified error | `HTTP-статус 404: {"error":"model 'qwen3:0.6b' not found"}`; класс `http` | pass |

### 4.3. Parity с pre-removal (1.2–1.4)

| Сценарий (`design.md` D1) | Pre-removal | Desktop 7.1 | Docker 7.2 | Отличие |
| --- | --- | --- | --- | --- |
| `model` list / generate + progress / stop | pass (1.2) | pass | pass | нет |
| `model` install/remove тестовой модели | pass (1.2) | не входило в сокращённый post-change smoke (`design.md:54`) | не входило | покрыто pre-removal + unit |
| `catalog` get / search | pass (1.3) | pass | pass | нет |
| `catalog` getModelInfo (есть/нет) | pass (1.3) | не входило в post-change smoke | не входило | покрыто pre-removal + unit |
| `chat` CRUD + persist | pass (1.4) | pass | pass | нет |
| `chat` unknown id → `not_found`, delete без RAG | pass (1.4) | не входило в post-change smoke | не входило | покрыто pre-removal + unit |
| transport: Tauri/HTTP без legacy flag | pass (1.2–1.4) | pass | pass | нет |
| старт без RAG/splash | pass (1.4) | pass | pass | нет |
| classified provider error | pass (1.2/1.3) | pass (`http`, провайдерский 404) | pass (`http`, тот же текст) | нет: текст и класс совпадают |

`blocked`/незаполненных required checks нет. Пункты «не входило» — сокращение post-change
smoke по `design.md:54`, а не пропуск обязательного пункта 7.1/7.2.

### 4.4. Дефект, обнаруженный при сборе evidence (вне scope удаления)

- **Симптом:** `chat`/`model.generate` не применял `url` из settings: после валидного URL смена
  на невалидный не давала ошибку; `manage models` (`list`/`install`/`remove`) при этом работал
  корректно.
- **Причина (pre-existing, не связана с удалением Electron):**
  `ModelService::generate`/`stop` всегда использовали process-scoped `LlmProvider`
  (URL из env/`DEFAULT_PROVIDER_URL`), тогда как `list`/`install`/`remove` и `catalog`
  разрешали провайдера по `id`/`url` из запроса через `LlmProviderFactory`.
- **Исправление:** `generate` выбирает провайдера по `id`/`url` запроса и запоминает активный
  экземпляр; `stop` и следующий `generate` отменяют именно его поток.
  Регрессионные тесты: core (`generate_with_configured_url_uses_factory_provider`,
  `stop_cancels_generate_on_configured_provider`), server HTTP и tauri host (`url` уходит в фабрику).
- **Границы:** это runtime-правка `underlator-core`, поэтому она **не** входит в scope
  remove-electron (5.2/8.4/8.8 «Rust diff только documentation-only») и оформляется отдельным
  коммитом/изменением после закрытия 7.1.
- **Follow-up:** после применения фикса нужен один живой re-check `generate`/`stop` на обоих
  host'ах со сменой `url` в settings (входит в 8.5); до этого 7.1/7.2 evidence относится к SHA
  `38f9ec1` без фикса.

## 5. Definition of Done (8.1–8.8)

**Дата прогона:** 2026-11-21. **HEAD:** `c03a713` (fix из §4.4) поверх smoke-дерева `38f9ec1`;
baseline `bf22427`.
**Окружение:** macOS arm64; в отличие от Fedora-прогонов §4, Docker CLI на этой машине
отсутствует (`docker` → `command not found`, exit 127). Поэтому docker-часть 8.8 проверена
diff-аудитом, а не запуском compose.

### 5.1. 8.1 — legacy host отсутствует

| Проверка | Команда | Результат |
| --- | --- | --- |
| Каталог удалён | `test ! -d electron-app` | exit 0 |
| Recovery tag | `git cat-file -t legacy-electron` | `tag` |
| Tag разрешается | `git cat-file -e 'legacy-electron^{tag}'` | exit 0 |
| Legacy tree в tag | `git ls-tree -d --name-only legacy-electron -- electron-app` | `electron-app` |
| Commit tag | `git rev-parse 'legacy-electron^{commit}'` | `bf224272749dca78d0e1b7f0f8e119b00960c0d4` |
| Нет transport/global | `rg 'window\.electron\|ElectronTransport' react-app/src` | совпадений нет (exit 1) |

- В `detect-transport.ts` литерал `'electron'` остаётся **только** fail-fast guard
  (строки 45–49): бросает `BackendError` до fetch/invoke и не создаёт transport, не читает
  legacy global. Это требуемое поведение D3/2.2, а не legacy-ветка выбора.
- `detect-transport.test.ts` — 9 тестов, включая `legacy global игнорируется без создания
  legacy transport`, `legacy flag даёт BackendError с поддерживаемыми режимами`,
  `legacy flag падает до создания HTTP/Tauri transport`.

### 5.2. 8.2 — RAG/splash законсервированы

- `rg 'TODO\(rag\)' react-app/src` → **21** совпадение; entry points: `shared/apis/rag-ipc/rag-ipc.ts`,
  `shared/lib/utils/chat-handlers/chat-rag-loader.ts`, `widgets/settings/tests/rag-ipc.ts`,
  `widgets/chat/ui/chat.tsx`, `widgets/chat/ui/chat-sidebar.tsx`,
  `widgets/settings/ui/settings.tsx`, `widgets/settings/ui/manage-models.tsx`,
  `widgets/settings/ui/tests.tsx`.
- `rg 'TODO\(splash\)' react-app/src` → **9** совпадений; entry points:
  `pages/main/apis/splash-screen-ipc.ts`, `pages/main/ui/splash-screen.tsx`,
  `pages/main/ui/main.tsx`, `pages/main/models/splash-screen-ipc-slice.ts`,
  `pages/main/types/splash-screen-ipc.ts`.
- Модули на месте и компилируются: `shared/apis/rag-ipc/{rag-ipc.ts,types/legacy-rag-ipc.ts}`,
  `pages/main/{apis,ui,types}/splash-screen*`, `shared/lib/utils/chat-handlers/chat-rag-loader.ts`,
  `widgets/settings/tests/rag-ipc.ts`, локальные `legacy-rag-ipc.ts`/`legacy-desktop-ipc.ts`.
- Ни один marker/UI не оживлён: `wire-sites.test.ts` содержит
  `RAG/splash entry points остаются отключёнными, а модули не удалены` и
  `RAG/splash используют local legacy accessors, TODO и не расширяют BackendClient`;
  live-вызовы RAG из sidebar/chat остаются комментариями.
- Typecheck всего `react-app` — exit 0 (§5.3).

### 5.3. 8.3 — frontend зелёный

| Команда (cwd `react-app`) | Exit | Evidence |
| --- | --- | --- |
| `npm run type:check` | 0 | `tsc --noEmit --pretty` без ошибок |
| `npm run build` | 0 | vite 6.3.6, 1558 modules transformed, `dist/` собран |
| `npm test` | 0 | 11 files / **48 tests passed**, 0 skipped |
| `npm run lint` | 0 | только advisory `React version not specified`, ошибок нет |
| `npm run stylelint` | 0 | запущен дополнительно; CSS/SCSS diff отсутствует |
| `git diff --name-only bf22427..HEAD \| rg '\.(css\|scss)$'` | 1 | стилевого diff нет, stylelint по 8.3 не обязателен |

- Защитные тесты сохранены и выполняются, не skipped:
  `fsd-boundaries.test.ts` (2) — `eslint запрещает shared/api/ipc/transports из widgets и pages`
  и обход реального дерева с generic regex `transports/`;
  `wire-sites.test.ts` (8) — `feature-provider использует BackendClient...`,
  `use-model.stop идёт через BackendClient.model`,
  `settings catalog/model идёт через shared BackendClient`,
  `settings chat helper сохраняет цепочку chatIpc → BackendClient.chat`,
  RAG/splash no-live assertions;
  `detect-transport.test.ts` (9), `index.test.ts` (1),
  `errors.test.ts` (2, включая `тело без класса мапится в internal`).

### 5.4. 8.4 — Rust зелёный при фактическом diff

| Команда (cwd repo root) | Exit | Evidence |
| --- | --- | --- |
| `cargo check --workspace` | 0 | все три crate проверены, warnings нет |
| `cargo test -p underlator-core` | 0 | **97** lib tests + **2** architecture tests: `arch_lint_check`, `application_sources_do_not_name_adapters_or_http_crates`; doc-tests 0 |
| `cargo clippy -p underlator-core --all-targets -- -D warnings` | 0 | warnings нет (флаг `--all-targets` строже требуемого) |
| `cargo test -p underlator-server` | 0 | **20** tests, включая `generate_streams_two_chunks_and_result` (assert `factory_url == "http://example.invalid:9"`) и `stop_cancels_in_flight_generate` |
| `cargo test -p underlator-tauri` | 0 | **8** lib tests + **10** `host_mvp` tests, включая `generate_emits_progress_and_concatenates`, `stop_cancels_in_flight_generate`, `model_list_remove_stop_share_provider_arc` |

- Server/Tauri suites запущены потому, что `c03a713` фактически менял
  `crates/underlator-server/src/http_tests.rs` и `crates/underlator-tauri/tests/host_mvp.rs`.
- Core-регрессии фикса проходят: `generate_with_configured_url_uses_factory_provider`,
  `stop_cancels_generate_on_configured_provider`.
- Контракт не изменён: `c03a713` не трогает IPC/SSE-имена, serde-ключи DTO,
  routes/commands, `CHAT_VERSION`/`CHAT_FILE_VERSION`, retry/timeout defaults и chat paths;
  diff — `application/model.rs` (provider resolution существующих generate/stop) + тесты.
  Runtime-дельта относится к отдельному фиксу из §4.4, не к documentation-only scope 5.1–5.2.

### 5.5. 8.5 — live smoke parity

- §4.1/§4.2 фиксируют `pass` обоих официальных режимов на SHA `38f9ec1`, §4.3 — parity без
  `blocked` и незаполненных required checks. Эти evidence приняты как основание 8.5.
- **Решение владельца 2026-11-21:** 8.5 закрывается на evidence §4; отдельный живой re-check
  `generate`/`stop` после `c03a713` (смена `url` в settings) **отложен и не считается
  выполненным**. Он остаётся follow-up §4.4 к отдельному runtime-фиксу, а не скрытым `pass`.
- Интерпретация: строки `model generate/stop` в §4.1/§4.2 относятся к дереву
  `38f9ec1` без фикса; parity `catalog`/`chat`/classified error/старт без RAG/splash от фикса
  не зависят.

### 5.6. 8.6 — docs, matrix и root `rg -i electron`

- `README.md`/`README_RU.md`: два официальных запуска (Tauri + compose), storage roots
  (`UNDERLATOR_DATA_DIR`/app data dir и docker `/data`), ручной перенос только
  `chats/*.chat.json`, явное отсутствие automatic migration.
- `CONTRIBUTING.md`: `rg -i 'electron|preload|service layer'` → совпадений нет.
- `.rules/*` (gitignored, локальные): `rg -i 'electron|preload\.ts|\.cline/docs' .rules` → exit 1.
- `openspec/config.yaml`: backend/plan/источник DTO обновлены, YAML читается.
- `SECURITY.md`: diff с baseline пуст — правок не потребовалось.
- **Матрица `docs/DESKTOP_TAURI.md` не изменена:** строки 227–235 побайтно совпадают с
  `bf22427` (Fedora Workstation 44 — `verified`; macOS arm64 DMG — `unverified`;
  Windows 11 portable zip — `unverified`). Diff документа касается только заголовка режимов
  и секции закрытого gate 5.2.
- **Root `rg -i electron` (без `archive/`, lockfile, `node_modules`, `target`) — 43 файла,
  классификация:**

| Категория | Файлы/места | Вердикт |
| --- | --- | --- |
| Conserved RAG/splash surfaces | `shared/apis/rag-ipc/**`, `chat-rag-loader.ts`, `pages/main/**/splash-screen*`, `widgets/settings/tests/rag-ipc.ts` + local `legacy-*` types | разрешено D4; live entry points отключены, `TODO(rag)`/`TODO(splash)` на месте |
| Conserved translation bridge | `shared/lib/hooks/use-electron-translation/**`, его вызовы в `settings.tsx`/`main.tsx`/`splash-screen.tsx` | разрешено D4; `getLegacyDesktopIpc()` → `null` в HTTP/Tauri, best-effort no-op |
| Fail-fast удалённого флага | `detect-transport.ts`, `detect-transport.test.ts` | требование D3/2.2, IO не создаётся |
| Комментарии/JSDoc | `settings.tsx:184`, `main.tsx:43/120/127`, splash JSDoc, `vite.config.ts:19-21` | только текст, не путь исполнения |
| Документация | `README.md:122`, `README_RU.md:122` | заметка о переносе из архивной Electron-установки, разрешена D7 |
| OpenSpec specs | 13 файлов `openspec/specs/**` | atom-scoped история/запреты (`MUST NOT` внутри своего атома); массово не переписывались по 6.3 |
| Артефакты change | `proposal.md`, `design.md`, `tasks.md`, `ACCEPTANCE.md`, 5 delta | текущий change |
| Lockfile | `electron-to-chromium` (транзитивно browserslist) | разрешено D7 |

- В `.gitignore`, `.dockerignore`, `.github`, `scripts`, `docker`,
  `react-app/package.json`, `react-app/scripts` ссылок `electron-app|move-build-to-electron|react:build`
  нет (`rg` exit 1).

### 5.7. 8.7 — main specs и strict validation

- Пять main specs существуют и обновлены: `react-backend-client`, `mvp-api-contract`,
  `rust-workspace`, `tauri-thin-host`, `desktop-tauri-build` (есть в diff с baseline).
- `openspec show mvp-api-contract --type spec --json` → exit 0, id `mvp-api-contract`,
  10 requirements; Purpose самодостаточен (DTO `underlator-core/src/domain/`, без legacy source).
- `rg 'preload\.ts|electron-app/src' openspec/specs/mvp-api-contract/spec.md` → exit 1 (пусто).
- `openspec validate remove-electron-7-1 --strict` → exit 0, `Change ... is valid`.
- **Исправлено 2026-11-21 (archive dry-run на копии):** после sync заголовки
  `## MODIFIED Requirements` в пяти delta всё ещё ссылались на pre-rename имена, поэтому
  `openspec archive` падал на первом MODIFIED («header not found»). MODIFIED-заголовки приведены
  к post-rename именам (`TO` из RENAMED): `Verified Fedora gate precedes legacy host removal`,
  `Model/Catalog/Chat contract is self-contained`,
  `Contract documentation cleanup preserves runtime behavior`,
  `BackendClient exposes the core MVP surface`,
  `Supported application trees match dual-mode delivery`,
  `Desktop MVP parity and live acceptance checklist`.
  `openspec validate remove-electron-7-1 --strict` → exit 0 без INFO. Прогон
  `openspec archive remove-electron-7-1 -y --json` на копии `openspec/` завершился успешно:
  `specsUpdated=false`, totals 0, main specs не изменились; единственное warning —
  `REMOVED requirement "Electron transport keeps current desktop working" ... treating it as
  already removed`. В реальном дереве archive не запускался.

### 5.8. 8.8 — scope audit

- `git diff --shortstat bf22427..HEAD` → `136 files changed, 1324 insertions(+), 34926 deletions(-)`;
  удаление сосредоточено в `electron-app/**` и `electron-transport*`.
- **Нет новых DTO/use-cases/routes/commands:** diff `crates/underlator-tauri/src` пуст;
  `crates/underlator-server/src` менялся только в `http_tests.rs` (тесты);
  `application/model.rs` меняет реализацию существующих `generate`/`stop`, публичные
  сигнатуры не добавлены.
- **Нет SSE→WebSocket:** HTTP transport и контракт по-прежнему SSE
  (`/api/model|chat`, `text/event-stream`); упоминания WebSocket в diff — удалённые
  legacy lockfile-пакеты и исторические comments/spec-формулировки.
- **Нет RAG/7.2/Embedded Ollama/OpenRouter/Anthropic/auth/IAM:** маркеры и no-live tests
  на месте; новых модулей/use-case/провайдеров нет.
- **Нет release publication/CI matrix:** `.github` без diff; создан только локальный tag
  `legacy-electron`; `git describe --exact-match HEAD` → exit 128, release-тег не создан.
- **Инструменты:** `bash -n scripts/rename-desktop-artifacts.sh` → 0,
  `./scripts/rename-desktop-artifacts.sh --dry-run` → 0; `docker/` без diff.
  `docker compose config` на этой машине не запускался (Docker CLI отсутствует, exit 127);
  docker-проверка 3.3 ранее пройдена, новых docker-изменений нет.
- **Out-of-scope runtime fix `c03a713`** — существующие use-cases, отдельный коммит по §4.4;
  новых продуктовых возможностей не добавляет и в scope remove-electron не включён.
