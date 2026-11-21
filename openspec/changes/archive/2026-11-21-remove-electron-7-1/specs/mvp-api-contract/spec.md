# Spec Delta

## RENAMED Requirements

### Requirement: Model contract types mirror preload
FROM: Model contract types mirror preload
TO: Model contract is self-contained

### Requirement: Catalog contract types mirror preload
FROM: Catalog contract types mirror preload
TO: Catalog contract is self-contained

### Requirement: Chat contract types mirror preload
FROM: Chat contract types mirror preload
TO: Chat contract is self-contained

### Requirement: Contract change does not implement use-cases or other hosts
FROM: Contract change does not implement use-cases or other hosts
TO: Contract documentation cleanup preserves runtime behavior

## MODIFIED Requirements

### Requirement: Model contract is self-contained
Ядро SHALL публиковать serializable DTO канонической поверхности `model`: `generate`, `stop`, `install`, `remove`, `list`. Этот OpenSpec и DTO `underlator-core/src/domain/` MUST быть самодостаточным источником полей и их смысла; внешний legacy source для чтения контракта MUST NOT требоваться.

#### Scenario: Generate request and unary result
- **WHEN** host сериализует generate call
- **THEN** payload MUST включать обязательные `model` и `prompt`, опциональные `system`, `temperature`, `max_tokens`, `num_predict`, `think`, `context`, а также provider config `id` и `url`
- **AND** unary completion MUST быть сконкатенированной строкой сгенерированного текста

#### Scenario: Install, remove, list, and stop payloads
- **WHEN** host сериализует install, remove, list или stop
- **THEN** install MUST использовать обязательное `name` и опциональные `tag`, `registry`, `insecure`, `id`, `url`
- **AND** remove MUST использовать обязательное `name` и опциональные `id`, `url`
- **AND** list MAY принимать `id` и `url`, а ответ MUST содержать `models` с `name`, `size`, `modified_at`
- **AND** stop MUST иметь пустое тело запроса
- **AND** install/remove unary results MUST содержать boolean `success`

#### Scenario: Manage-models requests carry UI base URL
- **WHEN** frontend manage models отправляет list/install/remove на настроенный Ollama base URL
- **THEN** serialized request MUST поддерживать этот `url` и provider `id`
- **AND** JSON-ключи provider config MUST оставаться `id` и `url`

### Requirement: Catalog contract is self-contained
Ядро SHALL публиковать serializable DTO канонической поверхности `catalog`: `get`, `search`, `getModelInfo`. Поля фильтров, snapshot и model card MUST полностью определяться этим контрактом и DTO ядра без обращения к внешнему legacy source.

#### Scenario: Get and search return a catalog snapshot
- **WHEN** host сериализует `catalog.get` или `catalog.search`
- **THEN** `get` MUST принимать optional `forceRefresh`
- **AND** `search` MUST принимать поля `search`, `type`, `localStatus`, size bounds, `category`, `tags`, `languages`, `architecture`, `format`, `license`, `author`, `minRating`, `minDownloads`, `recommendedOnly`, `availableOnly`, `sortBy`, `sortOrder`, `limit`, `offset`
- **AND** обе операции MUST использовать snapshot с `ollama`, `totalCount`, `lastUpdated`

#### Scenario: Model card and getModelInfo
- **WHEN** host сериализует `catalog.getModelInfo` или catalog model card
- **THEN** lookup request MUST содержать `modelName`
- **AND** model card MUST содержать `id`, `name`, `displayName`, `size`, `createdAt`, `modifiedAt`, `type` = `ollama`, `format`, `parameterSize`, `quantizationLevel` и задокументированные optional description/version/digest/tags/compatibility
- **AND** `getModelInfo` MUST допускать `null`, когда модель не найдена

### Requirement: Chat contract is self-contained
Ядро SHALL публиковать serializable DTO канонической поверхности `chat`: `create`, `get`, `update`, `delete`, `list`, `addMessage`. Структура chat/message, фильтров и ответов MUST читаться только из этого контракта и DTO ядра.

#### Scenario: Chat entity and message
- **WHEN** host сериализует chat или message
- **THEN** chat MUST содержать `id`, `title`, `messages`, `createdAt`, `updatedAt`, `defaultModel`
- **AND** message MUST содержать `id`, `role` (`user` | `assistant` | `system`), `content`, `timestamp`
- **AND** optional nested `model`, `context`, `metadata`, generation settings MUST сохранять документированный смысл

#### Scenario: Chat operation payloads
- **WHEN** host сериализует chat CRUD и `addMessage`
- **THEN** create MUST принимать `title`, `defaultModel` и optional `systemPrompt`, `generationSettings`, `metadata`, возвращая полный chat
- **AND** get MUST принимать `chatId` и optional `includeMessages`, `messageLimit`, `messageOffset`
- **AND** update MUST принимать `chatId` и optional patch fields, delete MUST принимать `chatId` и optional `createBackup`, `confirmed`, возвращая `deletedChatId`
- **AND** list MUST возвращать `chats`, `totalCount`, `pagination`, а addMessage MUST принимать `chatId`, `role`, `content` и возвращать `message` вместе с `updatedChat`

### Requirement: Unified progress event model
Ядро SHALL определять host-neutral progress events `model:generate-progress` и `model:install-progress`. Строковые имена MUST остаться стабильными; контракт MUST NOT встраивать IPC, WebSocket, SSE или Tauri emit в payload.

#### Scenario: Generate progress event
- **WHEN** generate stream emits a chunk
- **THEN** event identity MUST быть `model:generate-progress`
- **AND** payload MUST содержать `model`, `response`, `created_at`, `done` и optional duration/token/context поля DTO

#### Scenario: Install progress event
- **WHEN** model install emits progress
- **THEN** event identity MUST быть `model:install-progress`
- **AND** payload MUST содержать `status` (`downloading` | `verifying` | `writing` | `complete`), `name` и optional `size`, `total`, `digest`, `error`

### Requirement: JSON field names stay compatible with existing TypeScript types
Сериализация MVP DTO MUST сохранять имена полей, зафиксированные в этом OpenSpec и TypeScript-типах `react-app`, включая существующий смешанный camelCase / snake_case. Смена смысла или имён ключей MUST NOT быть частью удаления legacy host.

#### Scenario: Roundtrip keeps TypeScript key names
- **WHEN** representative payload сериализуется в JSON и десериализуется обратно
- **THEN** ключи `max_tokens`, `created_at`, `chatId`, `forceRefresh`, `displayName`, `totalCount` MUST сохраниться точно
- **AND** deserialized value MUST равняться исходному для этих полей

### Requirement: Naming map from IPC to use-case to HTTP path
Ядро SHALL публиковать каноническую naming map для всех 14 MVP-операций: стабильный IPC identifier → use-case identifier → HTTP method/path → Tauri command. Map MUST быть самодостаточной, MUST NOT добавлять операции и MUST NOT включать `rag.*` или `splash.*`.

#### Scenario: Complete MVP operation coverage
- **WHEN** разработчик инспектирует naming map
- **THEN** она MUST содержать `model:generate`, `model:stop`, `model:install`, `model:remove`, `model:list`, `catalog:get`, `catalog:search`, `catalog:get-model-info`, `chat:create`, `chat:get`, `chat:update`, `chat:delete`, `chat:list`, `chat:add-message`
- **AND** она MUST содержать события `model:generate-progress`, `model:install-progress`
- **AND** HTTP paths MUST находиться под `/api/model`, `/api/catalog`, `/api/chat`, а каждый IPC identifier MUST разрешаться ровно в один use-case identifier в тестах

### Requirement: Serialization works for both future hosts
Все MVP DTO и progress payloads SHALL быть JSON-serializable/deserializable для desktop и server hosts. Core MUST NOT зависеть от `tauri` или `axum`; host-specific envelope MUST NOT быть частью канонического core contract.

#### Scenario: Host-agnostic JSON
- **WHEN** `crates/underlator-core` инспектируется и contract payload кодируется в JSON
- **THEN** core dependencies MUST NOT включать `tauri` или `axum`
- **AND** JSON MUST быть пригоден без host-specific wrapper внутри core
- **AND** envelope вида `success` / `data` / `error` / `id` MUST NOT требоваться как часть core contract

### Requirement: Contract documentation cleanup preserves runtime behavior
Очистка документации и источника истины SHALL сохранить существующие use-cases, DTO, JSON-ключи, события и hosts без нового runtime behavior. Change MUST NOT добавлять routes, commands или use-cases и MUST NOT менять on-disk формат.

#### Scenario: Types without runtime behavior
- **WHEN** сравнивается поведение до и после удаления legacy references
- **THEN** generate/catalog/chat MUST использовать прежние contract DTO и JSON-ключи
- **AND** `underlator-server` routes и `underlator-tauri` commands MUST остаться прежними
- **AND** IPC/SSE names, retry/timeout defaults и chat storage version MUST остаться совместимыми
