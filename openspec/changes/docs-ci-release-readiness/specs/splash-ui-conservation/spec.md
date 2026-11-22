# Spec Delta

## MODIFIED Requirements

### Requirement: Splash entry points are conserved not deleted

Входные точки splash-цепочки (`SplashScreen` в `pages/main`, gating через `selectSplashVisible` / `selectSplashScreenState`, API `splash-screen-ipc` / вызовы `splash.*`, подписки на status/progress/complete/error, связанные dispatch/thunk) SHALL быть отключены на входной точке (comment-out / early-return / feature-flag), а не удалены. Каждая отключённая входная точка MUST иметь маркер `// TODO(splash): restoration not planned; requires new change + ADR update` (или эквивалентный `TODO(splash)` с той же семантикой).

#### Scenario: SplashScreen mount path is disabled
- **WHEN** разработчик инспектирует `Main` / mount path splash overlay
- **THEN** рендер/инициализация `SplashScreen`, которая запускает живые `splash.*` подписки, MUST быть отключена или сведена к no-op с `TODO(splash)`
- **AND** файлы компонента и стилей MUST оставаться в репозитории

#### Scenario: Splash IPC subscriptions are not live on MVP path
- **WHEN** MVP UI стартует на Tauri или HTTP после атома 6.2
- **THEN** MUST NOT быть обязательных живых подписок на `splash.onStatusUpdate` / `onProgressUpdate` / `onComplete` / `onError`, без которых UI не показывается
- **AND** код API/slice MAY оставаться с `TODO(splash)`

#### Scenario: Marker semantics block casual restoration
- **WHEN** разработчик читает маркер `TODO(splash)` у отключённой входной точки
- **THEN** текст MUST сообщать, что восстановление не планируется
- **AND** MUST требовать нового change и обновления ADR до возврата splash UI

### Requirement: Conserved splash code is discoverable via TODO markers

Все отключённые splash-входные точки SHALL оставаться помеченными маркером `TODO(splash)` (включая пояснение после двоеточия). Маркер MUST означать «restoration not planned, requires new change + ADR update», а не «restore when lands». Поиск по репозиторию `TODO(splash)` MUST находить заготовки.

#### Scenario: Repository search finds splash stubs
- **WHEN** разработчик выполняет поиск `TODO(splash)` по репозиторию
- **THEN** MUST находиться маркеры у отключённых входных точек splash (как минимум Main/overlay gate и IPC/bootstrap path)
- **AND** маркер MUST указывать на необходимость нового change и обновления ADR, а не на ожидание будущего lifecycle
