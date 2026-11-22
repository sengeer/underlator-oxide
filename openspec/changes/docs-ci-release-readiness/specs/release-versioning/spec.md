# Spec Delta

## Purpose

Задаёт единый источник версии продукта, синхронные носители версии и неизменяемую историю изменений, чтобы релиз и документация не расходились.

## ADDED Requirements

### Requirement: Single source for product version

`crates/underlator-tauri/tauri.conf.json` SHALL быть единственным источником версии продукта. Прочие носители версии MUST быть производными от него и MUST NOT задавать независимую продуктовую версию.

#### Scenario: Version is read from tauri.conf.json
- **WHEN** нужно определить текущую версию продукта
- **THEN** источником MUST быть поле `version` в `crates/underlator-tauri/tauri.conf.json`
- **AND** release-guard MUST сравнивать тег именно с этим значением

#### Scenario: Divergent version source is a defect
- **WHEN** версия в другом носителе отличается от `tauri.conf.json`
- **THEN** расхождение MUST считаться дефектом синхронизации
- **AND** исправление MUST приводить носитель к значению из `tauri.conf.json`

### Requirement: Synchronized version carriers

Версия `0.2.0-beta` SHALL присутствовать во всех носителях: `crates/underlator-tauri/tauri.conf.json`, `react-app/package.json`, `react-app/package-lock.json`, корневой workspace `Cargo.toml` и `Cargo.lock`. Все пять носителей MUST совпадать.

#### Scenario: All carriers show the same version
- **WHEN** проверяется версия после change
- **THEN** `tauri.conf.json`, `react-app/package.json`, корневая запись `react-app/package-lock.json`, `[workspace.package].version` и записи `underlator-*` в `Cargo.lock` MUST содержать `0.2.0-beta`
- **AND** `npm`/`cargo` команды MUST NOT переписывать версию обратно на `0.1.0`

#### Scenario: Cargo lock follows workspace version
- **WHEN** workspace-версия обновлена и зависимости пересобраны
- **THEN** `Cargo.lock` MUST содержать новые версии `underlator-core`, `underlator-server` и `underlator-tauri`
- **AND** `cargo check --workspace` MUST проходить без изменения версии

### Requirement: CHANGELOG history is immutable

`CHANGELOG.md` SHALL сохранять существующую запись `## [0.1.0-beta]` без переписывания: это история legacy Electron-релиза. Новая запись `## [0.2.0-beta] - <дата>` MUST добавляться отдельно и описывать текущий scope.

#### Scenario: Legacy release entry is preserved
- **WHEN** проверяется диф `CHANGELOG.md`
- **THEN** блок `## [0.1.0-beta] - 2026-02-03` и его пункты MUST остаться без смысловых изменений
- **AND** RAG из legacy-записи MUST NOT удаляться как «неактуальный»

#### Scenario: New release entry describes current scope
- **WHEN** читатель открывает `CHANGELOG.md` после change
- **THEN** сверху MUST быть запись `## [0.2.0-beta] - <дата>`
- **AND** она MUST описывать Rust core + dual-mode, отсутствие RAG/splash/embedded и добавление CI/релизов
