# react-backend-client Specification

## Purpose
Даёт `react-app` единый клиент MVP `model` / `catalog` / `chat` для двух официальных режимов: HTTP/SSE (docker/server) и Tauri (desktop). Инкапсулирует выбор транспорта и сохраняет канонические DTO и операции ядра без прямой зависимости виджетов от host.

## Requirements

### Requirement: BackendClient exposes the core MVP surface
`react-app` SHALL предоставлять `BackendClient` с фасадами `model`, `catalog`, `chat` и 14 операциями MVP, канонически определёнными в `mvp-api-contract` и DTO `underlator-core`. Входные и выходные JSON-ключи MUST сохранить смешанный camelCase / snake_case без переименования. Успешные унарные ответы MUST быть телами контракта ядра без host-specific envelope. Клиент MUST NOT включать `rag.*` или `splash.*` в MVP surface.

#### Scenario: Model catalog and chat operations are present
- **WHEN** разработчик инспектирует публичный контракт `BackendClient`
- **THEN** MUST быть все 14 операций карты MVP (`model:generate` … `chat:add-message`)
- **AND** MUST быть подписки на события `model:generate-progress` и `model:install-progress`
- **AND** MUST NOT быть методов `rag.*` или `splash.*`

#### Scenario: Generate payload keys stay compatible
- **WHEN** вызывается `model.generate`
- **THEN** тело MUST содержать обязательные `model` и `prompt`, опциональные поля генерации (`system`, `temperature`, `max_tokens`, `num_predict`, `think`, `context`) и конфиг провайдера `id` / `url`
- **AND** унарный успех MUST быть сконкатенированной строкой текста по контракту ядра

### Requirement: HTTP transport uses REST and SSE from server 3.1
HTTP-транспорт SHALL выполнять унарные операции через `fetch` на маршруты `/api/model`, `/api/catalog` и `/api/chat` (метод и путь как в карте имён ядра). `model.generate` и `model.install` MUST потреблять Server-Sent Events (`text/event-stream`), а не WebSocket. Имена SSE-событий прогресса MUST быть `model:generate-progress` и `model:install-progress`; поле `data` MUST разбираться как JSON DTO ядра. Успешное завершение потока MUST приниматься по SSE-событию `result` (строка для generate, `{ "success": true }` для install). `model.stop` MUST оставаться унарным `POST /api/model/stop`. HTTP-ошибки с JSON `{ "class", "message" }` MUST становиться ошибкой клиента; обрыв SSE без события `result` MUST считаться неуспехом, а не тихим успехом.

#### Scenario: Generate streams named SSE events
- **WHEN** выбран HTTP-транспорт и вызывается валидный `model.generate`
- **THEN** клиент MUST открыть `POST /api/model/generate` с `Accept` потока событий
- **AND** MUST доставить подписчикам кадры `model:generate-progress` с ключами `model`, `response`, `created_at`, `done`
- **AND** Promise generate MUST разрешиться текстом из финального события `result`
- **AND** MUST NOT открывать WebSocket для прогресса

#### Scenario: Install streams progress then unary success
- **WHEN** выбран HTTP-транспорт и вызывается валидный `model.install`
- **THEN** кадры MUST приходить как SSE `model:install-progress` с полем `status`
- **AND** успешное завершение MUST соответствовать `{ "success": true }` в событии `result`

#### Scenario: Unary catalog and chat use REST JSON
- **WHEN** выбран HTTP-транспорт и вызываются `catalog.get`, `catalog.search`, `catalog.getModelInfo` или CRUD чата / `addMessage`
- **THEN** клиент MUST использовать пути и методы карты (`GET /api/catalog`, `POST /api/catalog/search`, `GET /api/catalog/models/:name`, `POST|GET /api/chat`, `GET|PATCH|DELETE /api/chat/:id`, `POST /api/chat/:id/messages`)
- **AND** успешный разбор MUST дать JSON с ключами ядра (`ollama` / `totalCount` / `lastUpdated` для каталога; `id` / `title` / `messages` для чата)
- **AND** `getModelInfo` при JSON `null` MUST вернуть отсутствие модели, а не ошибку «не найдено»

#### Scenario: HTTP error body is classified
- **WHEN** сервер отвечает 4xx/5xx с телом `{ "class": "not_found", "message": "..." }`
- **THEN** операция `BackendClient` MUST завершиться ошибкой, сохраняющей класс и сообщение
- **AND** MUST NOT маскировать это как успешный `IpcResponse`

#### Scenario: Stop cancels in-flight HTTP generate
- **WHEN** идёт активный generate по SSE и вызывается `model.stop`
- **THEN** клиент MUST выполнить `POST /api/model/stop`
- **AND** операция generate MUST завершиться без новых успешных токенов (ошибка класса `cancelled` или закрытие потока)

#### Scenario: SSE close without result is failure
- **WHEN** HTTP generate/install закрывает поток без события `result` и без успешного унарного тела
- **THEN** Promise операции MUST быть отклонён
- **AND** MUST NOT возвращать пустую строку как успешную генерацию

### Requirement: Tauri transport is a typed client skeleton
SHALL существовать типизированный Tauri-транспорт, чьи имена команд и событий MUST совпадать с картой ядра. Транспорт MUST выполнять рабочие `invoke` и `listen` против живого `underlator-tauri`, без silent fallback на другой host. Отсутствие Tauri runtime или незарегистрированной команды MUST завершаться явной ошибкой внутри выбранного транспорта.

#### Scenario: Tauri command names follow the core map
- **WHEN** разработчик инспектирует Tauri-транспорт
- **THEN** каждая из 14 MVP-операций MUST отображаться на `tauri_command` из карты ядра
- **AND** progress MUST слушаться по IPC-именам событий ядра

#### Scenario: Live host invoke succeeds without HTTP fallback
- **WHEN** выбран Tauri-транспорт, runtime доступен и host зарегистрировал MVP commands
- **THEN** унарные операции и generate/install MUST идти через `invoke` / events host
- **AND** `TauriTransport` MUST NOT выполнять `fetch` к `/api/model|catalog|chat` или обращаться к legacy host API

#### Scenario: Unwired host does not fake success
- **WHEN** выбран Tauri-транспорт, но runtime invoke недоступен или команда не зарегистрирована
- **THEN** операция MUST завершиться классифицированной ошибкой
- **AND** MUST NOT выполняться silent fallback на HTTP или иной транспорт внутри `TauriTransport`

### Requirement: Transport is selected by flag or runtime detect
Выбор транспорта SHALL учитывать явный `VITE_BACKEND_MODE` (`http` | `tauri`). Если флаг пуст, клиент MUST выбрать Tauri при наличии Tauri globals и HTTP иначе. Явный флаг MUST побеждать auto-detect. Legacy-значение `electron` MUST давать понятную ошибку конфигурации до создания клиента и до сетевых/IPC вызовов; silent fallback на HTTP или Tauri запрещён. Остальные runtime rules MUST NOT восстанавливать detect по legacy globals.

#### Scenario: Explicit http mode wins
- **WHEN** задано `VITE_BACKEND_MODE=http`
- **THEN** MVP-вызовы MUST идти через HTTP-транспорт независимо от доступных runtime globals

#### Scenario: Tauri is detected without flag
- **WHEN** флаг режима пуст и доступны Tauri runtime globals (`__TAURI_INTERNALS__` и/или `__TAURI__`)
- **THEN** MUST быть выбран Tauri-транспорт

#### Scenario: Explicit tauri mode wins
- **WHEN** задано `VITE_BACKEND_MODE=tauri`
- **THEN** MVP-вызовы MUST идти через Tauri-транспорт
- **AND** MUST NOT быть вызовов HTTP `/api/*` из этого выбора

#### Scenario: Electron is detected without flag
- **WHEN** воспроизводится прежняя среда с legacy host global, пустым флагом и без Tauri globals
- **THEN** legacy global MUST быть проигнорирован и MUST быть выбран HTTP-транспорт
- **AND** MUST NOT создаваться удалённый legacy transport или читаться его API

#### Scenario: Default without hosts is HTTP
- **WHEN** флаг режима пуст и Tauri globals отсутствуют
- **THEN** MUST быть выбран HTTP-транспорт без чтения legacy host API

#### Scenario: Removed explicit mode fails closed
- **WHEN** задано `VITE_BACKEND_MODE=electron`
- **THEN** создание клиента MUST завершиться ошибкой с указанием поддерживаемых режимов `http` / `tauri` и варианта пустого флага
- **AND** MUST NOT быть HTTP, Tauri или legacy IPC вызова как скрытого fallback

### Requirement: Existing generate and chat call sites use BackendClient
`feature-provider`, `use-model`, chat API и settings model/catalog/test helpers SHALL выполнять MVP-операции через `BackendClient`. Активный React-код MUST NOT зависеть от глобальной декларации `Window.electron`. Conserved RAG/splash-заготовки MAY сохранять изолированный legacy access под `TODO(rag)` / `TODO(splash)`, но MUST NOT становиться транспортом MVP или живым обязательным путём UI.

#### Scenario: Feature provider generate goes through the client
- **WHEN** выполняется чат, инструкция, простой или контекстный перевод через `feature-provider`
- **THEN** `generate` и подписка на прогресс MUST идти через `BackendClient.model`
- **AND** активные обработчики MUST NOT обходить клиент через legacy host API

#### Scenario: Use-model stop goes through the client
- **WHEN** пользователь останавливает активную генерацию через `use-model`
- **THEN** MUST вызываться `BackendClient.model.stop`

#### Scenario: Chat CRUD goes through the client
- **WHEN** slice, helper или виджет создаёт, читает, обновляет, удаляет чат или добавляет сообщение
- **THEN** операция MUST выполняться через `BackendClient.chat` напрямую или через тонкую обёртку chat API
- **AND** совместимые Redux-обёртки результатов MAY сохраняться без обхода клиента

#### Scenario: MVP UI does not invoke live rag surfaces
- **WHEN** пользователь работает в MVP UI на Tauri или HTTP
- **THEN** видимые действия MUST NOT инициировать живые вызовы `rag.*`
- **AND** код `rag.*` MAY оставаться с маркерами `TODO(rag)` и локальными legacy-типами

#### Scenario: MVP UI does not wait on live splash surfaces
- **WHEN** пользователь стартует MVP UI на Tauri или HTTP
- **THEN** показ основного UI MUST NOT требовать `splash.*` lifecycle
- **AND** код `splash.*` MAY оставаться с маркерами `TODO(splash)` и локальными legacy-типами

#### Scenario: No global legacy host declaration is required
- **WHEN** frontend компилируется после удаления legacy transport
- **THEN** активный MVP-код и conserved modules MUST компилироваться без глобального `Window.electron`
- **AND** conserved modules MUST сохранить свои маркеры и не потребовать BackendClient-операций вне MVP

### Requirement: Widgets do not import transports
Слой FSD widgets SHALL зависеть только от публичного `BackendClient` / shared API фасадов. Виджеты и pages MUST NOT импортировать конкретные transport-модули. Клиент catalog/model в settings MUST использовать shared-клиент, а не host globals.

#### Scenario: Settings catalog does not touch transport modules
- **WHEN** виджет settings загружает каталог, ставит или удаляет модель
- **THEN** виджет MUST вызывать shared API / `BackendClient`
- **AND** файл виджета MUST NOT импортировать HTTP или Tauri transport-модуль

#### Scenario: Chat widget does not import transports
- **WHEN** виджет chat выполняет CRUD через свой slice
- **THEN** импорты виджета MUST NOT указывать на transport-модули
- **AND** MUST оставаться допустимым импорт shared API / типов чата

### Requirement: Change stays inside the React client atom
Удаление legacy host SHALL сохранить публичную модель `BackendClient` для оставшихся HTTP/Tauri режимов и существующую FSD-структуру ipc-сегмента. Change MUST NOT добавлять Tauri commands, server routes, RAG/splash runtime, новые DTO или бизнес-логику ядра и MUST NOT откатывать реструктуризацию ipc-сегмента 6.3.

#### Scenario: No host or DTO expansion
- **WHEN** удаление legacy transport завершено
- **THEN** `underlator-server` MVP paths и SSE-имена MUST остаться прежними
- **AND** `underlator-tauri` MUST NOT получить новые MVP commands
- **AND** JSON-ключи DTO ядра и операции `BackendClient` для HTTP/Tauri MUST остаться совместимыми

### Requirement: BackendClient passes provider url for manage-models operations
Публичный `BackendClient.model` SHALL принимать provider config (`id` / `url`) для `list`, `install`, `remove`; catalog-операции из manage-models MUST также прокидывать config, когда он задан в settings. HTTP и Tauri транспорты MUST сериализовать эти поля без отбрасывания. Hardcoded `Embedded Ollama` на границе клиента MUST NOT использоваться.

#### Scenario: List install remove include settings url
- **WHEN** settings содержат `Ollama` с url `http://127.0.0.1:11434` и id `ollama`, и UI вызывает list/install/remove через `BackendClient`
- **THEN** исходящий запрос MUST содержать этот `url` и `id` (или эквивалент контракта)
- **AND** MUST NOT подставляться Embedded Ollama как provider id

#### Scenario: Catalog manage-models path forwards url
- **WHEN** manage models загружает каталог через `BackendClient.catalog`
- **THEN** клиент MUST передать url (+ id) из активных provider settings, если они заданы
- **AND** виджеты MUST NOT импортировать транспорты напрямую
