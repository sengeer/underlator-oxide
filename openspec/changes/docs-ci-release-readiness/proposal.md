# Proposal

## Why

Миграция на Rust / Tauri 2 / dual-mode закрыта на атоме 7.1: `electron-app`, `ElectronTransport` и legacy-ветка транспорта удалены, а оба официальных режима (desktop Tauri и docker server) работают на общем `underlator-core`. При этом продукт остаётся «недокументированным для внешнего читателя»: README всё ещё заявляет RAG как фичу, ссылки badge/`repository.url` указывают на архивный Electron-репозиторий, desktop-документация существует только на русском, версия рассинхронизирована между носителями, а CI и release-workflow отсутствуют. Пора закрыть post-migration gap и сделать поставку воспроизводимой без открытия нового этапа плана.

Этапа после 7.1 в архитектурном плане V1 нет. Этот change — только docs / CI / release readiness: план V2 не создаётся, тело и журнал V1 не переписываются (допустима только строка статуса в шапке).

## What Changes

- Зафиксировать продуктовые решения как ADR: Embedded Ollama manager и splash **dropped** (не backlog), RAG **deferred** (не «todo»), docs policy (EN canon + RU mirror), single source версии.
- Переклассифицировать консервацию RAG/splash: маркеры `TODO(rag)` / `TODO(splash)` и модули остаются, но формулировка меняется с «restore when lands» на «restoration not planned, requires new change + ADR update»; capability не переименовывается.
- Привести документацию к фактическому MVP: убрать RAG из фич README, связать версии с архивным Electron-репозиторием `sengeer/underlator`, исправить badge `license-url` / `release-url` и `repository.url` на `sengeer/underlator-oxide`.
- Разделить desktop-документацию на EN canon `docs/DESKTOP_TAURI.md` и RU mirror `docs/DESKTOP_TAURI_RU.md` с языковыми переключателями; содержимое и матрица `verified` / `unverified` синхронны и неизменны.
- Ввести единый источник версии `0.2.0-beta` (`crates/underlator-tauri/tauri.conf.json`) и синхронизировать `react-app/package.json`, `react-app/package-lock.json`, workspace `Cargo.toml` и `Cargo.lock`; добавить запись `## [0.2.0-beta]` в `CHANGELOG.md`, не переписывая историю `0.1.0-beta` (legacy Electron-релиз).
- Добавить `ci.yml` (push + PR, матрица ubuntu/macos/windows, frontend + Rust + опциональный tauri-check с native deps) и `release.yml` (тег `v*` + `workflow_dispatch`, guard версии, draft release с тремя каноническими ассетами).
- Обновить About: версия из `package.json`, описание, ссылка на `underlator-oxide`, отдельная строка про архивную Electron-версию, автор, контакт, лицензия и копирайт — через Lingui `Trans`, без новых зависимостей.
- Переклассифицировать правила агентов и заглушки: `.rules/{база,экскурсия,mvp-dual-mode-scope}.md` и rustdoc/комментарии `stubs.rs` / `domain/rag.rs` описывают RAG как `deferred`, а splash/embedded Ollama как `dropped by ADR`, а не как pending backlog. Указатель на V1-план и несуществующую ветку `migrate/rust-core` в `.rules/экскурсия.md` заменяется, а `context` в tracked `openspec/config.yaml` фиксирует CLOSED-статус V1 и `docs/adr/` как место решений.
- Исправить битые ссылки `.docs/AGENT_PROMPT_TEMPLATE.md` (`.cursor/docs/...` → `.docs/...`) и добавить tracked `docs/adr/` + `docs/DESKTOP_TAURI_RU.md` в исключения `.gitignore` с проверкой `git check-ignore`.

## Capabilities

### New Capabilities

- `ci-release-automation`: воспроизводимый CI на push/PR и release-workflow на тег `v*`, guard версии, draft release с каноническими именами ассетов; CI build явно не равен статусу `verified`.
- `release-versioning`: единый источник версии продукта, синхронные носители версии и неизменяемая история CHANGELOG с новой записью текущего scope.
- `project-documentation`: ADR как место продуктовых решений, policy EN canon + RU mirror для desktop-доки, актуальность README относительно MVP и архивного Electron-репозитория, а также корректность tracked-документации и ссылок агентских инструкций.
- `about-dialog`: содержимое модального окна About (версия, описание, ссылки, архивная версия, автор, контакт, лицензия, копирайт) через Lingui.

### Modified Capabilities

- `desktop-tauri-build`: требование к `docs/DESKTOP_TAURI.md` теперь покрывает два файла (EN canon + RU mirror) с языковыми переключателями; матрица `verified` / `unverified` не меняется.
- `rag-ui-conservation`: маркеры и модули остаются, но их семантика меняется на «restoration not planned»; возврат требует нового change и обновления ADR.
- `splash-ui-conservation`: то же для splash-консервации — маркеры остаются, возврат не планируется и требует нового change + ADR update.

## Impact

- **Документация:** `README.md`, `README_RU.md`, `docs/DESKTOP_TAURI.md`, новый `docs/DESKTOP_TAURI_RU.md`, новый `docs/adr/*`, `CHANGELOG.md`, `.docs/AGENT_PROMPT_TEMPLATE.md`.
- **Правила и заглушки:** `.rules/база.md`, `.rules/экскурсия.md`, `.rules/mvp-dual-mode-scope.md`, `openspec/config.yaml` (только `context`), `crates/underlator-tauri/src/stubs.rs`, `crates/underlator-core/src/domain/rag.rs` (только комментарии/rustdoc).
- **Метаданные и версия:** `crates/underlator-tauri/tauri.conf.json`, `react-app/package.json`, `react-app/package-lock.json`, корневой `Cargo.toml`, `Cargo.lock`.
- **UI:** только `react-app/src/pages/main/ui/about.tsx` и строки Lingui; без FSD-рефакторинга и новых зависимостей.
- **CI/CD:** новые `.github/workflows/ci.yml` и `.github/workflows/release.yml`; workflow-файлов в репозитории сейчас нет.
- **Репозиторий:** `.gitignore` получает точечные `!`-исключения для tracked ADR и RU-доки; `git check-ignore` подтверждает отслеживаемость.
- **Не затрагивается:** бизнес-логика `underlator-core`, DTO, routes, commands, `docker/`, консервированные RAG/splash модули и маркеры, `openspec/changes/archive/**`, тело/журнал V1-плана, `bundle.targets`; релиз не публикуется, тег не создаётся.
