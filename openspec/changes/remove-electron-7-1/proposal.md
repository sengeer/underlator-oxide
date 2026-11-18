# Proposal

## Why

После достигнутого паритета MVP `model` / `catalog` / `chat` и готовности dual-mode поставки legacy Electron остаётся третьим неподдерживаемым host-путём: он дублирует транспорт, глобальные типы, build-scripts и документацию. Атом 7.1 устраняет этот слой после подтверждённой готовности Tauri и server, не меняя MVP-контракт и не открывая работы этапа 7.2.

Входные gates зафиксированы как закрытые и не перепроверяются заново как незакрытые этапы:

- **5.2:** канонический AppImage на Fedora Workstation 44 имеет статус **verified** по матрице `docs/DESKTOP_TAURI.md`; smoke выполнен против живого Ollama, а macOS/Windows остаются документированы со своими фактическими статусами.
- **6.1–6.4 закрыты в порядке 6.1 → 6.2 → 6.3 → 6.4:** RAG UI и splash UI законсервированы с `TODO(rag)` / `TODO(splash)`; settings содержит Ollama + `url` + manage models; все три пользовательских perf-checkpoint 6.4 отмечены принятыми в архивном change.
- Порядок дорожной карты: **6.1 → 6.2 → 6.3 → 6.4 → 7.1 → 7.2**. Этот change относится только к 7.1.

## What Changes

- **BREAKING:** удалить `electron-app/` как активный legacy-host и связанные Electron-only build/CI/ignore-правила; перед удалением предусмотреть решение design о сохранении git-ссылки на legacy-код.
- **BREAKING:** удалить `ElectronTransport`, `'electron'` из `BackendMode` / runtime detect и связанные Electron-only типы и тесты. Официальный выбор клиента — явный `VITE_BACKEND_MODE=http|tauri`, затем Tauri runtime detect, затем HTTP.
- **BREAKING:** удалить глобальное `Window.electron` и прямые MVP-зависимости React от него. RAG/splash-заготовки сохранить по варианту A: без удаления модулей и маркеров, с локальными legacy-типами вместо глобальной декларации.
- Перевести оставшиеся settings test helpers на `getBackendClient()` там, где они проверяют MVP; RAG test helpers оставить законсервированными. Нейтрально переименовать Electron-наименования settings slice/constants без смены состояния, defaults или поведения.
- Перестроить client tests так, чтобы HTTP/Tauri detect, запрет legacy-ветки, публичный API, FSD-границы и wire-sites проверялись после удаления; не заменять живые smoke только unit/mock-тестами.
- Обновить README/README_RU, `docs/DESKTOP_TAURI.md`, CONTRIBUTING, правила агентов и `openspec/config.yaml`: два официальных режима — desktop Tauri и docker server; источник MVP-контракта — OpenSpec `mvp-api-contract` и DTO `underlator-core/src/domain/`.
- Привести упоминания Electron в rustdoc и именах тестов `underlator-core` к host-neutral формулировкам без изменения поведения. Строковые IPC/SSE-имена, JSON-ключи DTO, `CHAT_VERSION`, retry/timeout defaults и on-disk совместимость сохранить.
- Зафиксировать live pre-removal parity checklist для desktop Tauri и post-change smoke для Tauri + docker server с явными pass/fail результатами.
- **Не выполнять:** 7.2, возврат RAG/splash/Embedded Ollama, автоматическую миграцию данных legacy `userData`, новые use-cases/routes/commands, смену DTO/JSON/SSE, SSE→WebSocket, auth/multi-user IAM, широкий FSD-рефакторинг и release CI matrix.

## Capabilities

### New Capabilities

Нет: новые долгоживущие поведенческие capabilities не вводятся.

### Modified Capabilities

- `react-backend-client`: остаются только HTTP и Tauri транспорты; удаляются Electron transport/detect и глобальная MVP-зависимость от `window.electron`, а законсервированные RAG/splash-заготовки изолируются локальными типами.
- `mvp-api-contract`: контракт `model` / `catalog` / `chat` становится самодостаточным в OpenSpec и DTO ядра, без ссылок на удалённые preload/types как на источник истины; сериализация и карта имён не меняются.
- `rust-workspace`: актуальная структура репозитория фиксируется как Rust workspace + один React frontend без обязательного `electron-app/`; официальные hosts — server и Tauri.
- `tauri-thin-host`: pre-removal parity checklist уточняется как обязательная живая приёмка MVP на desktop Tauri до удаления legacy transport; после закрытого gate больше нет требования сохранять Electron.
- `desktop-tauri-build`: developer-документация описывает только desktop Tauri и docker server; закрытый Fedora AppImage gate сохраняется как подтверждённое основание удаления, а матрица verified/unverified не меняется.

## Impact

- **React:** `shared/api/ipc` (transport factory/detect/types/constants/tests), `@types/global.d.ts`, `vite-env.d.ts`, conserved RAG/splash modules, settings constants/slice/types/test helpers, `react-app/package.json` и `scripts/move-build-to-electron.js`.
- **Репозиторий:** `electron-app/`, `.gitignore`, `.dockerignore`, потенциальные `.github/*` / `scripts/*` ссылки; `scripts/rename-desktop-artifacts.sh`, `docker/` и Tauri-артефакты должны остаться работоспособными.
- **Документация и правила:** README/README_RU, `docs/DESKTOP_TAURI.md`, CONTRIBUTING/SECURITY при наличии упоминаний, `.rules/{база,экскурсия,mvp-dual-mode-scope,rust-core-host-boundaries}.md`, `openspec/config.yaml` и перечисленные main-spec deltas.
- **Rust:** только русские rustdoc/комментарии и нейтральные имена тестов в `underlator-core`; поведение `underlator-core`, `underlator-server`, `underlator-tauri`, их DTO, routes, commands и хранилища не меняется.
- **Пользователи:** прежний Electron desktop и `VITE_BACKEND_MODE=electron` перестают поддерживаться; автоматический перенос старых данных не выполняется, поэтому требуется явная заметка о ручном переносе и текущих app data dir / docker `/data`.
- **Приёмка:** frontend typecheck/build/unit/lint, Rust checks при документационных правках, живые desktop и docker smoke с записанными результатами; ошибки parity/smoke блокируют завершение удаления.
