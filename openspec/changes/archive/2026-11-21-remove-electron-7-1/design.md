# Design

## Context

Текущее дерево содержит два действующих host и legacy-путь: `BackendClient` уже имеет HTTP/Tauri реализации и `ElectronTransport`, а `detectTransport` принимает `http | electron | tauri` и читает `window.electron`. Глобальный `@types/global.d.ts` объединяет MVP, splash и translation APIs в одном `Window.electron`. При этом большая часть MVP call sites уже переведена на `getBackendClient()`: в частности, `widgets/settings/tests/model-ipc.ts` и `chat-ipc.ts` не требуют повторной архитектурной миграции.

RAG/splash законсервированы не только комментариями: отключены входные точки UI, а модули всё ещё компилируются и содержат latent legacy access. Поэтому удаление глобальной декларации требует типовой изоляции заготовок, но не их реализации или удаления. Есть и мёртвый после выпила транспорта код: `electron-transport.ts`, его типы/тесты и `unwrapIpcResponse` в `utils/errors.ts`.

Фактическая конфигурация подтверждает границы решения:

- Fedora 44 AppImage отмечен `verified`; macOS arm64 и Windows 11 — `unverified`, матрицу менять нельзя.
- Архивные 6.1–6.4 завершены, включая пользовательские отметки 1.6/2.4/3.5/4.6 в 6.4.
- desktop хранит чаты в `{app_data_dir или UNDERLATOR_DATA_DIR}/chats/`; docker — в `/data/chats/`; имя файла `{id}.chat.json` и формат версии `0.1.0` совместимы.
- `scripts/rename-desktop-artifacts.sh` и `docker/` не зависят от `electron-app`; `.dockerignore` содержит одну такую ссылку. В `.github/*` и корневом `scripts/*` активных ссылок не найдено.
- `react-app/package.json` содержит `react:build`, `scripts/move-build-to-electron.js` и keyword `electron`, но не прямую Electron-зависимость. `electron-to-chromium` в lockfile — транзитивная зависимость browserslist, не legacy host.

Мотивация и gates — в `proposal.md`; нормативное поведение — в delta `react-backend-client`, `mvp-api-contract`, `rust-workspace`, `tauri-thin-host`, `desktop-tauri-build`.

## Goals / Non-Goals

**Goals:**

- Оставить один frontend с детерминированным выбором HTTP/Tauri и без глобального legacy host contract.
- Сделать удаление обратимым через git, не сохраняя второй полноценный backend в рабочем дереве.
- Разделить обязательную pre-removal parity приёмку и post-change regression smoke, сохранив доказательства обеих.
- Сохранить консервацию RAG/splash, FSD-защиту и контрактную совместимость при чистке названий и документации.

**Non-Goals:**

- Не вводить replacement API для RAG/splash/menu translation и не переносить их в `BackendClient`.
- Не менять runtime Rust, DTO, routes/commands, SSE/IPC strings, on-disk layout или retry/timeout defaults.
- Не производить автоматический перенос пользовательских данных и не обещать миграцию RAG vectors/Ollama binaries.
- Не переписывать исторические atom-specific specs без изменения их текущего требования и не выполнять общий FSD naming refactor.

## Decisions

### D1. Сначала живой Tauri parity, затем необратимая часть удаления

Перед `git rm -r electron-app` и удалением frontend transport выполняется pre-removal parity на реальном `underlator-tauri` с живым Ollama. Можно использовать `cargo tauri dev` или уже собранный AppImage; способ фиксируется в результате. Закрытая Fedora-матрица является отдельным shipping-доказательством и не заменяется этим повторным контрольным прогоном; наоборот, повторный `tauri dev` не отменяет необходимость уже имеющегося AppImage evidence.

**Чеклист happy-path:**

| Surface | Обязательные сценарии и наблюдаемый результат |
| --- | --- |
| `model` | `list` возвращает установленные модели; `generate` даёт progress events и финальную конкатенированную строку; `stop` завершает активный stream без новых успешных токенов; `install`/`remove` выполняются на заранее выбранной безопасной тестовой модели с progress и `{ success: true }` |
| `catalog` | `get` возвращает `ollama`/`totalCount`/`lastUpdated`; `search` применяет фильтры; `getModelInfo` возвращает карточку существующей модели и `null` отсутствующей; запросы используют `id`/`url` settings |
| `chat` | create → list → get → update → addMessage прогоняются на отдельном тестовом чате; после перезапуска host чат и сообщение читаются из `chats/*.chat.json`; delete завершается без RAG и при необходимости создаёт backup по контракту |
| transport | Без флага в Tauri runtime выбирается Tauri; UI не использует HTTP fallback и не требует legacy globals; основной UI стартует без splash IPC и RAG |

**Чеклист основных ошибок:** недоступный Ollama/неизвестная модель дают классифицированную ошибку без фиктивного success; unknown chat id → `not_found`; отмена generate → cancellation или эквивалент контракта; обрыв потока не считается успешным; `getModelInfo` отсутствующей модели остаётся `null`, а не ошибкой.

Для каждого пункта записываются дата, SHA, команда/artifact, URL Ollama, выбранная модель, pass/fail и краткое evidence (ответ, класс ошибки, путь persisted файла). `blocked` или отсутствие выполнения не эквивалентно `pass`; при fail удаление останавливается до исправления. Unit/mock могут объяснять причину, но не закрывать пункт.

После удаления выполняется сокращённый regression smoke на тех же реальных режимах: desktop Tauri — generate/stop/list, catalog get/search, chat CRUD/persist; docker server HTTP — те же MVP happy-path плюс один classified error. Результаты помещаются в `ACCEPTANCE.md` change или непосредственно в отмеченные пункты `tasks.md`.

### D2. `electron-app/` удаляется; recovery — annotated git tag `legacy-electron`

Перед удалением создаётся локальный annotated tag `legacy-electron` на последнем commit, где `electron-app/` ещё присутствует. Tag фиксирует SHA в acceptance; существующий одноимённый tag сначала проверяется и не перезаписывается молча. Затем каталог удаляется из рабочего дерева через git. Публикация tag/ветки и release не входят в scope.

Выбрано удаление вместо папки `archive/`: архивная копия продолжала бы попадать в поиск, tooling и code review как третий host, а git уже хранит полный код. Отдельная long-lived branch избыточна для одноразовой точки восстановления и требует поддержания выбора базовой ветки. Tag дешевле и делает восстановление явным: `git checkout legacy-electron -- electron-app` вместе с revert остальных частей change.

### D3. Выбор транспорта: `http|tauri` → Tauri globals → HTTP; legacy flag — fail-fast

`BackendMode` сужается до `'http' | 'tauri'`. `DetectTransportGlobals` больше не содержит legacy global. Фабрика создаёт только HTTP/Tauri клиенты; public index сохраняет прежний фасад и не экспортирует конкретные транспорты.

Для `VITE_BACKEND_MODE=electron` выбран **fail-fast**: `detectTransport` выбрасывает `BackendError` с сообщением, что режим удалён, допустимы `http`, `tauri` или пустой флаг для auto-detect. Ошибка возникает до invoke/fetch. Это безопаснее silent HTTP fallback, который может отправить чувствительный prompt не туда, и понятнее автоматического Tauri fallback в неподходящем runtime. Альтернатива «warning + HTTP» отклонена как скрытая смена host; альтернатива «сохранить совместимый ElectronTransport» противоречит цели атома.

Прочие непустые неизвестные значения сохраняют прежнюю auto-detect семантику, чтобы не расширять breaking change; документируются только два поддерживаемых явных значения. `VITE_BACKEND_MODE=electron` выделяется отдельно как узнаваемая устаревшая конфигурация.

### D4. RAG/splash — вариант A: модули остаются, типы становятся локальными

Глобальный `Window.electron` удаляется полностью. Для заготовок вводятся узкие structural types и accessor’ы рядом с владельцем кода, без глобального augmentation:

- `pages/main/types/splash-screen-ipc.ts`: типы `LegacySplashApi` / `LegacySplashWindow` для `pages/main/apis/splash-screen-ipc.ts` и `ui/splash-screen.tsx`;
- `shared/apis/rag-ipc/types/legacy-rag-ipc.ts`: типы `LegacyRagApi`, envelopes и window snapshot для `rag-ipc.ts`;
- локальные типы рядом с `widgets/settings/tests/rag-ipc.ts` только для операций, которые этот helper действительно сохраняет;
- `shared/lib/utils/chat-handlers/types/legacy-rag-ipc.ts` или re-export из shared RAG types — для восстанавливаемого commented snippet, без нового runtime import в no-op путь;
- `shared/lib/hooks/use-electron-translation/types/legacy-desktop-ipc.ts`: минимальный translation API для текущего best-effort no-op; имя хука можно сохранить как conserved compatibility surface без расширения области.

Доступ выполняется через локальную переменную/functional accessor, например `getLegacySplashApi()` или `legacyWindow.electron`, а не через глобально типизированное `window.electron`. Это типизирует старый код, но не возвращает его в MVP-путь. `TODO(rag)` и `TODO(splash)` обязательны; закомментированные entry points не активируются.

**Вариант B — удалить RAG/splash modules:** отклонён, потому что ломает принятые 6.1/6.2, стирает путь восстановления 7.2 и делает поиск `TODO(rag)`/`TODO(splash)` бесполезным.

**Вариант C — оставить `Window.electron` или глобальный `any` до 7.2:** отклонён, потому что сохраняет видимость поддерживаемого host в каждом TypeScript module и скрывает места, которые после удаления runtime невозможны. Локальные типы явно показывают, что legacy bridge существует только как conserved implementation detail.

### D5. Settings и conserved helpers меняются точечно

- `widgets/settings/constants/electron.ts` переименовывается в `provider.ts` (или `ollama.ts`, если при чтении импортов это точнее); модуль и JSDoc получают provider-neutral имена. Значения `DEFAULT_CONFIG` не меняются.
- `electronSlice` → `modelIpcSlice`/`providerSlice` без смены `createSlice.name`, Redux state key, persisted state, actions и reducer semantics. Импорты и `widgets/settings/types/model-ipc.ts` обновляются на BackendClient/Ollama terminology.
- `widgets/settings/tests/chat-ipc.ts` уже идёт через `chatIpc`: сохраняется эта цепочка к `BackendClient.chat`, меняются только устаревшие IPC/Electron описания. `model-ipc.ts` уже использует `getBackendClient()` и не переписывается.
- RAG test helper остаётся законсервированным. Его latent generate переводится на `BackendClient.model`, поскольку это MVP-операция; сами RAG-операции сохраняют локальные legacy types и не добавляются в BackendClient. Test UI не активируется.
- `use-electron-translation` сохраняет safe no-op при отсутствии bridge; новый Tauri command/menu channel не добавляется. JSDoc активного MVP-кода (`feature-provider`, chat DTO wrappers, shared constants) меняется на core/BackendClient terminology без переименования DTO.

### D6. Electron-only код и тесты удаляются, защитные тесты перестраиваются

Удаляются `transports/electron-transport.ts`, `types/electron-transport.ts`, `transports/electron-transport.test.ts`, legacy case фабрики/detect и нигде более не используемый `unwrapIpcResponse` с его приватным envelope helper. Общий `BackendError` и HTTP body handling остаются; тест «без класса → internal» сохраняется под host-neutral именем.

Тестовая матрица после выпила:

- `detect-transport.test.ts`: explicit http/tauri, Tauri internals/global detect, empty globals → http, legacy global игнорируется, `VITE_BACKEND_MODE=electron` → понятный throw без transport creation;
- `index.test.ts`: public client surface остаётся, никакие конкретные transports не экспортируются; отдельная проверка отсутствия legacy удаляется вместе с самим понятием из публичного теста, а общая защита не ослабляется;
- `fsd-boundaries.test.ts`: сохраняет обход widgets/pages и запрет любых `transports/` imports; regex проверяет generic path + http/tauri, а не только перечень существовавших файлов;
- `wire-sites.test.ts`: MVP helpers и chat/settings идут через BackendClient; для RAG/splash проверяются существование модулей, TODO markers и отключённые live entry points, а не присутствие `electron.*` как желаемая архитектура;
- `electron-transport.test.ts`: удаляется целиком вместо тестируемой функциональности, а не остаётся skipped.

Эти unit-тесты дополняют D1 и не заменяют живые smoke.

### D7. Репозиторий, документация и источник истины обновляются синхронно

Удаляются `react:build`, `move-build-to-electron.js` и keyword `electron`. Lockfile не подчищается вручную: `electron-to-chromium` остаётся как разрешённая транзитивная зависимость. `.dockerignore` теряет запись удалённого каталога; `.gitignore` получает neutral frontend comment. `.github`, корневые scripts и docker сверяются, но не правятся без фактических ссылок; `rename-desktop-artifacts.sh` явно остаётся без функциональных изменений.

README и README_RU получают:

- два официальных запуска: desktop Tauri и `docker compose` server;
- актуальные storage roots: Tauri app data dir либо override, docker `/data`;
- отсутствие automatic legacy migration и короткую инструкцию ручного переноса при закрытых приложениях: backup → скопировать только `chats/*.chat.json` в новый `<StorageRoot>/chats/` после проверки backup; RAG vectors/binaries не переносить;
- отсутствие stale активных Embedded/RAG инструкций там, где затрагиваемый абзац описывает текущий MVP.

`docs/DESKTOP_TAURI.md` сохраняет таблицу 227–235 дословно по смыслу и статусам; удаляются только third-mode строка и будущий gate. Закрытый gate MAY быть кратко упомянут как историческое доказательство 7.1.

`CONTRIBUTING.md` заменяет Electron Service Layer правила на Rust traits + hex layers + thin hosts; `SECURITY.md` только проверяется, так как упоминаний нет. В `.rules/*` убираются временный транспорт, leftover-каталог и preload как источник. `openspec/config.yaml` получает путь `.docs/ARCHITECTURAL_PLAN_TAURI_RUST_DUAL_MODE_V1.md` и источник `mvp-api-contract` + DTO `underlator-core/src/domain/`.

Main specs обновляются через пять delta из этого change. `openspec/api-contract` не используется: канонический id — `mvp-api-contract`. Purpose секции delta не меняют по правилам OpenSpec, поэтому после supported sync основных specs в apply отдельно актуализируются Purpose у `react-backend-client`, `mvp-api-contract` и `desktop-tauri-build`; затем выполняется strict validation. Пустые deltas для `hexagonal-core`, `mvp-use-cases`, `rag-ui-conservation` и других не создаются: их поведение не меняется, а оставшиеся atom-scoped упоминания рассматриваются только при финальном аудите как явная история, либо требуют отдельного пересмотра до завершения change.

### D8. Rust — только host-neutral rustdoc и имена тестов, контракт заморожен

Переформулируются русские комментарии в `domain/contract.rs`, `domain/events.rs`, `domain/model/dto.rs`, `domain/catalog/static_library.rs`, `adapters/out/fs/chat_store.rs`, `adapters/out/http/config.rs`, `adapters/out/ollama/config.rs`, `lib.rs`; тесты `*_match_electron*` получают имена `*_match_contract`/`*_stable*`. Теперь ссылки говорят о стабильном MVP-контракте, а не об удалённом source.

Запрещено менять значения `IPC`/SSE names, DTO serde keys, `CHAT_FILE_VERSION`/`CHAT_VERSION`, `0.1.0`, retries=3, timeout/delay values, provider defaults и chat paths. Изменение имени теста не должно менять assertions. Любой обнаруженный Rust diff вне comments/test names считается выходом за scope. После такого diff обязательны workspace check, core tests с architecture linter и clippy `-D warnings`; server/Tauri tests запускаются, если их файлы фактически затронуты.

## Risks / Trade-offs

- [Legacy global есть у пользователя, и HTTP fallback молча меняет получателя prompt] → такой global игнорируется только при auto-detect; явный legacy flag получает fail-fast с инструкцией.
- [Install/remove parity удалит нужную модель или займёт много места] → заранее выбрать отдельную маленькую тестовую модель и cleanup; не отмечать сценарий pass при пропуске.
- [RAG/splash начнут выполняться через latent accessors] → сохранить отключённые entry points и TODO; wire tests проверяют отсутствие live вызова, smoke стартует без этих APIs.
- [Удаление глобальных типов оставит hidden compile errors вне основного UI] → прогнать typecheck всего `react-app`, а не только ipc tests; локальные типы покрывают conserved/settings modules.
- [Защитные тесты исчезнут вместе Electron cases] → generic FSD/wire assertions обязательны и сравниваются с прежним покрытием в review.
- [Чистка комментариев случайно изменит контракт] → diff-аудит разрешённых Rust lines + core serialization/event/storage tests, без изменения literals.
- [Tag уже существует или указывает не на legacy-код] → остановиться до удаления и разрешить конфликт; не force-tag.
- [Документация поднимет macOS/Windows до verified без машины] → diff-check неизменной матрицы и отдельные acceptance records только для реально запущенных платформ.
- [Ручной перенос повредит чаты] → приложения закрыть, backup обязателен, копировать только chat JSON; автоматический merge/overwrite не выполняется.
- [Потеря кода при удалении каталога] → annotated tag + git history; отказ от параллельной archive-копии осознанно уменьшает активное дерево ценой зависимости восстановления от git.

## Migration Plan

1. Подтвердить зафиксированные входные доказательства 5.2/6.1–6.4 и записать baseline SHA. Выполнить D1 pre-removal live parity; при fail остановиться до удаления.
2. Проверить/создать `legacy-electron` tag. Затем удалить frontend transport/flag/global types, перевести conserved modules на локальные типы и перестроить тесты. Прогнать быстрый typecheck до удаления каталога.
3. Удалить `electron-app/`, Electron-only script/package metadata и точечные repo references. Не менять docker runtime, Tauri commands или desktop artifact rename script.
4. Обновить docs/rules/OpenSpec context, host-neutral Rust comments и delta/main specs. Выполнить статические проверки и полные unit/Rust suites в объёме фактического diff.
5. Запустить post-change desktop Tauri и docker server smoke, записать результаты и scope scan. Change считается завершённым только при pass обязательных пунктов.

**Rollback:** до acceptance — отменить рабочий diff; после commit — revert весь change. При необходимости восстановить legacy tree из `legacy-electron`, но не откатывать или перезаписывать пользовательские data dirs. Откат не включает автоматическую обратную миграцию файлов.

## Open Questions

1. **Удалить `electron-app/` или архивировать (папка / ветка / тег)?** Решение этого design по умолчанию: удалить рабочее дерево и сохранить annotated tag `legacy-electron`; папка и long-lived branch отклонены. От владельца репозитория остаётся подтверждение имени tag, если требуется иной процесс recovery. Альтернатива меняет только шаг сохранения ссылки и не требует новых продуктовых specs.
2. **Что делать при `VITE_BACKEND_MODE=electron` после выпила?** Выбран fail-fast без fallback; это уже отражено в delta и не должно молча меняться при apply. Открытым остаётся только product sign-off формулировки ошибки. Если вместо этого потребуется fallback, delta `react-backend-client` и D3 нужно пересмотреть до реализации.
3. **Нужна ли пользователям Electron-версии заметка о переносе данных?** По умолчанию — да, короткая заметка обязательна в README и README_RU, а автоматическая миграция явно не выполняется. Не решён лишь вопрос о будущем отдельном подробном руководстве/скрипте: это отдельный продуктовый change, в 7.1 не реализуется.
