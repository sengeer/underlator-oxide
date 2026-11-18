# Spec Delta

## RENAMED Requirements

### Requirement: Existing Electron and React apps remain intact
FROM: Existing Electron and React apps remain intact
TO: Supported application trees match dual-mode delivery

## MODIFIED Requirements

### Requirement: Existing Electron and React apps remain intact
Репозиторий SHALL сохранять `react-app` и Rust workspace из core/server/Tauri как единственные поддерживаемые application trees для dual-mode MVP. Каталог legacy desktop host MUST NOT требоваться для build, test, run или docker; его прежние версии MAY быть восстановлены только из git-истории или согласованного tag/архива.

#### Scenario: Legacy apps still present
- **WHEN** проверяется прежний инвариант сохранности application trees после завершения 7.1
- **THEN** `react-app/`, `crates/underlator-core/`, `crates/underlator-server/` и `crates/underlator-tauri/` MUST оставаться рабочими
- **AND** прежнее требование присутствия `electron-app/` MUST быть снято, а официальные пути запуска MUST ограничиваться desktop Tauri и docker server

#### Scenario: Legacy tree is not a build prerequisite
- **WHEN** разработчик собирает React, Rust workspace или docker image из актуального дерева
- **THEN** наличие каталога `electron-app/` MUST NOT требоваться
- **AND** активные scripts, ignore rules и документация MUST NOT направлять разработчика в legacy host
