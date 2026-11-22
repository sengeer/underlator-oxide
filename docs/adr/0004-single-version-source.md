# ADR 0004: Единый источник версии продукта

- **Статус:** accepted
- **Дата:** 2026-11-22
- **Связанные документы:** `crates/underlator-tauri/tauri.conf.json`, `.github/workflows/release.yml`

## Контекст

Версия продукта хранится в нескольких носителях: конфигурация Tauri, npm-манифест, lockfile npm, workspace Cargo и lockfile Cargo. Ручное обновление каждого носителя приводит к рассинхронизации: desktop-артефакты и Tauri bundle читают `tauri.conf.json`, а release guard сравнивает тег с версией продукта. Отдельный `VERSION`-файл добавил бы шестой носитель без выгоды.

## Решение

Единственный источник версии продукта — поле `version` в `crates/underlator-tauri/tauri.conf.json`.

Производные носители:

- `react-app/package.json` — версия npm-пакета;
- `react-app/package-lock.json` — корневая версия и запись пакета `""`;
- `[workspace.package].version` в корневом `Cargo.toml` — версия Rust-крейтов;
- `Cargo.lock` — записи `underlator-core`, `underlator-server` и `underlator-tauri`.

`Cargo.lock` обновляется командой `cargo check --workspace`, а не ручной правкой. Release guard читает `version` из `tauri.conf.json`, снимает префикс `v` с тега и сравнивает значения; несовпадение останавливает workflow до сборки. Для `workflow_dispatch` guard не применяет тег и работает в build-only режиме.

## Последствия

- Обновление версии начинается с `tauri.conf.json`, затем синхронизируются производные носители.
- Расхождение версии в любом носителе считается дефектом синхронизации.
- Тег `v<version>` обязан совпадать с `tauri.conf.json`; тег создаёт и пушит человек.
- Release guard не зависит от двух схем версионирования: Rust-крейты используют ту же продуктовую версию.

## Рассмотренные альтернативы

- **`package.json` как источник.** Отклонено: desktop-артефакты и Tauri bundle уже читают `tauri.conf.json`.
- **Отдельный `VERSION`-файл.** Отклонено: шестой носитель без выгоды и с дополнительным шагом синхронизации.
- **Разные версии npm-пакета и Rust-крейтов.** Отклонено: release guard и документация зависят от одного продуктового значения.
