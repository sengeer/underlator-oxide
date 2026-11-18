# Spec Delta

## RENAMED Requirements

### Requirement: Gate before Electron removal (atom 6.1)
FROM: Gate before Electron removal (atom 6.1)
TO: Verified Fedora gate precedes legacy host removal

## MODIFIED Requirements

### Requirement: Desktop modes and environment documentation
Проект SHALL поддерживать документ `docs/DESKTOP_TAURI.md` и связанный README-раздел, описывающие только два официальных режима: desktop Tauri и docker server. Документация MUST содержать `OLLAMA_BASE_URL`, data dir/override, команды артефактов и неизменную фактическую матрицу `verified` / `unverified`; legacy desktop MUST NOT представляться активным или временно поддерживаемым путём.

#### Scenario: Modes and env are documented
- **WHEN** клонировавший репозиторий открывает desktop doc
- **THEN** MUST быть однозначно указано, что desktop использует Tauri, а web/docker — server
- **AND** MUST быть указаны `OLLAMA_BASE_URL`, desktop app data dir, `UNDERLATOR_DATA_DIR` и docker `/data`
- **AND** MUST NOT быть инструкции запуска или сборки legacy desktop host

#### Scenario: Verification matrix distinguishes verified and unverified
- **WHEN** документация обновляется для удаления legacy host
- **THEN** Fedora 44 AppImage MUST остаться `verified` с прежним доказательством живого smoke
- **AND** macOS / Windows MUST сохранить фактические статусы `unverified`, пока не выполнен отдельный smoke
- **AND** обновление формулировок режимов MUST NOT переписывать строки матрицы или её выводы

### Requirement: Gate before Electron removal (atom 6.1)
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
