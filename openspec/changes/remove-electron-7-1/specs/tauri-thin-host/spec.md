# Spec Delta

## RENAMED Requirements

### Requirement: Electron parity checklist for MVP scenarios
FROM: Electron parity checklist for MVP scenarios
TO: Desktop MVP parity and live acceptance checklist

## MODIFIED Requirements

### Requirement: Electron parity checklist for MVP scenarios
До удаления legacy desktop transport SHALL быть зафиксирован live чеклист соответствия desktop Tauri каноническому MVP-контракту `model` / `catalog` / `chat`: happy-path, основные ошибки и persist. Приёмка MUST выполняться на реальном Tauri runtime против живого Ollama; unit/mock и статический анализ MUST NOT засчитываться как её замена. Доказательства закрытого AppImage gate 5.2 MUST предшествовать удалению.

#### Scenario: Parity checklist covers MVP surfaces
- **WHEN** перед удалением legacy transport выполняется desktop Tauri smoke
- **THEN** чеклист MUST записать pass/fail для generate с progress и финальным текстом, stop активной генерации, list, install/remove на безопасной тестовой модели, catalog get/search/getModelInfo и chat CRUD/addMessage/persist после перезапуска
- **AND** отсутствие выполненного пункта MUST NOT считаться pass

#### Scenario: Parity checklist covers primary errors
- **WHEN** desktop Tauri получает недоступного провайдера/модель, unknown chat id или отменяемый stream
- **THEN** чеклист MUST подтвердить классифицированную ошибку или cancellation без успешного фиктивного ответа
- **AND** `getModelInfo` для отсутствующей модели MUST сохранить контрактное `null`, а не превращаться в ошибку «not found»

#### Scenario: Live Tauri evidence is required before deletion
- **WHEN** принимается решение завершить удаление legacy transport
- **THEN** результаты живого Tauri smoke MUST быть записаны в acceptance/tasks с датой, способом запуска (`cargo tauri dev` или AppImage) и pass/fail по сценариям
- **AND** зелёные unit/mock, host tests или TypeScript tests без такого smoke MUST NOT закрывать этот gate

#### Scenario: Unit and tauri-dev do not waive AppImage shipping gate
- **WHEN** инспектируются входные условия атома 7.1
- **THEN** Fedora Workstation 44 AppImage MUST иметь ранее подтверждённый статус `verified` в матрице desktop docs
- **AND** новая приёмка MUST NOT изменять статусы macOS/Windows или объявлять их verified без фактического запуска
