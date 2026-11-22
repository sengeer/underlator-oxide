# Spec Delta

## MODIFIED Requirements

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
