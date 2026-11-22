# Spec Delta

## Purpose

Задаёт содержимое модального окна About, которое показывает пользователю актуальные метаданные продукта, лицензию и связь с архивной Electron-версией.

## ADDED Requirements

### Requirement: About shows version from package metadata

Модальное окно About SHALL отображать версию из `react-app/package.json`, а не из захардкоженной строки. При обновлении версии в `package.json` окно MUST показывать новое значение без отдельных правок компонента.

#### Scenario: Displayed version follows package.json
- **WHEN** пользователь открывает About при версии `package.json` равной `0.2.0-beta`
- **THEN** окно MUST показать `0.2.0-beta`
- **AND** версия MUST NOT быть отдельной константой внутри компонента

### Requirement: About links active and archived repositories

About SHALL содержать описание продукта, ссылку на `https://github.com/sengeer/underlator-oxide` и отдельную строку про архивную Electron-версию `https://github.com/sengeer/underlator` с пометкой archived. Ссылка на архив MUST NOT выглядеть как ссылка на активную версию.

#### Scenario: Active repository link is present
- **WHEN** пользователь открывает About
- **THEN** MUST быть ссылка на `sengeer/underlator-oxide`
- **AND** клик по ней MUST открывать внешний URL безопасным способом

#### Scenario: Archived version is a separate line
- **WHEN** пользователь читает About
- **THEN** MUST быть отдельная строка про архивную Electron-версию со ссылкой на `sengeer/underlator`
- **AND** пометка archived MUST присутствовать в тексте или подписи ссылки

### Requirement: About shows author, contact, license and copyright

About SHALL показывать автора, контакт, лицензию `BSD-3-Clause + Branding` и копирайт с текущим годом. Значения MUST совпадать с метаданными репозитория и `LICENSE`.

#### Scenario: Metadata block is complete
- **WHEN** пользователь открывает About
- **THEN** MUST быть указаны автор `sengeer`, контакт `fox8911@gmail.com`, лицензия `BSD-3-Clause + Branding` и копирайт
- **AND** контакт MUST открываться как `mailto:`-ссылка

#### Scenario: License matches repository metadata
- **WHEN** сравнивается лицензия в About и `react-app/package.json`
- **THEN** строка лицензии MUST совпадать по смыслу с `BSD-3-Clause + Branding`
- **AND** About MUST NOT заявлять другую лицензию

### Requirement: About is localized with Lingui

Текстовые подписи About SHALL использовать Lingui (`Trans` / `t`). Change MUST NOT добавлять новые зависимости и MUST NOT выполнять FSD-рефакторинг сверх файла About и связанных строк локализации.

#### Scenario: User-visible strings are translatable
- **WHEN** проверяется разметка About
- **THEN** подписи MUST быть обёрнуты в Lingui-макросы или использовать `useLingui`
- **AND** новые npm-зависимости MUST NOT появляться в `package.json`

#### Scenario: Refactor stays inside About
- **WHEN** проверяется диф frontend
- **THEN** изменения MUST ограничиваться `react-app/src/pages/main/ui/about.tsx` и строками локализации
- **AND** перенос компонента в другой слой FSD MUST NOT выполняться
