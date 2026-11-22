# Spec Delta

## MODIFIED Requirements

### Requirement: RAG settings section is hidden in MVP

Экран settings SHALL NOT показывать секцию **RAG configuration** (topK, similarity threshold, chunk size, manage embedding models) в MVP UI. Поля и обработчики MAY оставаться в коде как заготовки с `// TODO(rag): restoration not planned; requires new change + ADR update` (или эквивалентным `TODO(rag)` с той же семантикой).

#### Scenario: RAG configuration is not visible
- **WHEN** пользователь открывает settings в MVP UI
- **THEN** заголовок/секция RAG configuration и связанные поля topK / similarity threshold / chunk size / manage embedding models MUST NOT отображаться
- **AND** MUST NOT быть видимой кнопки, открывающей manage embedding models из этой секции

#### Scenario: RAG settings code is conserved
- **WHEN** разработчик ищет секцию RAG configuration в исходниках settings
- **THEN** разметка/логика секции MUST оставаться в репозитории (comment-out или эквивалентная консервация)
- **AND** MUST присутствовать маркер `TODO(rag)`, указывающий, что восстановление не планируется и требует нового change и обновления ADR

### Requirement: Conserved RAG code is discoverable via TODO markers

Все отключённые RAG-входные точки SHALL оставаться помеченными маркером `TODO(rag)` (включая пояснение после двоеточия). Маркер MUST означать «restoration not planned, requires new change + ADR update», а не «restore when lands». Поиск по репозиторию `TODO(rag)` MUST находить заготовки. Модули `rag-ipc`, типы и константы RAG/embedding MUST NOT удаляться.

#### Scenario: Repository search finds RAG stubs
- **WHEN** разработчик выполняет поиск `TODO(rag)` по репозиторию
- **THEN** MUST находиться как минимум маркеры у chat attach/upload, RAG settings и embedding-models входных точек
- **AND** файлы `shared/apis/rag-ipc` (или их эквивалент) MUST оставаться в дереве исходников

#### Scenario: Marker semantics block casual restoration
- **WHEN** разработчик читает маркер `TODO(rag)` у отключённой входной точки
- **THEN** текст MUST сообщать, что восстановление не планируется
- **AND** MUST требовать нового change и обновления ADR до возврата RAG UI в MVP-путь
