# ci-release-automation Specification

## Purpose
Задаёт воспроизводимую проверку репозитория и выпуск канонических desktop-артефактов через GitHub Actions, не меняя продуктовую логику и не превращая CI-сборку в приёмку платформы.

## Requirements

### Requirement: Continuous integration quality gate

GitHub Actions workflow `ci.yml` SHALL запускаться на `push` и `pull_request`, использовать `permissions: contents: read` и матрицу `ubuntu-24.04` / `macos-latest` (arm64) / `windows-latest`. Проверки frontend и Rust MUST выполняться на каждой ОС матрицы, а провал любой проверки MUST делать job неуспешным.

#### Scenario: CI runs on push and pull request
- **WHEN** workflow `ci.yml` присутствует в ветке по умолчанию
- **THEN** он MUST запускаться на события `push` и `pull_request`
- **AND** `permissions` MUST ограничивать токен значением `contents: read`

#### Scenario: Matrix covers three operating systems
- **WHEN** запускается `ci.yml`
- **THEN** jobs MUST выполняться на `ubuntu-24.04`, `macos-latest` и `windows-latest`
- **AND** отсутствие одной из ОС в матрице MUST считаться нарушением контракта CI

### Requirement: Frontend checks with Node 22

Frontend job SHALL использовать Node.js 22 с npm cache и переменной `HUSKY=0`, затем последовательно выполнять в `react-app` команды `npm run type:check`, `npm run lint`, `npm run test`, `npm run build`. Ненулевой код любой команды MUST останавливать job.

#### Scenario: Frontend gates run in documented order
- **WHEN** frontend job матрицы запускается
- **THEN** `type:check` MUST выполниться раньше `lint`, `lint` раньше `test`, а `test` раньше `build`
- **AND** провал любой из четырёх команд MUST завершать job с ненулевым кодом

#### Scenario: Git hooks do not block CI
- **WHEN** CI выполняет npm-команды в чистом окружении
- **THEN** `HUSKY=0` MUST отключать установку и запуск git-хуков
- **AND** сборка MUST NOT зависеть от локального состояния `.git/hooks`

### Requirement: Rust checks and architecture lint

Rust job SHALL использовать stable toolchain и cargo cache, выполнять `cargo check --workspace`, `cargo test -p underlator-core` (включая architecture-тест) и `cargo clippy -p underlator-core -- -D warnings`. Эти проверки MUST NOT требовать native desktop-зависимостей.

#### Scenario: Rust gates run without desktop native deps
- **WHEN** Rust job выполняется на любой ОС матрицы
- **THEN** `cargo check --workspace`, `cargo test -p underlator-core` и `cargo clippy -p underlator-core -- -D warnings` MUST завершаться успешно без установки GTK/WebKitGTK
- **AND** предупреждение clippy MUST трактоваться как ошибка

#### Scenario: Architecture test is part of CI
- **WHEN** Rust job запускает `cargo test -p underlator-core`
- **THEN** architecture-тест из `crates/underlator-core` MUST входить в прогон
- **AND** нарушение hex-границ MUST проваливать job

### Requirement: Tauri check requires native dependencies

Проверка Tauri SHALL выполняться только в job, где установлены native deps. На `ubuntu-24.04` MUST устанавливаться `libwebkit2gtk-4.1-dev`, `libgtk-3-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev` и `patchelf`; отсутствие зависимостей MUST NOT маскироваться успешным шагом.

#### Scenario: Ubuntu Tauri job installs required packages
- **WHEN** job с tauri-check запускается на `ubuntu-24.04`
- **THEN** до сборки MUST установить перечисленные native packages
- **AND** tauri-check MUST выполняться после их установки

#### Scenario: Tauri check failure is visible
- **WHEN** tauri-check не может собрать host из-за отсутствующих native deps
- **THEN** job MUST завершиться с ошибкой
- **AND** workflow MUST NOT подменять проверку шагом, который всегда успешен

### Requirement: Release workflow version guard

`release.yml` SHALL запускаться на `push` тега `v*` и на `workflow_dispatch` в build-only режиме с `permissions: contents: write`. На теге guard MUST сравнить версию тега с `crates/underlator-tauri/tauri.conf.json`, а несовпадение MUST останавливать workflow. Для `workflow_dispatch` guard MUST NOT требовать тег.

#### Scenario: Matching tag passes the guard
- **WHEN** пушнутый тег `v0.2.0-beta` соответствует `version` в `tauri.conf.json`
- **THEN** guard MUST пропустить workflow к сборке
- **AND** версия ассетов MUST совпадать с версией тега

#### Scenario: Mismatched tag fails before build
- **WHEN** версия тега не совпадает с `version` в `tauri.conf.json`
- **THEN** workflow MUST завершиться с ошибкой до шагов сборки
- **AND** ни один release-ассет MUST NOT быть создан

#### Scenario: Manual dispatch builds without publishing
- **WHEN** workflow запускается через `workflow_dispatch`
- **THEN** он MUST работать в build-only режиме
- **AND** публикация release MUST NOT выполняться

### Requirement: Draft release with canonical artifacts

Release job на теге `v*` SHALL создавать **draft** release и прикреплять к нему канонические ассеты: `Underlator-<version>-linux-x86_64.AppImage`, `Underlator-<version>-macos-arm64.dmg`, `Underlator-<version>-win-x64-portable.zip`. При `workflow_dispatch` release MUST NOT создаваться. Сборка MUST использовать `--features desktop`; NSIS, MSI и `.deb` MUST NOT считаться заменой этих ассетов.

#### Scenario: Linux job produces AppImage
- **WHEN** release job выполняется на `ubuntu-24.04`
- **THEN** он MUST собрать `cargo tauri build --features desktop --bundles appimage`
- **AND** прикрепить файл `Underlator-<version>-linux-x86_64.AppImage`

#### Scenario: macOS job produces arm64 DMG
- **WHEN** release job выполняется на `macos-latest` (arm64)
- **THEN** он MUST собрать `--features desktop --target aarch64-apple-darwin --bundles dmg`
- **AND** прикрепить файл `Underlator-<version>-macos-arm64.dmg`

#### Scenario: Windows job produces portable zip
- **WHEN** release job выполняется на `windows-latest`
- **THEN** он MUST собрать `--features desktop --no-bundle`, не меняя `bundle.targets` в `tauri.conf.json`
- **AND** прикрепить `Underlator-<version>-win-x64-portable.zip` с `.exe` внутри

#### Scenario: Draft release is not published automatically
- **WHEN** все три job завершили сборку
- **THEN** release MUST оставаться в состоянии **draft**
- **AND** публикация MUST требовать отдельного действия человека

### Requirement: CI build does not imply verified status

Успешная сборка macOS или Windows в CI MUST NOT переводить платформу в `verified`. Матрица `verified` / `unverified` в desktop-документации MUST оставаться неизменной до отдельного ручного smoke на реальной машине.

#### Scenario: Green macOS or Windows build keeps unverified
- **WHEN** `release.yml` успешно собирает DMG или portable zip
- **THEN** соответствующий статус в `docs/DESKTOP_TAURI.md` MUST оставаться `unverified`
- **AND** `verified` MUST требовать отдельного ручного smoke, а не факта CI-сборки

### Requirement: Release publication remains manual

Workflow MUST NOT публиковать release, создавать или пушить тег, менять `bundle.targets` и трогать `docker/`. Тег `v0.2.0-beta` и публикацию draft release выполняет человек.

#### Scenario: Workflow does not create tags
- **WHEN** `ci.yml` или `release.yml` выполняются
- **THEN** они MUST NOT создавать или пушить git-теги
- **AND** `bundle.targets` MUST оставаться `["appimage","dmg"]`

#### Scenario: Human publishes the draft
- **WHEN** три канонических ассета прикреплены к draft release
- **THEN** решение о публикации MUST принимать человек
- **AND** workflow MUST NOT выполнять публикацию автоматически
