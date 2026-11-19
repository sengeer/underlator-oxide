# rust-workspace Specification

## Purpose
Описывает каркас Rust monorepo Underlator: Cargo workspace, три crates (core / server / tauri), docker stubs и требования к smoke-сборке без переноса бизнес-логики.

## Requirements

### Requirement: Cargo workspace exists in repository root
The repository SHALL contain a root `Cargo.toml` that defines a Cargo workspace whose members include `crates/underlator-core`, `crates/underlator-server`, and `crates/underlator-tauri`.

#### Scenario: Workspace members are declared
- **WHEN** a developer opens the root `Cargo.toml`
- **THEN** the workspace members list includes exactly those three crate paths as first-class members for the dual-mode backend scaffold

### Requirement: Core library crate boundary
The project SHALL provide `crates/underlator-core` as a Rust library crate that holds shared backend logic and MUST NOT depend on `tauri`, `axum`, or Electron packages.

#### Scenario: Core is a library without host frameworks
- **WHEN** `crates/underlator-core/Cargo.toml` is inspected
- **THEN** the crate is configured as a library and its dependencies do not include `tauri` or `axum`

### Requirement: Server host crate stub
The project SHALL provide `crates/underlator-server` as a binary crate intended for the Docker/web host, depending on `underlator-core`.

#### Scenario: Server depends on core
- **WHEN** `crates/underlator-server/Cargo.toml` is inspected
- **THEN** it declares a binary package and a path dependency on `underlator-core`

### Requirement: Tauri host crate stub
The project SHALL provide `crates/underlator-tauri` as the desktop host crate depending on `underlator-core`. After atom 5.1 the crate MUST expose a runnable Tauri 2 host that registers the MVP `model` / `catalog` / `chat` command surface over core (native desktop feature flags MAY gate full WebView runtime on CI machines without GTK/WebKit). After atom 5.2 the crate MUST additionally support documented release bundling for canonical desktop artifacts (Linux AppImage, macOS arm64 DMG, Windows portable zip) via `tauri.conf` / scripts without rewriting MVP commands. The crate MUST remain free of LLM business rules and MUST NOT depend on calling Ollama HTTP outside `underlator-core`.

#### Scenario: Tauri crate depends on core
- **WHEN** `crates/underlator-tauri/Cargo.toml` is inspected
- **THEN** it declares a path dependency on `underlator-core`
- **AND** it MUST NOT add a dependency that lets the host call Ollama HTTP bypassing core

#### Scenario: Desktop host exposes MVP surface
- **WHEN** атом 5.1 завершён и desktop feature/runtime доступны
- **THEN** `underlator-tauri` MUST регистрировать 14 MVP Tauri commands по карте ядра
- **AND** `cargo check --workspace` MUST проходить на машине со scaffold-зависимостями (без обязательного полного WebView в default features, если так зафиксировано в design)

#### Scenario: Release bundling configured after atom 5.2
- **WHEN** атом 5.2 завершён
- **THEN** конфигурация `underlator-tauri` MUST объявлять/поддерживать bundle targets для канонических артефактов desktop (AppImage / arm64 dmg / portable zip)
- **AND** MUST NOT требовать новой бизнес-логики в core для выпуска этих артефактов

### Requirement: Docker stubs directory
The repository SHALL include a `docker/` directory with `Dockerfile` and `docker-compose` files for the web delivery mode. These files MUST build and run the server host together with a sidecar Ollama, including a volume for application data. They MUST NOT remain echo/TODO stubs that cannot start the binary.

#### Scenario: Docker stubs present
- **WHEN** a developer lists `docker/`
- **THEN** both a Dockerfile and a compose file exist
- **AND** the Dockerfile MUST produce an image that starts `underlator-server` rather than printing a stub message
- **AND** compose MUST declare server and ollama services plus a data volume for the server `StorageRoot`

### Requirement: Workspace smoke build
The Rust workspace SHALL compile successfully via `cargo check --workspace` after the scaffold is applied on a properly provisioned machine.

#### Scenario: Smoke check passes
- **WHEN** a developer runs `cargo check --workspace` from the repository root
- **THEN** the command exits successfully for all workspace members

### Requirement: Supported application trees match dual-mode delivery
Репозиторий SHALL сохранять `react-app` и Rust workspace из core/server/Tauri как единственные поддерживаемые application trees для dual-mode MVP. Каталог legacy desktop host MUST NOT требоваться для build, test, run или docker; его прежние версии MAY быть восстановлены только из git-истории или согласованного tag/архива.

#### Scenario: Legacy apps still present
- **WHEN** проверяется прежний инвариант сохранности application trees после завершения 7.1
- **THEN** `react-app/`, `crates/underlator-core/`, `crates/underlator-server/` и `crates/underlator-tauri/` MUST оставаться рабочими
- **AND** прежнее требование присутствия `electron-app/` MUST быть снято, а официальные пути запуска MUST ограничиваться desktop Tauri и docker server

#### Scenario: Legacy tree is not a build prerequisite
- **WHEN** разработчик собирает React, Rust workspace или docker image из актуального дерева
- **THEN** наличие каталога `electron-app/` MUST NOT требоваться
- **AND** активные scripts, ignore rules и документация MUST NOT направлять разработчика в legacy host
