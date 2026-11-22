# desktop-tauri-build Specification

## Purpose
Задаёт воспроизводимую сборку и запуск Tauri desktop Underlator с каноническими релизовыми артефактами (Linux AppImage, macOS arm64 DMG, Windows portable zip) и developer-документацией для двух официальных режимов. Сохраняет закрытый приёмочный gate на Fedora Workstation 44 как историческое доказательство готовности desktop-поставки.

## Requirements

### Requirement: Canonical desktop release artifact names
Репозиторий SHALL производить (или документировать шаг rename до) релизовые артефакты desktop с каноническими именами, где `<version>` берётся из semver продукта / `tauri.conf` (пример плана: `0.1.0-beta`):

| Платформа | Формат | Каноническое имя |
| --- | --- | --- |
| Linux x86_64 | `.AppImage` | `Underlator-<version>-linux-x86_64.AppImage` |
| macOS Apple Silicon | `.dmg` arm64 | `Underlator-<version>-macos-arm64.dmg` |
| Windows 11 | portable zip (допустимо rar) с `.exe` | `Underlator-<version>-win-x64-portable.zip` |

Обязательный DoD-формат Linux MUST быть **AppImage**; macOS MUST быть **dmg** для **arm64** (не Intel x86_64 в скоупе 5.2); Windows MUST быть **portable** архив с `.exe`. Форматы `.deb`, MSI и NSIS MUST NOT считаться заменой канонических форматов в DoD этого атома.

#### Scenario: Linux AppImage matches canonical name
- **WHEN** на Linux x86_64 выполняется release-сборка desktop host с feature `desktop`
- **THEN** MUST существовать файл `Underlator-<version>-linux-x86_64.AppImage` (напрямую из bundle или после документированного rename)
- **AND** обязательный DoD MUST NOT принимать только `.deb` вместо AppImage

#### Scenario: macOS and Windows canonical names are defined
- **WHEN** документируется или выполняется сборка macOS arm64 / Windows x64
- **THEN** целевые имена MUST быть `Underlator-<version>-macos-arm64.dmg` и `Underlator-<version>-win-x64-portable.zip` (или `.rar` portable с `.exe`)
- **AND** MSI/NSIS MUST NOT заменять portable zip в DoD

### Requirement: Reproducible build and run commands
Проект SHALL документировать и поддерживать воспроизводимую цепочку: сборка `react-app` → `cargo tauri dev` / `cargo tauri build` с feature `desktop` для `underlator-tauri`. Конфигурация Tauri (`tauri.conf.json` и связанные scripts) MUST указывать frontend dist / hooks так, чтобы release-сборка подтягивала собранный UI без ручного «секретного» пути только через ad-hoc `tauri dev`.

#### Scenario: Developer can build desktop from documented commands
- **WHEN** разработчик следует документу desktop Tauri на машине с native prerequisites
- **THEN** MUST существовать явная последовательность команд для `react-app` build и `cargo tauri build` (feature `desktop`)
- **AND** `tauri.conf` MUST ссылаться на frontend dist `react-app` (как в 5.1) с необходимыми beforeBuild/dev hooks

### Requirement: Native prerequisites documented per OS
Документация SHALL перечислять native prerequisites:

- Linux: GTK / WebKitGTK и связанные пакеты; отдельно — зависимости для сборки AppImage на Fedora
- macOS: Xcode Command Line Tools / WebView, target arm64
- Windows 11: WebView2 и build tools, достаточные для portable-сборки

#### Scenario: Fedora AppImage prerequisites are listed
- **WHEN** разработчик читает desktop doc перед сборкой на Fedora
- **THEN** MUST найти список пакетов/deps для Tauri WebView и для AppImage bundling
- **AND** типичные ошибки отсутствующих deps MUST быть описаны кратко

### Requirement: Desktop modes and environment documentation

Проект SHALL поддерживать EN-канон `docs/DESKTOP_TAURI.md` и его RU-зеркало `docs/DESKTOP_TAURI_RU.md`, а также связанный README-раздел на каждом языке. Оба документа MUST описывать только два официальных режима: desktop Tauri и docker server; README каждого языка MUST ссылаться на документ своего языка. Документация MUST содержать `OLLAMA_BASE_URL`, data dir/override, команды артефактов и неизменную фактическую матрицу `verified` / `unverified`; legacy desktop MUST NOT представляться активным или временно поддерживаемым путём.

#### Scenario: Modes and env are documented
- **WHEN** клонировавший репозиторий открывает desktop doc на своём языке
- **THEN** MUST быть однозначно указано, что desktop использует Tauri, а web/docker — server
- **AND** MUST быть указаны `OLLAMA_BASE_URL`, desktop app data dir, `UNDERLATOR_DATA_DIR` и docker `/data`
- **AND** MUST NOT быть инструкции запуска или сборки legacy desktop host

#### Scenario: Language pair is discoverable
- **WHEN** читатель открывает `docs/DESKTOP_TAURI.md` или `docs/DESKTOP_TAURI_RU.md`
- **THEN** MUST быть языковой переключатель на второй файл пары
- **AND** README на языке читателя MUST ссылаться на соответствующий файл пары
- **AND** EN-файл MUST оставаться каноническим путём для спек

#### Scenario: Verification matrix distinguishes verified and unverified
- **WHEN** документация обновляется для удаления legacy host
- **THEN** Fedora 44 AppImage MUST остаться `verified` с прежним доказательством живого smoke
- **AND** macOS / Windows MUST сохранить фактические статусы `unverified`, пока не выполнен отдельный smoke
- **AND** обновление формулировок режимов MUST NOT переписывать строки матрицы или её выводы

### Requirement: Fedora Workstation 44 AppImage acceptance gate
Атом 5.2 SHALL считаться принятым только после жёсткого gate на **Fedora Workstation 44** (без N/A):

1. Собран артефакт `Underlator-*-linux-x86_64.AppImage` с каноническим именем
2. AppImage запускается на этой Fedora
3. UI доступен
4. Живой smoke MVP против **локального Ollama**: `model` (generate/stop как минимум; list/install/remove по чеклисту), `catalog` (get/search/getModelInfo), `chat` (CRUD + persist / addMessage)

`cargo tauri dev`, unit/mock host-тесты атома 5.1 и факт «бинарь/AppImage файл появился» MUST NOT заменять этот gate. Docs + команды для macOS arm64 DMG и Windows portable zip обязательны даже если smoke там `unverified`; это MUST NOT ослаблять Linux AppImage gate.

#### Scenario: AppImage smoke passes on Fedora 44
- **WHEN** валидатор на Fedora Workstation 44 запускает канонический AppImage при работающем локальном Ollama
- **THEN** UI MUST открыться и MVP `model` / `catalog` / `chat` MUST пройти живой smoke (generate/stop, catalog, chat CRUD/persist)
- **AND** атом MUST NOT помечаться принятым, если выполнен только `tauri dev` или unit/mock без AppImage smoke

#### Scenario: Missing Mac or Windows machine does not waive Linux gate
- **WHEN** нет машины для macOS или Windows smoke
- **THEN** соответствующая строка матрицы MUST быть `unverified` с пошаговой инструкцией сборки
- **AND** Linux AppImage gate на Fedora 44 MUST всё равно быть выполнен для приёмки атома

### Requirement: Verified Fedora gate precedes legacy host removal
Атом 7.1 SHALL опираться на уже закрытый gate 5.2: канонический AppImage запущен на Fedora Workstation 44, живой MVP smoke против Ollama пройден, macOS/Windows задокументированы. Перед удалением MUST быть проверено наличие этих доказательств; повторное требование сохранять legacy host после закрытия gate больше не действует.

#### Scenario: Electron remains until 5.2 closed
- **WHEN** оценивается порядок исторического gate и последующего атома 7.1
- **THEN** до закрытия 5.2 legacy host MUST сохраняться, а удаление MUST начинаться только после подтверждённого Fedora AppImage smoke
- **AND** после статуса `verified` новое требование продолжать сохранять legacy host MUST NOT применяться

#### Scenario: Closed Fedora gate authorizes cleanup
- **WHEN** начинается удаление legacy desktop host
- **THEN** матрица desktop docs MUST показывать Fedora 44 AppImage `verified`, а `acceptance-smoke.json` с `all_ok` MUST оставаться описанным доказательством
- **AND** инструкции macOS arm64 DMG и Windows portable zip MUST оставаться доступными
- **AND** unit/mock или повторный `tauri dev` MUST NOT подменять это ранее полученное AppImage-доказательство

#### Scenario: Gate history does not imply a supported third host
- **WHEN** читатель просматривает обновлённую desktop-документацию после 7.1
- **THEN** закрытый gate MAY быть описан как историческое основание удаления
- **AND** документация MUST NOT содержать отложенное будущее удаление или предлагать legacy host как текущий production/development режим

### Requirement: Out of scope surfaces stay untouched
Атом 5.2 MUST NOT: менять бизнес-логику или DTO `underlator-core`; добавлять RAG / splash / embedded Ollama runtime; править `underlator-server` / docker вне крайней дыры контракта; широко рефакторить React/FSD вне нужного для desktop build/run; требовать обязательный CI matrix / release upload артефактов.

#### Scenario: Core DTO and Electron stay intact
- **WHEN** diff атома 5.2 инспектируется
- **THEN** MUST NOT быть смены MVP DTO/use-cases «с нуля» в core
- **AND** MUST NOT быть удаления Electron как части 5.2
- **AND** CI release upload MAY отсутствовать без провала DoD
