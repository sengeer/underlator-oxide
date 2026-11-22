# Design

## Context

См. `proposal.md` — Why. Фактическое состояние, важное для подхода:

- `.github/workflows/` отсутствует: CI и release создаются с нуля.
- `docs/DESKTOP_TAURI.md` существует и отслеживается через исключение `.gitignore` (`/docs/*` + `!/docs/DESKTOP_TAURI.md`); документ написан по-русски, хотя по новой политике должен быть EN-каноном.
- Версия рассинхронизирована: `tauri.conf.json` и `react-app/package.json` — `0.1.0-beta`, `package-lock.json` — `0.1.0-beta`, workspace `Cargo.toml` — `0.1.0`.
- README содержит RAG как фичу, а ссылки badge/`repository.url` ведут на архивный `sengeer/underlator` (в RU-версии — ещё и на несуществующий `underlator/underlator`).
- About уже читает версию из `package.json` и ссылается на `underlator-oxide`, но не содержит описания, лицензии и строки про архивную Electron-версию.
- `TODO(rag)` (21 вхождение) и `TODO(splash)` (9 вхождений) существуют; модули консервации на месте.
- `.rules/*` и `.docs/*` сами находятся под `.gitignore`; этот change правит их в рабочем дереве, но не меняет политику их отслеживания.
- `scripts/rename-desktop-artifacts.sh` уже умеет канонические имена и остаётся ручным путём; `bundle.targets` — `["appimage","dmg"]`.

## Goals / Non-Goals

**Goals:**

- Зафиксировать продуктовые решения в ADR и убрать двусмысленность «pending backlog» из правил, комментариев и спек.
- Сделать документацию читаемой внешним пользователем: EN-канон + RU-зеркало, корректные ссылки, фактический feature list.
- Сделать версию предсказуемой: один источник, синхронные носители, честный CHANGELOG.
- Дать воспроизводимые CI/release workflows, которые не подменяют ручную приёмку платформы.

**Non-Goals:**

- Не менять runtime, DTO, routes/commands, `docker/`, `bundle.targets` и консервированные RAG/splash модули.
- Не публиковать релиз, не создавать и не пушить тег, не добавлять подпись/нотаризацию.
- Не переводить macOS/Windows в `verified` по факту CI-сборки.
- Не создавать план V2, roadmap или этапы 8+; не переписывать тело/журнал V1.
- Не добавлять frontend-зависимости и не рефакторить FSD сверх About.

## Decisions

### D1. Embedded Ollama manager и splash — dropped, не backlog

Записывается ADR `docs/adr/0001-embedded-ollama-and-splash-dropped.md`. Причина: возможное SaaS-направление и отказ от привязки к одному инференсу; splash существует только ради ожидания embedded runtime. Формулировки «later», «после MVP» и «restore when lands» удаляются из актуальных правил, комментариев и спек (архивные change не редактируются). Альтернатива «оставить в backlog» отклонена: она создаёт ложное ожидание и провоцирует агентов вернуть UI без исследования.

### D2. RAG — deferred, не «todo»

ADR `docs/adr/0002-rag-deferred.md`: базовый pipeline уже был пройден в Electron; семантика и мультимодальность — отдельная исследовательская задача. RAG не входит в backlog ближайших релизов; возврат требует нового change, ADR update и исследования. Альтернатива «пометить как todo» отклонена: todo подразумевает запланированную работу, а здесь нужен отдельный research-цикл.

### D3. Версия `0.2.0-beta`, single source — `tauri.conf.json`

ADR `docs/adr/0004-single-version-source.md`. `crates/underlator-tauri/tauri.conf.json` — единственный источник; `react-app/package.json`, корневая запись `react-app/package-lock.json`, `[workspace.package].version` в `Cargo.toml` и записи `underlator-*` в `Cargo.lock` — производные. Release guard сравнивает тег `v<version>` с `tauri.conf.json`. `Cargo.lock` обновляется `cargo check`/`cargo metadata`, а не ручной правкой.

Альтернативы: `package.json` как источник отклонён, потому что desktop-артефакты и Tauri bundle уже читают `tauri.conf.json`; отдельный `VERSION`-файл отклонён как шестой носитель без выгоды. Версия Rust-крейтов меняется на `0.2.0-beta` вместе с workspace, чтобы release guard не зависел от двух схем версионирования.

### D4. Docs policy: EN — канон, RU — зеркало

ADR `docs/adr/0003-documentation-language-policy.md`. `docs/DESKTOP_TAURI.md` переводится на английский и остаётся каноническим путём; `docs/DESKTOP_TAURI_RU.md` — полное RU-зеркало текущего содержания. Оба файла получают переключатель языка; `README.md` ссылается на EN, `README_RU.md` — на RU. Команды, native prerequisites, troubleshooting и матрица `verified`/`unverified` синхронны; версия в примерах обновляется на `0.2.0-beta`, строки матрицы не меняются.

Альтернатива «оставить один RU-файл» отклонена: спеки и внешние читатели ожидают EN-канон. Альтернатива «два независимых документа» отклонена: она быстро расходится; изменение сначала вносится в EN, затем зеркалится в RU.

### D5. ADR — tracked `docs/adr/`, точечные `!`-исключения

ADR добавляются в `docs/adr/` с числовыми именами (`0001…0004`). В `.gitignore` после `/docs/*` и существующего `!/docs/DESKTOP_TAURI.md` добавляются:

```gitignore
!/docs/DESKTOP_TAURI_RU.md
!/docs/adr/
!/docs/adr/**
```

Проверка: `git check-ignore -v` для ADR и RU-доки не должен подтверждать ignore, а `git status` должен видеть файлы. Альтернатива « force-add без исключений» отклонена: следующая правка снова спрячет файлы; альтернатива «перенести docs из-под игнора» шире скоупа.

### D6. Консервация: маркеры остаются, семантика меняется

`TODO(rag)` и `TODO(splash)` остаются в коде и находятся поиском. Текст маркеров и delta-спеки меняются на «restoration not planned; requires new change + ADR update». Модули, слайсы, API и стили не удаляются и не оживляются. Это позволяет сохранить исторический код, но убирает сигнал «скоро вернём».

### D7. CI: quality gate на трёх ОС, tauri-check отдельно

Workflow `ci.yml`:

| Job | Runner | Содержание |
| --- | --- | --- |
| `frontend` | матрица `ubuntu-24.04`, `macos-latest`, `windows-latest` | Node 22 + npm cache, `HUSKY=0`; `npm run type:check` → `lint` → `test` → `build` |
| `rust` | та же матрица | stable + cache; `cargo check --workspace`; `cargo test -p underlator-core` (включая architecture); `cargo clippy -p underlator-core -- -D warnings` |
| `tauri-check` | только `ubuntu-24.04` | native deps (`libwebkit2gtk-4.1-dev`, `libgtk-3-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`, `patchelf`); `cargo check -p underlator-tauri --features desktop` |

Триггеры — `push` и `pull_request`; `permissions: contents: read`. Frontend и Rust jobs не требуют native deps, поэтому идут на всех ОС. Tauri-check не входит в обязательную матрицу: без GTK/WebKit он не имеет смысла, но его падение видно как отдельный job. Кэш Rust — официальный `actions/cache@v4` по `~/.cargo/registry`, `~/.cargo/git` и `target` с ключом от `Cargo.lock`; сторонний rust-cache не добавляется без необходимости.

**Метки macOS-раннеров (2026).** `macos-14` больше не provisioning-ится: GitHub отвечает `The configuration 'macos-14-arm64-us-default' is not supported`. Актуальные GitHub-hosted метки: arm64 — `macos-latest`, `macos-15`, `macos-26`; Intel — `macos-15-intel`, `macos-26-intel`. Используем `macos-latest` (arm64), чтобы не привязываться к версии macOS; job всё равно собирает `aarch64-apple-darwin`. Убирать macOS из матрицы не нужно — меняется только метка.

**CI-стабилизация (следствие зелёного gate 7.7 на трёх ОС).** Чтобы `cargo check --workspace` и `cargo test -p underlator-core` проходили на раннерах без GTK/WebKit и на Windows, добавлены две точечные правки вне документации: (1) `crates/underlator-tauri/Cargo.toml` — `tauri-plugin-opener` становится `optional` и входит в фичу `desktop`, поэтому workspace-проверки без native deps не тянут плагин, а `tauri-check` по-прежнему проверяет desktop-сборку; (2) `crates/underlator-core/src/adapters/out/http/tests.rs` — тест недоступного endpoint допускает `CoreError::HttpTimeout` наряду с сетевыми/конфигурационными ошибками, потому что закрытый порт на Windows-раннере может приводить к таймауту. Продакшн-код, DTO, routes и commands не меняются; это плата за воспроизводимость CI, а не расширение функциональности.

### D8. Release: guard → draft → матрица ассетов, публикация вручную

Workflow `release.yml`:

- Триггеры: `push` тега `v*` и `workflow_dispatch` (build-only, без release).
- `permissions: contents: write`.
- Job `guard`: снимает `v` с тега, читает `version` из `crates/underlator-tauri/tauri.conf.json` (python3 на ubuntu/macos; на windows — PowerShell `ConvertFrom-Json` либо тот же python из setup-python) и падает при несовпадении. Для `workflow_dispatch` guard не применяет тег и собирает версию из `tauri.conf.json`.
- Job `create-draft` (только для тега): `gh release create "$TAG" --draft --title "Underlator $VERSION" --notes-file <changelog extract>`; idempotent-проверка существующего draft.
- Job `build` (матрица): собирает артефакт и прикрепляет его к draft через `gh release upload "$TAG" <asset> --clobber`. Для `workflow_dispatch` вместо release загружает workflow artifacts.
- Матрица и команды:

| Runner | Команда | Ассет |
| --- | --- | --- |
| `ubuntu-24.04` | `cargo tauri build --features desktop --bundles appimage` | `Underlator-<version>-linux-x86_64.AppImage` |
| `macos-latest` (arm64) | `cargo tauri build --features desktop --target aarch64-apple-darwin --bundles dmg` | `Underlator-<version>-macos-arm64.dmg` |
| `windows-latest` | `cargo tauri build --features desktop --no-bundle` + zip | `Underlator-<version>-win-x64-portable.zip` |

`bundle.targets` остаётся `["appimage","dmg"]`; Windows собирается через `--no-bundle`, `.exe` упаковывается в zip. NSIS/MSI/`.deb` не добавляются. Канонические имена формируются явными шагами (CI знает точные пути сборки); `scripts/rename-desktop-artifacts.sh` остаётся ручным путём и не обязателен в CI.

Перед сборкой каждый release job ставит Node 22 и выполняет `npm ci` в `react-app` с `HUSKY=0`, затем ставит `tauri-cli` 2.x (`cargo install tauri-cli --version "^2" --locked` или кэшированный бинарь). Ubuntu-job дополнительно ставит те же native packages, что и `tauri-check` (`libwebkit2gtk-4.1-dev`, `libgtk-3-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`, `patchelf`); macOS-job выполняет `rustup target add aarch64-apple-darwin`. `beforeBuildCommand` собирает React; отдельный `npm run build` в CI не дублируется.

CI-сборка не является приёмкой: macOS/Windows остаются `unverified` до отдельного ручного smoke. Это же правило фиксируется в release notes.

### D9. CHANGELOG: история неизменна, новая запись сверху

`## [0.1.0-beta] - 2026-02-03` остаётся как история legacy Electron-релиза. Добавляется `## [0.2.0-beta] - <дата change>` со scope: Rust core + dual-mode, отсутствие RAG/splash/embedded, CI/релизы. Дата берётся из даты выполнения change; в V1-плане используется та же дата в строке `CLOSED at 7.1 (<дата>)`.

### D10. About: Lingui, без новых зависимостей

`about.tsx` остаётся в `pages/main/ui`. Версия уже берётся из `package.json`; добавляются описание, отдельная строка про архивную Electron-версию, лицензия `BSD-3-Clause + Branding` и подписи через `Trans`/`useLingui`. Внешние ссылки используют существующий `handleOpenExternal` (Tauri opener + browser fallback). Новые пакеты и перенос компонента в другой слой FSD не выполняются.

### D11. README и ссылки

- Удаляется RAG-пункт из обоих feature-списков; manage models по URL не переписывается.
- Раздел legacy-чатов сохраняется, но переформулируется без намёка на доступный RAG.
- `license-url`, `release-url` и `repository.url` переводятся на `sengeer/underlator-oxide`; архивный `https://github.com/sengeer/underlator` добавляется отдельной строкой с пометкой archived и «только история».
- EN/RU выравниваются по структуре, регистру автора (`sengeer`) и одинаковым ссылкам.

### D12. V1 plan: только строка статуса

В шапку `.docs/ARCHITECTURAL_PLAN_TAURI_RUST_DUAL_MODE_V1.md` добавляется `CLOSED at 7.1 (<дата>)`. Тело, этапы, журнал и `openspec/changes/archive/**` не редактируются; V2 не создаётся. `.docs` и `.rules` остаются вне git-отслеживания по существующей политике — правки в них локальные и не меняют `.gitignore` для этих каталогов. Поэтому durable-часть указателей живёт в tracked `openspec/config.yaml`: в его `context` фиксируется CLOSED-статус V1, источник истины контракта (`mvp-api-contract` + DTO `underlator-core/src/domain/`) и `docs/adr/` как место post-migration решений; строка про ветку `migrate/rust-core` из `.rules/экскурсия.md` удаляется.

## Risks / Trade-offs

- **EN-перевод desktop-доки может разойтись с RU** → EN считается источником, RU проверяется по структуре, командам и матрице; в tasks есть явная сверка.
- **Release workflow на macOS/Windows может упасть из-за подписи/окружения** → сборка без signing/notarization; артефакты остаются draft, а провал job виден; `verified` не обещается.
- **`cargo tauri build` требует tauri-cli и native deps** → CLI ставится в job; Ubuntu получает пакеты из спеки; macOS/Windows полагаются на предустановленные WebView2/Xcode CLT.
- **Windows zip-шаг чувствителен к пути `.exe`** → путь фиксируется от `target/release` (workspace target) и проверяется `Test-Path` до упаковки; при отсутствии — job падает.
- **Bump workspace-версии может затронуть lockfile шире ожидаемого** → `Cargo.lock` принимается только с изменениями версий `underlator-*`; `cargo check --workspace` подтверждает.
- **`.rules`/`.docs` не попадут в git** → это осознанно: они остаются локальными инструкциями; change не меняет политику ignore. ADR и RU-дока — tracked.
- **CI-сборка может быть принята за `verified`** → отдельное требование и текст в docs/release notes; матрица не меняется.
- **About-ссылки в Tauri требуют opener-права** → используется существующий `@tauri-apps/plugin-opener` и fallback; новых capability не добавляется.

## Migration Plan

1. ADR + docs policy + `.gitignore` исключения; проверить `git check-ignore`.
2. Версия `0.2.0-beta` во всех носителях + CHANGELOG-запись; `cargo check` обновляет lockfile.
3. README/README_RU, EN/RU desktop-дока, About.
4. Переклассификация `.rules`, `.docs`, `openspec/config.yaml` (context), stub-комментариев, V1-статус и указателей на план/ветку.
5. CI workflow, затем release workflow; локальная YAML-валидация.
6. Ручные gate: зелёный `ci.yml` после пуша ветки; draft release с тремя ассетами после пуша тега человеком.

Rollback: изменения docs/метаданных обратимы git-ом; workflows удаляются без влияния на продукт; версия откатывается синхронно во всех носителях. Runtime и данные не затрагиваются.

## Open Questions

Нет: все решения, влияющие на спеки, задачи и подход, зафиксированы выше.
