# Spec Delta

## Purpose

Задаёт документацию, которая описывает фактический MVP, хранит продуктовые решения в ADR, использует EN как канон с RU-зеркалом и не вводит новый этап плана.

## ADDED Requirements

### Requirement: ADR record product decisions

Tracked-каталог `docs/adr/` SHALL содержать ADR для четырёх решений: embedded Ollama + splash **dropped**, RAG **deferred**, docs policy (EN canon + RU mirror) и single source версии. Каждый ADR MUST фиксировать контекст, решение и последствия.

#### Scenario: Four required ADRs exist
- **WHEN** читатель открывает `docs/adr/`
- **THEN** MUST найти ADR про embedded Ollama + splash, про RAG, про docs policy и про version source
- **AND** каждый ADR MUST содержать разделы контекста, решения и последствий

#### Scenario: Dropped and deferred are distinguished
- **WHEN** ADR классифицирует RAG и embedded/splash
- **THEN** RAG MUST быть `deferred` как отдельная исследовательская задача
- **AND** embedded Ollama и splash MUST быть `dropped`, а не backlog-пунктом

### Requirement: V1 plan changes only its status line

Шапка `.docs/ARCHITECTURAL_PLAN_TAURI_RUST_DUAL_MODE_V1.md` SHALL получить строку `CLOSED at 7.1 (<дата>)`. Тело плана, журнал и `openspec/changes/archive/**` MUST остаться без изменений, а план V2 MUST NOT создаваться.

#### Scenario: Only the header status line changes
- **WHEN** проверяется диф V1-плана
- **THEN** изменение MUST ограничиваться строкой статуса `CLOSED at 7.1 (<дата>)`
- **AND** тело, этапы 8+ и журнал MUST остаться нетронутыми

#### Scenario: No V2 plan is created
- **WHEN** change завершён
- **THEN** MUST NOT появляться новый файл архитектурного плана V2 или roadmap-документ
- **AND** `openspec/changes/archive/**` MUST остаться без правок

### Requirement: Desktop documentation language pair

Desktop-документация SHALL состоять из EN-канона `docs/DESKTOP_TAURI.md` и RU-зеркала `docs/DESKTOP_TAURI_RU.md`. Оба файла MUST содержать языковой переключатель друг на друга, а README каждого языка MUST ссылаться на соответствующий файл.

#### Scenario: Language switcher links the pair
- **WHEN** читатель открывает любой из двух desktop-документов
- **THEN** MUST быть ссылка-переключатель на второй язык
- **AND** EN-файл MUST оставаться каноническим путём для спек

#### Scenario: Content and matrix stay synchronized
- **WHEN** сравниваются EN и RU версии
- **THEN** структура разделов, команды и матрица `verified` / `unverified` MUST совпадать по смыслу
- **AND** Fedora 44 AppImage MUST оставаться `verified`, macOS и Windows — `unverified`

### Requirement: README reflects actual MVP features

`README.md` и `README_RU.md` SHALL описывать только фактический MVP, без RAG как фичи и без намёка на RAG в разделе legacy-чатов. Manage models по URL (атом 6.3) MUST остаться без изменений.

#### Scenario: RAG is not advertised as a feature
- **WHEN** читатель открывает список фич в любом README
- **THEN** пункт про intelligent document analysis (RAG) MUST отсутствовать
- **AND** описание настройки Ollama с полем `url` и manage models MUST остаться

#### Scenario: Legacy chat section does not imply RAG
- **WHEN** читатель открывает раздел про перенос legacy-чатов
- **THEN** текст MUST NOT подразумевать, что RAG доступен в текущем продукте
- **AND** перенос `chats/*.chat.json` MUST остаться описанным

### Requirement: Repository links target underlator-oxide

Ссылки репозитория SHALL указывать на `sengeer/underlator-oxide`: badge `license-url`, badge `release-url` в обоих README и `repository.url` в `react-app/package.json`. Архивный Electron-репозиторий `sengeer/underlator` MUST упоминаться отдельно как archived и только как история.

#### Scenario: README badges point to the active repository
- **WHEN** проверяются ссылки badges в `README.md` и `README_RU.md`
- **THEN** `license-url` и `release-url` MUST вести на `github.com/sengeer/underlator-oxide`
- **AND** ссылок на `underlator/underlator` или `Sengeer/underlator` как на активный репозиторий MUST NOT остаться

#### Scenario: Archived Electron version is linked explicitly
- **WHEN** читатель ищет Electron-версию продукта
- **THEN** оба README MUST содержать ссылку `https://github.com/sengeer/underlator` с пометкой archived
- **AND** она MUST быть представлена как история, а не как поддерживаемая версия

### Requirement: Tracked documentation survives gitignore

`.gitignore` SHALL сохранять `/docs/*` для генерируемых артефактов, но обязан содержать `!`-исключения для `docs/adr/**` и `docs/DESKTOP_TAURI_RU.md`. `git check-ignore` MUST подтверждать, что ADR и RU-дока отслеживаются.

#### Scenario: ADR and RU doc are not ignored
- **WHEN** выполняется `git check-ignore` для ADR-файла и `docs/DESKTOP_TAURI_RU.md`
- **THEN** команда MUST завершаться ненулевым кодом и не выводить правило игнора
- **AND** оба пути MUST попадать в `git status` как untracked/tracked, а не как ignored

#### Scenario: Generated docs stay ignored
- **WHEN** Typedoc или другой инструмент создаёт файл в `docs/`
- **THEN** такой файл MUST оставаться ignored
- **AND** исключения MUST NOT открывать игнор для всего каталога `docs/`

### Requirement: Agent rules classify dropped and deferred

`.rules/база.md`, `.rules/экскурсия.md` и `.rules/mvp-dual-mode-scope.md` SHALL классифицировать RAG как `deferred`, а splash и embedded Ollama как `dropped by ADR`, а не pending backlog. `.docs/AGENT_PROMPT_TEMPLATE.md` MUST ссылаться на `.docs/...` вместо битых `.cursor/docs/...`.

#### Scenario: Rules state the ADR classification
- **WHEN** агент читает rules-файлы
- **THEN** RAG MUST быть описан как deferred, требующий нового change и исследования
- **AND** splash и embedded Ollama MUST быть описаны как dropped by ADR, без формулировки «позже»

#### Scenario: Prompt template links resolve
- **WHEN** проверяются ссылки `.docs/AGENT_PROMPT_TEMPLATE.md`
- **THEN** ссылки на план MUST вести на `.docs/ARCHITECTURAL_PLAN_TAURI_RUST_DUAL_MODE_V1.md`
- **AND** битых ссылок `.cursor/docs/...` MUST NOT остаться

### Requirement: Stub comments reflect ADR classification

Комментарии и rustdoc в `crates/underlator-tauri/src/stubs.rs` и `crates/underlator-core/src/domain/rag.rs` SHALL описывать splash/embedded Ollama как dropped, а RAG как deferred. Правки MUST ограничиваться комментариями и rustdoc на русском.

#### Scenario: Stub comments do not promise restoration
- **WHEN** разработчик читает комментарии в `stubs.rs` и `domain/rag.rs`
- **THEN** формулировки MUST ссылаться на ADR и не обещать возврат «позже» или «после MVP»
- **AND** RAG MUST быть описан как deferred, а splash/embedded — как dropped

#### Scenario: Stub edits do not change behavior
- **WHEN** проверяется диф Rust-файлов
- **THEN** MUST отсутствовать изменения сигнатур, тел функций, DTO или тестовых утверждений
- **AND** изменение MUST ограничиваться комментариями и rustdoc
