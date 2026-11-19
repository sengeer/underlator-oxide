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

Не начат и в текущем scope групп 2–3 не выполняется.
